import { createClient } from '@/utils/supabase/server';
import { HomeContent } from '@/components/home/home-content';
import { getUserTeam } from '@/app/actions/team';
import { getStandings } from '@/app/actions/standings';
import { getNextSerieAMatch } from '@/app/actions/football-data';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userTeam = user ? await getUserTeam(user.id) : null;
  const standings = await getStandings();
  const nextMatch = await getNextSerieAMatch();

  return (
    <main className="flex min-h-screen flex-col justify-start bg-background w-full px-3">
      <HomeContent user={user} team={userTeam} standings={standings} nextMatch={nextMatch} />
    </main>
  );
}
