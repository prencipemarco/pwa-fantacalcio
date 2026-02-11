'use server'

import { createClient } from '@/utils/supabase/server';

export async function getNextMatchday(leagueId: string) {
    // Logic to determine next matchday
    // Since we don't have timestamps, we find the first matchday where 'calculated' is false?
    // Or we just assume it based on current week?

    const supabase = await createClient();

    // Find first fixture that is NOT calculated
    const { data } = await supabase
        .from('fixtures')
        .select('matchday')
        .eq('league_id', leagueId)
        .eq('calculated', false)
        .order('matchday', { ascending: true })
        .limit(1)
        .single();

    if (data) {
        return data.matchday;
    }
    return null; // Season finished?
}

export async function getMyTeamId() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('teams').select('id, name').eq('user_id', user.id).single();
    return data;
}

export async function getMyTeam(userId: string) {
    const supabase = await createClient();
    // Use limit(1) to avoid error if multiple teams (e.g. admin seeded)
    const { data } = await supabase.from('teams').select('*').eq('user_id', userId).limit(1);
    return data && data.length > 0 ? data[0] : null;
}

export async function getMyRoster(teamId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('rosters')
        .select(`
      *,
      player:players(*)
    `)
        .eq('team_id', teamId);
    return data;
}
// ... existing imports
import { hash, compare } from 'bcryptjs';
import { cookies } from 'next/headers';

import { logEvent } from './admin';

export async function createTeam(name: string, password: string) {
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
        return { error: 'Not authenticated' };
    }

    const userId = sessionData.session.user.id;

    // Create league if not exists (single league MVP)
    const { data: leagues } = await supabase.from('leagues').select('*').limit(1);
    let leagueId;

    if (leagues && leagues.length > 0) {
        leagueId = leagues[0].id;
    } else {
        const { data: newLeague } = await supabase.from('leagues').insert({ name: 'Serie A League' }).select().single();
        if (newLeague) leagueId = newLeague.id;
    }

    const hashedPassword = await hash(password, 10);

    const { data, error } = await supabase
        .from('teams')
        .insert({
            user_id: userId,
            league_id: leagueId,
            name: name,
            password: hashedPassword,
            credits_left: 1000
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    await logEvent('TEAM_CREATED', { teamName: name, teamId: data.id }, userId);

    return { success: true, teamId: data.id };
}

export async function buyPlayer(teamId: string, playerId: number, price: number) {
    const supabase = await createClient();

    // Check credits
    const { data: team } = await supabase.from('teams').select('credits_left, user_id, name').eq('id', teamId).single();
    if (!team || team.credits_left < price) {
        return { error: 'Not enough credits' };
    }

    // Check if player already owned (unique constraint handles this partly, but good to check)
    // Add to roster
    const { error } = await supabase.from('rosters').insert({
        team_id: teamId,
        player_id: playerId,
        purchase_price: price
    });

    if (error) return { error: error.message };

    // Deduct credits
    await supabase.from('teams').update({ credits_left: team.credits_left - price }).eq('id', teamId);

    // Get player name for logs
    const { data: player } = await supabase.from('players').select('name').eq('id', playerId).single();

    await logEvent('PLAYER_BOUGHT', {
        teamName: team.name,
        playerName: player?.name,
        price
    }, team.user_id);

    return { success: true };
}

export async function searchPlayers(query: string = '', filters?: { role?: string, team?: string }, excludeTaken: boolean = false) {
    const supabase = await createClient();

    let excludedIds: number[] = [];
    if (excludeTaken) {
        // 1. Get Owned Players
        const { data: rosterData } = await supabase.from('rosters').select('player_id');
        if (rosterData) excludedIds.push(...rosterData.map(r => r.player_id));

        // 2. Get Active Auctions
        const { data: auctionData } = await supabase.from('auctions').select('player_id').eq('status', 'OPEN');
        if (auctionData) excludedIds.push(...auctionData.map(a => a.player_id));
    }

    let queryBuilder = supabase.from('players').select('*').order('quotation', { ascending: false }).limit(100);

    if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    }

    if (filters?.role && filters.role !== 'ALL') {
        queryBuilder = queryBuilder.eq('role', filters.role);
    }

    if (filters?.team && filters.team !== 'ALL') {
        queryBuilder = queryBuilder.eq('team_real', filters.team);
    }

    if (excludedIds.length > 0) {
        queryBuilder = queryBuilder.not('id', 'in', `(${excludedIds.join(',')})`);
    }

    const { data } = await queryBuilder;
    return data || [];
}

export async function verifyTeamPassword(teamId: string, password: string) {
    const supabase = await createClient();
    const { data: team } = await supabase.from('teams').select('password').eq('id', teamId).single();

    if (!team || !team.password) {
        return { success: false, error: 'Team not found or no password set' };
    }

    const isValid = await compare(password, team.password);

    if (isValid) {
        // Set session cookie for this team
        const cookieStore = await cookies();
        cookieStore.set(`team_unlocked_${teamId}`, 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        });
        return { success: true };
    } else {
        return { success: false, error: 'Invalid password' };
    }
}

export async function checkTeamUnlocked(teamId: string) {
    const cookieStore = await cookies();
    return cookieStore.has(`team_unlocked_${teamId}`);
}

export async function getTeams() {
    const supabase = await createClient();
    const { data } = await supabase.from('teams').select('id, name');
    return data || [];
}
