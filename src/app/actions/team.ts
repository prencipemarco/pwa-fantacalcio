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
