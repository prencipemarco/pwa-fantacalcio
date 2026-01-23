'use server';

import { createClient } from '@/utils/supabase/server';

export type MatchResult = {
    id: number;
    matchday: number;
    isHome: boolean;
    opponentId: string;
    opponentName: string;
    homeGoals: number;
    awayGoals: number;
    calculated: boolean;
    date?: string; // If we had a date field
};

export async function getTeamResults(teamId: string): Promise<MatchResult[]> {
    const supabase = await createClient();

    // 1. Fetch all fixtures involving the team
    const { data: fixtures, error } = await supabase
        .from('fixtures')
        .select('*')
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('matchday', { ascending: false }); // Show latest first

    if (error || !fixtures) {
        console.error('Error fetching fixtures:', error);
        return [];
    }

    if (fixtures.length === 0) return [];

    // 2. Fetch all teams to map names (optimization: could just fetch relevant ones, but there are few teams)
    const { data: teams } = await supabase.from('teams').select('id, name');

    if (!teams) return [];

    const teamMap = new Map(teams.map(t => [t.id, t.name]));

    // 3. Transform data
    return fixtures.map(f => {
        const isHome = f.home_team_id === teamId;
        const opponentId = isHome ? f.away_team_id : f.home_team_id;
        const opponentName = teamMap.get(opponentId) || 'Unknown';

        return {
            id: f.id,
            matchday: f.matchday,
            isHome,
            opponentId,
            opponentName,
            homeGoals: f.home_goals,
            awayGoals: f.away_goals,
            calculated: f.calculated,
            // date: f.date 
        };
    });
}
