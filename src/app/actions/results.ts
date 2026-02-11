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
    // Logos
    homeTeamLogoUrl?: string | null;
    homeTeamLogoConfig?: any;
    awayTeamLogoUrl?: string | null;
    awayTeamLogoConfig?: any;
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

    // 2. Fetch all teams to map names AND logos
    const { data: teams } = await supabase.from('teams').select('id, name, logo_url, logo_config');

    if (!teams) return [];

    const teamMap = new Map(teams.map(t => [t.id, t]));

    // 3. Transform data
    return fixtures.map(f => {
        const isHome = f.home_team_id === teamId;
        const opponentId = isHome ? f.away_team_id : f.home_team_id;
        const opponent = teamMap.get(opponentId);
        const opponentName = opponent?.name || 'Unknown';

        const homeTeam = teamMap.get(f.home_team_id);
        const awayTeam = teamMap.get(f.away_team_id);

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

            homeTeamLogoUrl: homeTeam?.logo_url,
            homeTeamLogoConfig: homeTeam?.logo_config,
            awayTeamLogoUrl: awayTeam?.logo_url,
            awayTeamLogoConfig: awayTeam?.logo_config,
        };
    });
}
