'use server';

import { createClient } from '@/utils/supabase/server';

export async function saveLineup(teamId: string, matchday: number, matchdayDate: string | null, lineup: any, bench: any[], module: string) {
    const supabase = await createClient();

    try {
        // 0. Find fixture for this matchday
        const { data: fixture } = await supabase
            .from('fixtures')
            .select('id')
            .eq('matchday', matchday)
            .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
            .single();

        if (!fixture) {
            throw new Error(`No match found on calendar for matchday ${matchday}`);
        }

        // 1. Check if lineup exists using fixture_id
        const { data: existingLineup } = await supabase
            .from('lineups')
            .select('id')
            .eq('team_id', teamId)
            .eq('fixture_id', fixture.id)
            .maybeSingle();

        let lineupId = existingLineup?.id;

        if (lineupId) {
            // Update
            await supabase.from('lineups').update({ module }).eq('id', lineupId);
            // Delete existing players
            await supabase.from('lineup_players').delete().eq('lineup_id', lineupId);
        } else {
            // Insert
            const { data: newLineup, error } = await supabase
                .from('lineups')
                .insert({ team_id: teamId, fixture_id: fixture.id, module })
                .select('id')
                .single();

            if (error) throw error;
            lineupId = newLineup.id;
        }

        // 2. Prepare players
        const playersToInsert: any[] = [];

        // Starters
        Object.entries(lineup).forEach(([index, item]: [string, any]) => {
            playersToInsert.push({
                lineup_id: lineupId,
                player_id: item.player.id,
                is_starter: true,
                bench_order: parseInt(index)
            });
        });

        // Bench
        bench.forEach((item: any, index: number) => {
            playersToInsert.push({
                lineup_id: lineupId,
                player_id: item.player.id,
                is_starter: false,
                bench_order: index
            });
        });

        const { error: insertError } = await supabase.from('lineup_players').insert(playersToInsert);
        if (insertError) throw insertError;

        return { success: true };

    } catch (error: any) {
        console.error('Save Lineup Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getLineup(teamId: string, matchday: number) {
    const supabase = await createClient();

    // 1. Get Fixture
    const { data: fixture } = await supabase
        .from('fixtures')
        .select('id')
        .eq('matchday', matchday)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .maybeSingle(); // Use maybeSingle to avoid 406 Error

    if (!fixture) return { success: false, error: 'No fixture found' };

    // 2. Get Lineup
    const { data: lineup } = await supabase
        .from('lineups')
        .select(`
            id, module,
            lineup_players (
                is_starter, bench_order,
                player: players (
                    id, name, role, team_real, quotation
                )
            )
        `)
        .eq('team_id', teamId)
        .eq('fixture_id', fixture.id)
        .maybeSingle();

    if (!lineup) return { success: false, error: 'Lineup not set' };

    // ... existing code
    return { success: true, data: lineup };
}

export async function getUserTeam(userId: string) {
    const supabase = await createClient();
    if (!userId) return null;

    const { data: team } = await supabase.from('teams').select('*').eq('user_id', userId).single();
    return team;
}
