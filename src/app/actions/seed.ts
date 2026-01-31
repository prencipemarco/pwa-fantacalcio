'use server';

import { createClient } from '@/utils/supabase/server';
import { logEvent } from './admin';

export async function seedTeams(adminUserId: string, teamCount: number = 10) {
    const supabase = await createClient();

    // 1. Check existing teams
    const { count } = await supabase.from('teams').select('*', { count: 'exact', head: true });
    if (count && count > 0) {
        return { success: false, error: 'Database is not empty. Please reset teams first.' };
    }

    // 1b. Get League ID
    const { data: leagues } = await supabase.from('leagues').select('id').limit(1);
    let leagueId;
    if (!leagues || leagues.length === 0) {
        // Create default league if missing
        const { data: newLeague, error: lErr } = await supabase.from('leagues').insert({ name: 'Serie A League' }).select().single();
        if (lErr) return { success: false, error: 'Failed to create league' };
        leagueId = newLeague.id;
    } else {
        leagueId = leagues[0].id;
    }

    const funnyNames = [
        'Atletico MaNonTroppo', 'AC Picchia', 'Real Colizzati', 'AS Intomatici', 'Scarsenal',
        'Liverpolli', 'Borussia Porcmund', 'Mainz Na Gioia', 'Paris Saint Gennar', 'Bayern Minchie',
        'Celta Vino', 'Hertha Vernello', 'Aston Birra', 'Patetico Madrid', 'Villarriel',
        'Dinamo Fiacca', 'Divano Kiev', 'Spartak Mosci', 'Puffoni', 'Rubentus'
    ];

    const teamsToInsert = [];

    for (let i = 0; i < teamCount; i++) {
        const name = i < funnyNames.length ? funnyNames[i] : `Team Seed ${i + 1}`;
        teamsToInsert.push({
            name: name,
            user_id: adminUserId, // Link all to admin for testing
            credits_left: 500, // Test budget
            league_id: leagueId
        });
    }

    try {
        const { error } = await supabase.from('teams').insert(teamsToInsert);

        if (error) throw error;

        await logEvent('SEED_TEAMS', { count: teamCount, adminId: adminUserId });
        return { success: true, count: teamCount };

    } catch (e: any) {
        console.error('Seed error:', e);
        return { success: false, error: e.message };
    }
}
