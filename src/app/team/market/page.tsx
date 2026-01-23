'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMyTeam } from '@/app/actions/user';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActiveAuctionsList } from '@/components/market/active-auctions';
import { FreeAgentsList } from '@/components/market/free-agents';
import { ReleasePlayersList } from '@/components/market/release-players-list';
import { CreateAuctionModal } from '@/components/market/create-auction-modal';
import { TradesSection } from '@/components/market/trades-section';
import { Hammer, Users, ShoppingCart, UserMinus } from 'lucide-react';

import { NewTradeFlow } from '@/components/market/new-trade-flow';
import Link from 'next/link';

export default function MarketPage() {
    const { t } = useLanguage();
    const [view, setView] = useState<'home' | 'free_agents' | 'active_auctions' | 'release' | 'new_trade'>('home');
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

        supabase.from('auctions').select('count', { count: 'exact', head: true }).eq('status', 'OPEN').then(({ count }) => {
            setActiveCount(count || 0);
        });
    }, [view]);

    if (!team) return (
        <div className="p-8 text-center pt-24 container mx-auto">
            <h2 className="text-xl font-bold mb-4">{t('createTeamFirst')}</h2>
            <p className="text-gray-500 mb-6">{t('noTeamMessage')}</p>
            <Button asChild>
                <Link href="/team/create">{t('createTeam')}</Link>
            </Button>
        </div>
    );

    return (
        <div className="container mx-auto p-4 max-w-2xl pb-24 pt-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('transferMarket')}</h1>
                <div className="text-right bg-green-50 dark:bg-green-900/30 p-2 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-800 dark:text-green-400 uppercase font-bold tracking-wider">{t('credits')}</p>
                    <p className="text-xl font-mono font-bold text-green-600 dark:text-green-300">{team.credits_left}</p>
                </div>
            </div>

            {view === 'home' && (
                <div className="grid grid-cols-1 gap-4">
                    {/* OPTION 1: ACTIVE AUCTIONS */}
                    <Card
                        className={`cursor-pointer transition-all hover:shadow-md 
                            ${activeCount === 0
                                ? 'opacity-70 grayscale bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800'
                                : 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30'}`}
                        onClick={() => activeCount > 0 && setView('active_auctions')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg dark:text-white">{t('activeAuctions')}</CardTitle>
                            <Hammer className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="dark:text-gray-400">
                                {activeCount > 0
                                    ? `${activeCount} auctions open.`
                                    : t('noAuctions')}
                            </CardDescription>
                            {activeCount > 0 && <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 dark:text-white">{t('viewAuctions')}</Button>}
                        </CardContent>
                    </Card>

                    {/* OPTION 2: NEW AUCTION */}
                    <Card className="hover:shadow-md transition-all border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/30">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg dark:text-white">{t('newAuction')}</CardTitle>
                            <ShoppingCart className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="dark:text-gray-400">24h</CardDescription>
                            <CreateAuctionModal onAuctionCreated={() => setView('active_auctions')} />
                        </CardContent>
                    </Card>

                    {/* OPTION 3: TRADES */}
                    <TradesSection teamId={team.id} onNewTrade={() => setView('new_trade')} />

                    {/* OPTION 4: RELEASE PLAYERS */}
                    <Card
                        className="cursor-pointer hover:shadow-md transition-all border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30"
                        onClick={() => setView('release')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg dark:text-white">{t('releasePlayer')}</CardTitle>
                            <UserMinus className="h-6 w-6 text-red-500 dark:text-red-400" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="dark:text-gray-400">{t('releaseDesc')}</CardDescription>
                            <Button variant="outline" className="w-full mt-4 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50">{t('manageSquad')}</Button>
                        </CardContent>
                    </Card>

                    {/* OPTION 5: FREE AGENTS (OLD MARKET) */}
                    <Card
                        className="cursor-pointer hover:shadow-md transition-all border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                        onClick={() => setView('free_agents')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg dark:text-white">{t('freeAgents')}</CardTitle>
                            <Users className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="dark:text-gray-400">Listone</CardDescription>
                            <Button variant="outline" className="w-full mt-4 dark:border-zinc-700 dark:text-gray-200">{t('browse')}</Button>
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

            {view === 'release' && (
                <ReleasePlayersList onBack={() => setView('home')} teamId={team.id} refreshCredits={refreshTeam} />
            )}

            {view === 'new_trade' && (
                <NewTradeFlow myTeamId={team.id} onClose={() => setView('home')} />
            )}
        </div>
    );
}
