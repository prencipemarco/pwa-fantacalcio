'use server';

import { createClient } from '@/utils/supabase/server';

export type TeamStanding = {
    teamId: string;
    teamName: string;
    played: number;
    points: number; // 3 for win, 1 for draw, 0 for loss
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    totalFantasyPoints: number; // Sum of partial scores
    logoUrl?: string | null;
    logoConfig?: any;
};

export async function getStandings(): Promise<TeamStanding[]> {
    const supabase = await createClient();

    // 1. Fetch Teams
    const { data: teams } = await supabase.from('teams').select('id, name, logo_url, logo_config');
    if (!teams) return [];

    // Initialize Standings Map
    const standings: Record<string, TeamStanding> = {};
    teams.forEach(t => {
        standings[t.id] = {
            teamId: t.id,
            teamName: t.name,
            played: 0,
            points: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            totalFantasyPoints: 0,
            logoUrl: t.logo_url,
            logoConfig: t.logo_config
        };
    });

    // 2. Fetch Calculated Fixtures
    const { data: fixtures } = await supabase.from('fixtures')
        .select('*')
        .eq('calculated', true);

    if (!fixtures) return Object.values(standings);

    // 3. Process Fixtures for Basic Stats
    fixtures.forEach(f => {
        const home = standings[f.home_team_id];
        const away = standings[f.away_team_id];

        if (home && away) {
            home.played++;
            away.played++;

            home.goalsFor += f.home_goals;
            home.goalsAgainst += f.away_goals;
            away.goalsFor += f.away_goals;
            away.goalsAgainst += f.home_goals;

            if (f.home_goals > f.away_goals) {
                home.won++;
                home.points += 3;
                away.lost++;
            } else if (f.away_goals > f.home_goals) {
                away.won++;
                away.points += 3;
                home.lost++;
            } else {
                home.drawn++;
                home.points += 1;
                away.drawn++;
                away.points += 1;
            }
        }
    });

    // 4. Calculate Total Fantasy Points (The Heavy Part)
    // We need to sum up the scores of all lineups for calculated fixtures.
    // Optimization: Fetch all Lineups for calculated fixtures, then fetch stats.

    // IDs of calculated fixtures
    const fixtureIds = fixtures.map(f => f.id);
    if (fixtureIds.length === 0) return Object.values(standings); // No games played

    // Get Lineups linked to these fixtures
    const { data: lineups } = await supabase.from('lineups')
        .select('id, team_id, fixture_id')
        .in('fixture_id', fixtureIds);

    if (lineups && lineups.length > 0) {
        const lineupIds = lineups.map(l => l.id);

        // Get Starters for these lineups
        // Join with players to get role? we don't strictly need role for total points if we trust match_stats
        // But we need to link stats to player_id
        const { data: players } = await supabase.from('lineup_players')
            .select('lineup_id, player_id')
            .in('lineup_id', lineupIds)
            .eq('is_starter', true);

        if (players && players.length > 0) {
            // Get all player IDs involved
            const allPlayerIds = [...new Set(players.map(p => p.player_id))];

            // Fetch stats for these players. 
            // Issue: A player might have stats for multiple matchdays. We need to match stats to the CORRECT matchday of the fixture.
            // So simply fetching all stats for player X is not enough, we need to know which matchday.

            // Better approach:
            // Fetch match_stats WHERE matchday IN (fixtures.matchday)
            const matchdays = [...new Set(fixtures.map(f => f.matchday))];

            const { data: stats } = await supabase.from('match_stats')
                .select('player_id, matchday, vote, goals_for, goals_against, assists, yellow_cards, red_cards, penalties_saved, penalties_missed, own_goals')
                .in('matchday', matchdays); // Fetch all relevant stats

            if (stats) {
                // Now we need to map: 
                // Fixture -> Matchday
                // Lineup -> Team
                // Player -> Lineup
                // Stat -> Player + Matchday

                // Create lookup for stats: key = `${player_id}_${matchday}`
                const statsMap = new Map<string, any>();
                stats.forEach(s => statsMap.set(`${s.player_id}_${s.matchday}`, s));

                // Create lookup for lineup -> fixture -> matchday
                const lineupFixtureMap = new Map<number, number>(); // lineup_id -> matchday
                lineups.forEach(l => {
                    const f = fixtures.find(fix => fix.id === l.fixture_id);
                    if (f) lineupFixtureMap.set(l.id, f.matchday);
                });

                // Iterate players and sum points
                players.forEach(p => {
                    const matchday = lineupFixtureMap.get(p.lineup_id);
                    if (matchday) {
                        const s = statsMap.get(`${p.player_id}_${matchday}`);
                        if (s) {
                            const points = calculatePlayerPoints(s);
                            // Find team
                            const lineup = lineups.find(l => l.id === p.lineup_id);
                            if (lineup && standings[lineup.team_id]) {
                                standings[lineup.team_id].totalFantasyPoints += points;
                            }
                        }
                    }
                });
            }
        }
    }

    // Sort Standings: Points DESC, then Goal Diff, then Fantasy Points
    return Object.values(standings).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const diffA = a.goalsFor - a.goalsAgainst;
        const diffB = b.goalsFor - b.goalsAgainst;
        if (diffB !== diffA) return diffB - diffA;
        return b.totalFantasyPoints - a.totalFantasyPoints;
    });
}

function calculatePlayerPoints(s: any) {
    if (!s || s.vote === undefined) return 0;
    let total = s.vote;
    total += ((s.goals_for || 0) * 3);
    total += ((s.assists || 0) * 1);
    total -= ((s.yellow_cards || 0) * 0.5);
    total -= ((s.red_cards || 0) * 1);
    total += ((s.penalties_saved || 0) * 3);
    total -= ((s.penalties_missed || 0) * 3);
    total -= ((s.own_goals || 0) * 2);
    total -= ((s.goals_against || 0) * 1);
    return Math.round(total * 2) / 2; // Usually no rounding needed if standard values but safe to keep
}
