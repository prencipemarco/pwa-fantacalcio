'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMyTeam } from '@/app/actions/user';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Hammer, Users, ShoppingCart } from 'lucide-react';
import { ActiveAuctionsList } from '@/components/market/active-auctions';
import { FreeAgentsList } from '@/components/market/free-agents';
import { CreateAuctionModal } from '@/components/market/create-auction-modal';

export default function MarketPage() {
    const { t } = useLanguage();
    const [view, setView] = useState<'home' | 'free_agents' | 'active_auctions'>('home');
    const [team, setTeam] = useState<any>(null);
    const [activeCount, setActiveCount] = useState(0);
    const supabase = createClient();

    const refreshTeam = async () => {
        const { data: session } = await supabase.auth.getSession();
        if (session.session) {
            const t = await getMyTeam(session.session.user.id);
            setTeam(t);
        }
    };

    useEffect(() => {
        refreshTeam();

        // Count active auctions for badge?
        // simple fetch
        supabase.from('auctions').select('count', { count: 'exact', head: true }).eq('status', 'OPEN').then(({ count }) => {
            setActiveCount(count || 0);
        });

        // Realtime? Ideally yes, but sticking to basic for now
    }, [view]); // Refresh when view changes (back to home)

    if (!team) return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">{t('createTeamFirst')}</h2>
            <p className="text-gray-500 mb-6">{t('noTeamMessage')}</p>
            <Button asChild>
                <a href="/team/create">Create Team</a>
            </Button>
        </div>
    );

    return (
        <div className="container mx-auto p-4 max-w-2xl pb-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Transfer Market</h1>
                <div className="text-right bg-green-50 p-2 rounded-lg border border-green-200">
                    <p className="text-xs text-green-800 uppercase font-bold tracking-wider">Credits</p>
                    <p className="text-xl font-mono font-bold text-green-600">{team.credits_left}</p>
                </div>
            </div>

            {view === 'home' && (
                <div className="grid grid-cols-1 gap-4">
                    {/* OPTION 1: ACTIVE AUCTIONS */}
                    <Card
                        className={`cursor-pointer transition-all hover:bg-slate-50 ${activeCount === 0 ? 'opacity-60 grayscale' : 'border-blue-200 bg-blue-50'}`}
                        onClick={() => activeCount > 0 && setView('active_auctions')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">{t('activeAuctions')}</CardTitle>
                            <Hammer className="h-6 w-6 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                {activeCount > 0
                                    ? `${activeCount} auctions open.`
                                    : t('noAuctions')}
                            </CardDescription>
                            {activeCount > 0 && <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">View</Button>}
                        </CardContent>
                    </Card>

                    {/* OPTION 2: NEW AUCTION */}
                    <Card className="cursor-pointer hover:bg-slate-50 border-orange-200 bg-orange-50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">{t('newAuction')}</CardTitle>
                            <ShoppingCart className="h-6 w-6 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription>24h</CardDescription>
                            <CreateAuctionModal onAuctionCreated={() => setView('active_auctions')} />
                        </CardContent>
                    </Card>

                    {/* OPTION 3: FREE AGENTS (OLD MARKET) */}
                    <Card
                        className="cursor-pointer hover:bg-slate-50 border-gray-200"
                        onClick={() => setView('free_agents')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">{t('freeAgents')}</CardTitle>
                            <Users className="h-6 w-6 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Listone</CardDescription>
                            <Button variant="outline" className="w-full mt-4">Browse</Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {view === 'active_auctions' && (
                <ActiveAuctionsList onBack={() => setView('home')} teamId={team.id} refreshCredits={refreshTeam} />
            )}

            {view === 'free_agents' && (
                <FreeAgentsList onBack={() => setView('home')} teamId={team.id} refreshCredits={refreshTeam} />
            )}
        </div>
    );
}
