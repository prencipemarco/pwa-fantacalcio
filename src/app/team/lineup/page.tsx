import { createClient } from '@/utils/supabase/server';
import { getMyTeam, getMyRoster } from '@/app/actions/user';
import { saveLineup } from '@/app/actions/team';
import { getNextSerieAMatch } from '@/app/actions/football-data';
import { LineupBuilder } from '@/components/lineup/lineup-builder';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LineupPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch Data in Parallel
    const [team, nextMatch] = await Promise.all([
        getMyTeam(user.id),
        getNextSerieAMatch()
    ]);

    if (!team) {
        redirect('/team/create');
    }

    const roster = await getMyRoster(team.id);

    // Default matchday
    const initialMatchday = nextMatch.found && nextMatch.matchday ? nextMatch.matchday.toString() : "1";

    return (
        <div className="container mx-auto p-4 max-w-lg pb-safe">
            <LineupBuilder
                roster={roster || []}
                initialMatchday={initialMatchday}
                onSave={async (lineup, bench, module) => {
                    'use server';
                    const validBench = bench.filter(b => b !== null);
                    // 3rd arg is matchdayDate which we can leave null for now or pass if we had it
                    await saveLineup(team.id, parseInt(initialMatchday), null, lineup, validBench, module);
                }}
            />
        </div>
    );
}
