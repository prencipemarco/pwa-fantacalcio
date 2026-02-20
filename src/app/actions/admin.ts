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
    const teamSpending: Record<string, number> = {};

    for (const r of rosters) {
        const team = teams.find(t => t.name.toLowerCase().trim() === r.team_name.toLowerCase().trim());
        const player = players.find(p => p.name.toLowerCase().trim() === r.player_name.toLowerCase().trim());

        if (team && player) {
            dbRosters.push({
                team_id: team.id,
                player_id: player.id,
                purchase_price: r.price
            });

            // Track spending
            if (!teamSpending[team.id]) teamSpending[team.id] = 0;
            teamSpending[team.id] += r.price;
        } else {
            errors.push(`Could not match: ${r.team_name} - ${r.player_name}`);
        }
    }

    if (dbRosters.length > 0) {
        const { error } = await supabase
            .from('rosters')
            .upsert(dbRosters, { onConflict: 'team_id, player_id' });

        if (error) return { success: false, error: error.message, details: errors };

        // Deduct credits from teams
        for (const [teamId, spent] of Object.entries(teamSpending)) {
            // Fetch current to ensure atomic-ish update (Supabase doesn't have straight decrement via JS client easily without RPC, but read-write is ok for admin)
            const { data: t } = await supabase.from('teams').select('credits_left').eq('id', teamId).single();
            if (t) {
                await supabase.from('teams').update({
                    credits_left: t.credits_left - spent
                }).eq('id', teamId);
            }
        }
    }

    return { success: true, count: dbRosters.length, errors };
}

export async function importVotes(votes: VoteImport[], matchday: number) {
    const supabase = await createClient();

    const { data: validPlayers } = await supabase.from('players').select('id');
    const validIds = new Set(validPlayers?.map(p => p.id));

    // Filter votes for players that exist in our DB
    const validVotes = votes.filter(v => validIds.has(v.player_id));
    const skippedCount = votes.length - validVotes.length;

    if (skippedCount > 0) {
        console.warn(`Skipped ${skippedCount} votes for unknown players.`);
    }

    const dbVotes = validVotes.map(v => ({
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

    if (error) return { success: false, error: error.message };
    return { success: true, count: dbFixtures.length };
}

export async function calculateMatchday(matchday: number) {
    const supabase = await createClient();

    // 1. Get fixtures
    const { data: fixtures } = await supabase.from('fixtures').select('*').eq('matchday', matchday);
    if (!fixtures || fixtures.length === 0) return { success: false, error: 'No matches found.' };

    for (const match of fixtures) {
        // Calculate Home
        const homeScore = await calculateTeamScore(supabase, match.home_team_id, match.id);
        const homeGoals = convertScoreToGoals(homeScore);

        // Calculate Away
        const awayScore = await calculateTeamScore(supabase, match.away_team_id, match.id);
        const awayGoals = convertScoreToGoals(awayScore);

        // Update Fixture
        await supabase.from('fixtures').update({
            home_goals: homeGoals,
            away_goals: awayGoals,
            calculated: true
        }).eq('id', match.id);
    }

    return { success: true };
}

async function calculateTeamScore(supabase: any, teamId: string, fixtureId: number) {
    if (!teamId) return 0;

    // Get Lineup
    const { data: lineup } = await supabase.from('lineups')
        .select('id')
        .eq('team_id', teamId)
        .eq('fixture_id', fixtureId) // Ensure we use fixture_id
        .single();

    if (!lineup) return 0; // No lineup = 0

    // Get Players (Starters only for MVP)
    const { data: players } = await supabase.from('lineup_players')
        .select('player_id')
        .eq('lineup_id', lineup.id)
        .eq('is_starter', true);

    if (!players || players.length === 0) return 0;

    // Sum Votes
    let total = 0;
    for (const p of players) {
        const { data: stats } = await supabase.from('match_stats')
            .select('vote, goals_for, goals_against, yellow_cards, red_cards, assists, penalties_saved, penalties_missed, own_goals')
            .eq('player_id', p.player_id)
            .single();

        if (stats) {
            let playerTotal = stats.vote;
            playerTotal += (stats.goals_for * 3);
            playerTotal += (stats.assists * 1);
            playerTotal -= (stats.yellow_cards * 0.5);
            playerTotal -= (stats.red_cards * 1);
            playerTotal += (stats.penalties_saved * 3);
            playerTotal -= (stats.penalties_missed * 3);
            playerTotal -= (stats.own_goals * 2);
            playerTotal -= (stats.goals_against * 1); // GK malus

            total += playerTotal;
        }
        // TODO: Handle subs if starter has no vote
    }

    return total;
}

function convertScoreToGoals(score: number) {
    if (score < 66) return 0;
    if (score < 72) return 1; // 66-71.5
    if (score < 78) return 2; // 72-77.5
    if (score < 84) return 3; // 78-83.5
    if (score < 90) return 4; // 84-89.5
    if (score < 96) return 5;
    return 6; // 96+
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
    credits: boolean;
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

            // If teams are kept but rosters/players are reset, restore initial 1000 credits
            if (!teams) {
                await supabase.from('teams').update({ credits_left: 1000 }).neq('id', 0); // Update all valid teams
            }
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

        // 6.5 Credits (Independent, but acts on Teams)
        if (options.credits && !teams) {
            // Reset to 1000 only if teams are not being deleted anyway
            await supabase.from('teams').update({ credits_left: 1000 }).neq('id', 0);
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

        // 6. Push Subscriptions (Linked to User ID, but good to clean if we have it? No, deleteUser handles User ID stuff. 
        // But what if tables link to Team ID?
        // Check Markets / Bids?
        // Auctions where team is CREATOR?
        await supabase.from('auctions').delete().eq('team_id', teamId); // Delete created auctions

        // 7. Delete Team
        const { error } = await supabase.from('teams').delete().eq('id', teamId);

        if (error) throw error;

        await logEvent('DELETE_TEAM', { teamId, timestamp: new Date() });
        return { success: true };

        // ... existing code
    } catch (error: any) {
        console.error('Delete team error:', error);
        return { success: false, error: error.message };
    }
}

export async function forceCloneLineup(teamId: string, targetMatchday: number, sourceMatchday: number) {
    const supabase = await createClient();

    try {
        // 1. Get Source Lineup
        // We need to find the fixture ID for the source matchday or just query by Matchday if we store it?
        // Lineups are linked to Fixtures. We need to find the fixture for THIS team in Source Matchday.

        // Find Source Fixture for this team
        const { data: sourceFixture } = await supabase.from('fixtures')
            .select('id')
            .eq('matchday', sourceMatchday)
            .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
            .single();

        if (!sourceFixture) return { success: false, error: `No match found for Team in MD ${sourceMatchday}` };

        const { data: sourceLineup } = await supabase.from('lineups')
            .select('id, module')
            .eq('team_id', teamId)
            .eq('fixture_id', sourceFixture.id)
            .single();

        if (!sourceLineup) return { success: false, error: `No lineup found for MD ${sourceMatchday}` };

        // 2. Find Target Fixture
        const { data: targetFixture } = await supabase.from('fixtures')
            .select('id')
            .eq('matchday', targetMatchday)
            .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
            .single();

        if (!targetFixture) return { success: false, error: `No match found for Team in MD ${targetMatchday}` };

        // 3. Upsert Target Lineup (Overwrite if exists)
        const { data: newLineup, error: lineupError } = await supabase.from('lineups')
            .upsert({
                team_id: teamId,
                fixture_id: targetFixture.id,
                module: sourceLineup.module,
                is_submitted: true
            }, { onConflict: 'team_id, fixture_id' }) // Ensure one lineup per fixture
            .select()
            .single();

        if (lineupError) throw lineupError;

        // 4. Copy Players
        // First get source players
        const { data: sourcePlayers } = await supabase.from('lineup_players')
            .select('player_id, is_starter, position_index, role')
            .eq('lineup_id', sourceLineup.id);

        if (!sourcePlayers || sourcePlayers.length === 0) return { success: false, error: 'Source lineup is empty' };

        // Delete existing players in target (if any)
        await supabase.from('lineup_players').delete().eq('lineup_id', newLineup.id);

        // Insert new players
        const newPlayers = sourcePlayers.map(p => ({
            lineup_id: newLineup.id,
            player_id: p.player_id,
            is_starter: p.is_starter,
            position_index: p.position_index,
            role: p.role
        }));

        const { error: playersError } = await supabase.from('lineup_players').insert(newPlayers);
        if (playersError) throw playersError;

        await logEvent('FORCE_LINEUP_CLONE', { teamId, targetMatchday, sourceMatchday }, 'ADMIN');
        return { success: true };

        // ... existing code
    } catch (e: any) {
        console.error('Force Clone Error:', e);
        return { success: false, error: e.message };
    }
}

export async function forceImportLineupFromCSV(teamId: string, matchday: number, csvContent: string) {
    const supabase = await createClient();

    try {
        // 1. Parse CSV
        const lines = csvContent.trim().split('\n');
        const players: { name: string; role: string }[] = [];

        for (const line of lines) {
            const parts = line.split(';');
            if (parts.length >= 2) {
                players.push({
                    role: parts[0].trim().toUpperCase(),
                    name: parts[1].trim()
                });
            } else if (parts.length === 1 && parts[0].trim()) {
                // Try to support just Name if Role missing? 
                // User said "Role;Name", let's stick to that but be robust.
                players.push({ role: '?', name: parts[0].trim() });
            }
        }

        if (players.length === 0) return { success: false, error: 'CSV is empty or invalid format' };

        // 2. Resolve Players to IDs
        const resolvedPlayers: { id: string; name: string; role: string }[] = [];
        const notFound: string[] = [];

        // Determine Match ID first to fail fast
        const { data: fixture } = await supabase.from('fixtures')
            .select('id')
            .eq('matchday', matchday)
            .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
            .single();

        if (!fixture) return { success: false, error: `No match found for Team in MD ${matchday}` };

        // Find module? We can infer from role counts or default to 3-4-3 if unknown.
        // Actually, let's just use 3-4-3 or whatever fits the roles.
        // Or just let the system handle it properly.

        for (const p of players) {
            // Fuzzy search? or Exact case-insensitive?
            const { data: dbPlayer } = await supabase.from('players')
                .select('id, name, role')
                .ilike('name', p.name) // Exact match case-insensitive
                .single();

            if (dbPlayer) {
                resolvedPlayers.push({
                    id: dbPlayer.id,
                    name: dbPlayer.name,
                    role: dbPlayer.role // Trust DB role over CSV role? Yes.
                });
            } else {
                // Try fuzzy? Or just report error
                notFound.push(p.name);
            }
        }

        if (notFound.length > 0) {
            return { success: false, error: `Players not found: ${notFound.join(', ')}` };
        }

        // 3. Upsert Lineup
        // Infer module: count D, C, A among starters (first 11)
        const starters = resolvedPlayers.slice(0, 11);
        const ds = starters.filter(p => p.role === 'D').length;
        const cs = starters.filter(p => p.role === 'C').length;
        const as = starters.filter(p => p.role === 'A').length;
        const module = `${ds}-${cs}-${as}`;

        const { data: newLineup, error: lineupError } = await supabase.from('lineups')
            .upsert({
                team_id: teamId,
                fixture_id: fixture.id,
                module: module,
                is_submitted: true
            }, { onConflict: 'team_id, fixture_id' })
            .select()
            .single();

        if (lineupError) throw lineupError;

        // 4. Insert Players
        // Delete existing
        await supabase.from('lineup_players').delete().eq('lineup_id', newLineup.id);

        const newDetails = resolvedPlayers.map((p, i) => ({
            lineup_id: newLineup.id,
            player_id: p.id,
            is_starter: i < 11,
            position_index: i < 11 ? i : i - 11, // Starters 0-10, Bench 0-N
            role: p.role
        }));

        const { error: playersError } = await supabase.from('lineup_players').insert(newDetails);
        if (playersError) throw playersError;

        await logEvent('FORCE_LINEUP_CSV', { teamId, matchday, playerCount: resolvedPlayers.length }, 'ADMIN');
        return { success: true };

    } catch (e: any) {
        console.error('Force CSV Error:', e);
        return { success: false, error: e.message };
    }
}
