'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { hash } from 'bcryptjs';

export type UserDTO = {
    id: string;
    email: string;
    created_at: string;
    hasTeam: boolean;
    teamName?: string;
};

export async function getUsersList(): Promise<{ success: boolean, users?: UserDTO[], error?: string }> {
    try {
        const adminSupabase = createAdminClient();
        const supabase = await createClient(); // Normal client for Teams query

        // 1. Get All Users
        const { data: { users }, error } = await adminSupabase.auth.admin.listUsers();
        if (error) return { success: false, error: error.message };

        // 2. Get All Teams
        const { data: teams } = await supabase.from('teams').select('user_id, name');
        const teamMap = new Map();
        teams?.forEach(t => teamMap.set(t.user_id, t.name));

        // 3. Map
        const userList: UserDTO[] = users.map(u => ({
            id: u.id,
            email: u.email || 'No Email',
            created_at: u.created_at,
            hasTeam: teamMap.has(u.id),
            teamName: teamMap.get(u.id)
        }));

        return { success: true, users: userList };
    } catch (e: any) {
        return { success: false, error: e.message || 'Failed to list users. Check Service Key.' };
    }
}

export async function createTeamForUser(userId: string, teamName: string) {
    const supabase = await createClient(); // We can use normal client if RLS allows specific INSERT? 
    // Actually, creating a team usually requires being THAT user in RLS.
    // Admin override: we might need to use adminSupabase to insert into 'teams' if RLS blocks us.
    // Let's assume we can use Service Role for insertion to bypass RLS "auth.uid() = user_id".

    // Check if team exists
    const { data: existing } = await supabase.from('teams').select('id').eq('user_id', userId).single();
    if (existing) return { success: false, error: 'User already has a team.' };

    const adminSupabase = createAdminClient();

    // Default password for Admin created teams? Or let user set it?
    // Let's set a default '123456' and tell them to change it, or just null?
    // User creation flow uses specific password.

    const hashedPassword = await hash('123456', 10);

    const { error } = await adminSupabase.from('teams').insert({
        user_id: userId,
        name: teamName,
        password: hashedPassword,
        credits_left: 1000,
        league_id: (await getLeagueId(supabase))
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
}

async function getLeagueId(supabase: any) {
    const { data } = await supabase.from('leagues').select('id').limit(1).single();
    if (data) return data.id;
    // create one
    const { data: newL } = await supabase.from('leagues').insert({ name: 'Serie A' }).select('id').single();
    return newL?.id;
}

export async function deleteUser(userId: string) {
    try {
        const adminSupabase = createAdminClient();
        const supabase = await createClient();

        // 1. Check/Delete Team first (Clean up data)
        const { data: team } = await supabase.from('teams').select('id').eq('user_id', userId).single();
        if (team) {
            const { deleteTeam } = await import('@/app/actions/admin');
            await deleteTeam(team.id);
        }

        // 2. Delete User from Auth
        const { error } = await adminSupabase.auth.admin.deleteUser(userId);
        if (error) throw error;

        return { success: true };
    } catch (e: any) {
        console.error('Delete User Error:', e);
        return { success: false, error: e.message };
    }
}
