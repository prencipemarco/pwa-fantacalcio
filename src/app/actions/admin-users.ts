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
        const supabase = await createClient(); 

        const { data: { users }, error } = await adminSupabase.auth.admin.listUsers();
        if (error) return { success: false, error: error.message };

        const { data: teams } = await supabase.from('teams').select('user_id, name');
        const teamMap = new Map();
        teams?.forEach(t => teamMap.set(t.user_id, t.name));

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
    const supabase = await createClient();
    const { data: existing } = await supabase.from('teams').select('id').eq('user_id', userId).single();
    if (existing) return { success: false, error: 'User already has a team.' };

    const adminSupabase = createAdminClient();

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
    const { data: newL } = await supabase.from('leagues').insert({ name: 'Serie A' }).select('id').single();
    return newL?.id;
}

export async function deleteUser(userId: string) {
    const adminSupabase = createAdminClient();
    // Use adminSupabase for EVERYTHING to bypass RLS and visibility issues
    let progress = 'Start';

    try {
        progress = 'Checking Team (Admin)';
        // 1. Get Team ID (Admin Level)
        const { data: team } = await adminSupabase.from('teams').select('id').eq('user_id', userId).maybeSingle();

        if (team) {
            const teamId = team.id;
            progress = 'Cleaning Team Data ' + teamId;

            // A. Lineups (Cascade via lineups)
            const { data: lineups } = await adminSupabase.from('lineups').select('id').eq('team_id', teamId);
            if (lineups && lineups.length > 0) {
                const lineupIds = lineups.map(l => l.id);
                await adminSupabase.from('lineup_players').delete().in('lineup_id', lineupIds);
                await adminSupabase.from('lineups').delete().in('id', lineupIds);
            }

            // B. Rosters
            await adminSupabase.from('rosters').delete().eq('team_id', teamId);

            // C. Trade Proposals
            await adminSupabase.from('trade_proposals').delete().or(`proposer_team_id.eq.${teamId},receiver_team_id.eq.${teamId}`);

            // D. Auctions (Winner reset)
            await adminSupabase.from('auctions').update({ current_winner_team_id: null }).eq('current_winner_team_id', teamId);
            // D2. Auctions (Created by team)
            await adminSupabase.from('auctions').delete().eq('team_id', teamId); 

            // E. Fixtures (Unlink)
            await adminSupabase.from('fixtures').update({ home_team_id: null }).eq('home_team_id', teamId);
            await adminSupabase.from('fixtures').update({ away_team_id: null }).eq('away_team_id', teamId);

            // F. Delete Team
            progress = 'Deleting Team Row ' + teamId;
            const { error: teamDelError } = await adminSupabase.from('teams').delete().eq('id', teamId);
            if (teamDelError) throw new Error('Team Delete Failed: ' + teamDelError.message);
        } else {
             // Fallback: Delete any orphan team with this user_id
             await adminSupabase.from('teams').delete().eq('user_id', userId);
        }

        // 2. Clean up User-linked data (Service Role)
        const tablesToClean = [
            'push_subscriptions',
            'logs',
            'notifications',
            'profiles',
            'users' // distinct from auth.users, usually public.users
        ];

        for (const table of tablesToClean) {
            progress = 'Cleaning ' + table + ' (Admin)';
            try {
                // Determine ID column: 'users' and 'profiles' use 'id', others use 'user_id'
                const idColumn = (table === 'profiles' || table === 'users') ? 'id' : 'user_id';
                await adminSupabase.from(table).delete().eq(idColumn, userId);
            } catch (err) {
                 // Ignore
            }
        }

        progress = 'Deleting Auth User';
        // 3. Delete User from Auth
        const { error } = await adminSupabase.auth.admin.deleteUser(userId);

        if (error) {
            progress = 'Auth Delete Failed: ' + error.message;
            console.error('Auth Delete Error Details:', error);
            throw error;
        }

        return { success: true };
    } catch (e: any) {
        console.error('Delete User Failed at [' + progress + ']:', e);
        return { success: false, error: 'Failed at ' + progress + ': ' + (e.message || JSON.stringify(e)) };
    }
}
