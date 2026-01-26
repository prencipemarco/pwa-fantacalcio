'use client';

import { useState } from 'react';
import { LiveNavbar } from '@/components/live/live-navbar';
import { getMyTeam } from '@/app/actions/user';
import { createClient } from '@/utils/supabase/client';
import { useEffect } from 'react';
import { LoadingPage } from '@/components/loading-spinner'; // Reusing spinner if available
import { SerieALive } from '@/components/live/serie-a-live';
import { FantaLiveMatch } from '@/components/live/fanta-live-match';

export default function LivePage() {
    const [activeTab, setActiveTab] = useState<'serie_a' | 'match'>('match');
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            const supabase = createClient();
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                const myTeam = await getMyTeam(data.session.user.id);
                setTeam(myTeam);
            }
            setLoading(false);
        };
        init();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-stone-950 flex items-center justify-center">
            <LoadingPage />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-stone-950 text-gray-900 dark:text-stone-100 pb-20 transition-colors duration-300">
            {/* Header / Status Bar */}
            <header className="bg-white dark:bg-stone-900 border-b border-gray-200 dark:border-stone-800 p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="font-bold tracking-wider text-sm">LIVE</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-stone-400 font-mono">
                    GIORNATA 22
                </div>
            </header>



            {/* Main Content Area */}
            <main className="container mx-auto max-w-lg p-4">
                {activeTab === 'match' && (
                    <div className="animate-fade-in">
                        {team ? <FantaLiveMatch teamId={team.id} /> : <div className="text-center text-red-400">Team not found</div>}
                    </div>
                )}

                {activeTab === 'serie_a' && (
                    <div className="animate-fade-in">
                        <SerieALive />
                    </div>
                )}
            </main>

            {/* Custom Navbar */}
            <LiveNavbar currentTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}
