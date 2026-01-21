'use server'

import { createClient } from '@/utils/supabase/server';
import { PlayerImport, RosterImport, VoteImport } from '@/lib/fantacalcio/parsers';

export async function importPlayers(players: PlayerImport[]) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('players')
        .upsert(players, { onConflict: 'id' });

    if (error) {
        console.error('Error importing players:', error);
        return { success: false, error: error.message };
    }
    return { success: true, count: players.length };
}

export async function importRosters(rosters: RosterImport[]) {
    const supabase = await createClient();

    const { data: teams } = await supabase.from('teams').select('id, name');
    if (!teams) return { success: false, error: 'No teams found' };

    const { data: players } = await supabase.from('players').select('id, name');
    if (!players) return { success: false, error: 'No players found' };

    const dbRosters = [];
    const errors = [];

    for (const r of rosters) {
        const team = teams.find(t => t.name.toLowerCase().trim() === r.team_name.toLowerCase().trim());
        const player = players.find(p => p.name.toLowerCase().trim() === r.player_name.toLowerCase().trim());

        if (team && player) {
            dbRosters.push({
                team_id: team.id,
                player_id: player.id,
                purchase_price: r.price
            });
        } else {
            errors.push(`Could not match: ${r.team_name} - ${r.player_name}`);
        }
    }

    if (dbRosters.length > 0) {
        const { error } = await supabase
            .from('rosters')
            .upsert(dbRosters, { onConflict: 'team_id, player_id' });

        if (error) return { success: false, error: error.message, details: errors };
    }

    return { success: true, count: dbRosters.length, errors };
}

export async function importVotes(votes: VoteImport[], matchday: number) {
    const supabase = await createClient();

    const dbVotes = votes.map(v => ({
        ...v,
        matchday
    }));

    const { error: deleteError } = await supabase
        .from('match_stats')
        .delete()
        .eq('matchday', matchday);

    if (deleteError) return { success: false, error: deleteError.message };

    const { error } = await supabase
        .from('match_stats')
        .insert(dbVotes);

    if (error) return { success: false, error: error.message };

    return { success: true, count: dbVotes.length };
}

export async function generateCalendar(leagueId: string) {
    const supabase = await createClient();

    // 1. Fetch teams
    const { data: teams } = await supabase.from('teams').select('id').eq('league_id', leagueId);

    if (!teams || teams.length < 2) {
        return { success: false, error: 'Need at least 2 teams to generate calendar.' };
    }

    // Berger Algorithm
    const n = teams.length;
    // Explicitly cast
    const teamIds: string[] = teams.map((t: { id: string }) => t.id);
    const totalRounds = (n - 1) * 2;
    const matchesPerRound = n / 2;

    if (n % 2 !== 0) {
        return { success: false, error: 'Even number of teams required for this algorithm.' };
    }

    const rounds: { home: string; away: string }[][] = [];

    let movingTeams = [...teamIds];

    for (let round = 0; round < n - 1; round++) {
        const roundMatches: { home: string; away: string }[] = [];
        for (let i = 0; i < matchesPerRound; i++) {
            const home = movingTeams[i];
            const away = movingTeams[n - 1 - i];
            roundMatches.push({ home, away });
        }
        rounds.push(roundMatches);

        // Rotate
        const last = movingTeams.pop();
        if (last) movingTeams.splice(1, 0, last);
    }

    // Generate Fixtures database records
    const dbFixtures: { league_id: string; matchday: number; home_team_id: string; away_team_id: string }[] = [];

    // Target 38 matchdays (Serie A standard)
    const TOTAL_MATCHDAYS = 38;
    const roundsPerLeg = n - 1;

    for (let day = 1; day <= TOTAL_MATCHDAYS; day++) {
        // Calculate which round index (0 to n-2) this day corresponds to
        const roundIndex = (day - 1) % roundsPerLeg;

        // Calculate leg index (0 = 1st leg, 1 = 2nd leg, 2 = 3rd leg...)
        const legIndex = Math.floor((day - 1) / roundsPerLeg);

        // Determine if we swap Home/Away (Standard: Leg 0=Standard, Leg 1=Swap, Leg 2=Standard...)
        const swapHomeAway = legIndex % 2 !== 0;

        const roundMatches = rounds[roundIndex];

        roundMatches.forEach(match => {
            dbFixtures.push({
                league_id: leagueId,
                matchday: day,
                home_team_id: swapHomeAway ? match.away : match.home,
                away_team_id: swapHomeAway ? match.home : match.away
            });
        });
    }

    // Insert
    // Check if calendar exists?
    const { count } = await supabase.from('fixtures').select('*', { count: 'exact', head: true }).eq('league_id', leagueId);
    if (count && count > 0) {
        return { success: false, error: 'Calendar already exists for this league.' };
    }

    const { error } = await supabase.from('fixtures').insert(dbFixtures);

    // ... existing code
    if (error) return { success: false, error: error.message };
    return { success: true, count: dbFixtures.length };
}

// System Logs
export async function logEvent(action: string, details: any = {}, userId?: string) {
    const supabase = await createClient();
    await supabase.from('logs').insert({
        action,
        details,
        user_id: userId || null
    });
}

export async function getLogs() {
    const supabase = await createClient();
    const { data } = await supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(100);
    return data || [];
}

// Reset Functionality
export type ResetOptions = {
    market: boolean;
    rosters: boolean;
    teams: boolean;
    calendar: boolean;
    votes: boolean;
    players: boolean;
    logs: boolean;
};

export async function resetSystem(options: ResetOptions) {
    const supabase = await createClient();
    const { market, rosters, teams, calendar, votes, players } = options;

    try {
        // Order matters for Foreign Key constraints

        // 1. Lineup Players (Depends on Lineups, Players)
        if (teams || calendar || players) {
            // Needed if deleting teams (lineups gone), calendar (lineups gone) or players
            await supabase.from('lineup_players').delete().neq('id', 0);
        }

        // 2. Lineups (Depends on Fixtures, Teams)
        if (teams || calendar) {
            await supabase.from('lineups').delete().neq('id', 0);
        }

        // 3. Trade Proposals & Auctions (Depends on Teams, Players)
        if (market || teams || players) {
            await supabase.from('trade_proposals').delete().neq('id', 0);
            await supabase.from('auctions').delete().neq('id', 0);
        }

        // 4. Rosters (Depends on Teams, Players)
        if (rosters || teams || players) {
            await supabase.from('rosters').delete().neq('id', 0);
        }

        // 5. Fixtures (Depends on League, but Teams ref it)
        if (calendar) {
            // Delete fixtures completely
            await supabase.from('fixtures').delete().neq('id', 0);
        } else if (teams) {
            // If deleting teams but keeping calendar, we must unlink teams
            await supabase.from('fixtures').update({ home_team_id: null, away_team_id: null, home_goals: 0, away_goals: 0 }).neq('id', 0);
        }

        // 6. Match Stats (Votes) (Depends on Players)
        if (votes || players) {
            await supabase.from('match_stats').delete().neq('id', 0);
        }

        // 7. Teams (Depends on Users, League)
        if (teams) {
            await supabase.from('teams').delete().neq('name', 'placeholder_impossible_name');
        }

        // 8. Players (Root dependency)
        if (players) {
            await supabase.from('players').delete().neq('id', 0);
        }

        // 9. Logs
        if (options.logs) {
            await supabase.from('logs').delete().neq('id', 0);
        }

        await logEvent('RESET_SYSTEM', { options, timestamp: new Date() });
        return { success: true };

    } catch (error: any) {
        console.error('Reset error:', error);
        return { success: false, error: error.message || 'Unknown error during reset' };
    }
}

// Deprecated but kept if needed, or remove? I will remove resetAllTeams as it's replaced.
// export async function resetAllTeams() ...

export async function getAllTeams() {
    const supabase = await createClient();
    // Fetch teams with user email if possible (need join on auth.users which is restricted usually, so maybe just team info)
    const { data } = await supabase.from('teams').select('*, user_id').order('name', { ascending: true });
    return data || [];
}
// Single Team Deletion
export async function deleteTeam(teamId: string) {
    const supabase = await createClient();

    try {
        // 1. Lineup Players (via Lineups)
        const { data: lineups } = await supabase.from('lineups').select('id').eq('team_id', teamId);
        if (lineups && lineups.length > 0) {
            const lineupIds = lineups.map(l => l.id);
            await supabase.from('lineup_players').delete().in('lineup_id', lineupIds);
            await supabase.from('lineups').delete().in('id', lineupIds); // Delete lineups themselves
        }

        // 2. Rosters
        await supabase.from('rosters').delete().eq('team_id', teamId);

        // 3. Trades (As proposer or receiver)
        await supabase.from('trade_proposals').delete().or(`proposer_team_id.eq.${teamId},receiver_team_id.eq.${teamId}`);

        // 4. Auctions (Clear bids only, don't delete auctions if they are won by this team? 
        // If team won auction, auction should ideally reset or deleted? 
        // Let's reset winner to null so player returns to market or stays closed without winner.)
        await supabase.from('auctions').update({ current_winner_team_id: null }).eq('current_winner_team_id', teamId);

        // 5. Fixtures (Unlink)
        await supabase.from('fixtures').update({ home_team_id: null }).eq('home_team_id', teamId);
        await supabase.from('fixtures').update({ away_team_id: null }).eq('away_team_id', teamId);

        // 6. Delete Team
        const { error } = await supabase.from('teams').delete().eq('id', teamId);

        if (error) throw error;

        await logEvent('DELETE_TEAM', { teamId, timestamp: new Date() });
        return { success: true };

    } catch (error: any) {
        console.error('Delete team error:', error);
        return { success: false, error: error.message };
    }
}
