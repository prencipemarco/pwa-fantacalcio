'use server'

import { createClient } from '@/utils/supabase/server';

export type PlayerStatsAggregated = {
    playerId: number;
    gamesPlayed: number;
    averageVote: number;
    averageFantaVote: number;
    totalGoals: number;
    totalAssists: number;
    totalYellowCards: number;
    totalRedCards: number;
    cleanSheets?: number; // per portieri se vogliamo
    goalsAgainst?: number; // per portieri
};

export async function getPlayerStats(playerId: number): Promise<PlayerStatsAggregated | null> {
    const supabase = await createClient();

    const { data: stats, error } = await supabase
        .from('match_stats')
        .select('*')
        .eq('player_id', playerId);

    if (error || !stats || stats.length === 0) {
        return null;
    }

    const gamesPlayed = stats.length;
    let sumVote = 0;
    let sumFantaVote = 0;
    let totalGoals = 0;
    let totalAssists = 0;
    let totalYellowCards = 0;
    let totalRedCards = 0;
    let goalsAgainst = 0;

    for (const s of stats) {
        let fantaVote = s.vote;
        fantaVote += (s.goals_for * 3);
        fantaVote += (s.assists * 1);
        fantaVote -= (s.yellow_cards * 0.5);
        fantaVote -= (s.red_cards * 1);
        fantaVote += (s.penalties_saved * 3);
        fantaVote -= (s.penalties_missed * 3);
        fantaVote -= (s.own_goals * 2);
        fantaVote -= (s.goals_against * 1);

        sumVote += s.vote;
        sumFantaVote += fantaVote;

        totalGoals += s.goals_for;
        totalAssists += s.assists;
        totalYellowCards += s.yellow_cards;
        totalRedCards += s.red_cards;
        goalsAgainst += s.goals_against;
    }

    return {
        playerId,
        gamesPlayed,
        averageVote: sumVote / gamesPlayed,
        averageFantaVote: sumFantaVote / gamesPlayed,
        totalGoals,
        totalAssists,
        totalYellowCards,
        totalRedCards,
        goalsAgainst
    };
}
