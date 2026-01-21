import { createClient } from '@/utils/supabase/server';
import { HomeContent } from '@/components/home/home-content';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center pt-20">
      <HomeContent user={user} />
    </main>
  );
}
