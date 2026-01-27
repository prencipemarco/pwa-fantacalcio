import { createClient } from '@/utils/supabase/server';
import { HomeContent } from '@/components/home/home-content';
import { getUserTeam } from '@/app/actions/team';
import { getStandings } from '@/app/actions/standings';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userTeam = user ? await getUserTeam(user.id) : null;
  const standings = await getStandings(); // Fetch standings for mini-table

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 pt-6 md:pt-12 bg-background">
      <HomeContent user={user} team={userTeam} standings={standings} />
    </main>
  );
}
