'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMyTeam } from '@/app/actions/user';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ActiveAuctionsList } from '@/components/market/active-auctions';
import { FreeAgentsList } from '@/components/market/free-agents';
import { ReleasePlayersList } from '@/components/market/release-players-list';
import { CreateAuctionScreen } from '@/components/market/create-auction-screen';
import { TradesSection } from '@/components/market/trades-section';
import { NewTradeFlow } from '@/components/market/new-trade-flow';
import { Hammer, Users, ShoppingCart, UserMinus, RefreshCcw, HandCoins } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/loading-spinner';

import { Suspense } from 'react';

function MarketContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialView = searchParams.get('view') || 'listone';

    const [activeTab, setActiveTab] = useState(initialView);
    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeCount, setActiveCount] = useState(0);
    const [activeRelease, setActiveRelease] = useState(false); // Collapsed by default
    const supabase = createClient();

    const refreshTeam = async () => {
        try {
            const { data: session } = await supabase.auth.getSession();
            if (session.session) {
                const t = await getMyTeam(session.session.user.id);
                setTeam(t);
            }
        } catch (error) {
            console.error("Error refreshing team:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshTeam();

        const channel = supabase.channel('market-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => {
                fetchActiveCount();
            })
            .subscribe();

        fetchActiveCount();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchActiveCount = () => {
        supabase.from('auctions').select('count', { count: 'exact', head: true }).eq('status', 'OPEN').then(({ count }) => {
            setActiveCount(count || 0);
        });
    };

    // Sync tab with URL without triggering Next.js navigation (which can cause infinite suspense loaders)
    useEffect(() => {
        const currentView = searchParams.get('view');
        if (activeTab && currentView !== activeTab) {
            const url = new URL(window.location.href);
            url.searchParams.set('view', activeTab);
            window.history.replaceState(null, '', url.toString());
        }
    }, [activeTab, searchParams]);


    if (loading) {
        return (
            <div className="flex justify-center items-center py-24 min-h-screen">
                <LoadingPage />
            </div>
        );
    }

    if (!team) return (
        <div className="flex flex-col items-center justify-center p-8 text-center pt-24 min-h-[60vh] container max-w-md mx-auto">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('createTeamFirst')}</h2>
            <p className="text-muted-foreground mb-6">{t('noTeamMessage')}</p>
            <Button asChild size="lg" className="w-full">
                <Link href="/team/create">{t('createTeam')}</Link>
            </Button>
        </div>
    );

    return (
        <div className="container mx-auto p-4 max-w-4xl pb-24 pt-4 space-y-4">

            {/* Header with Credits */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 bg-background/95 backdrop-blur-lg pb-2 pt-2 border-b md:border-none shadow-sm md:shadow-none -mx-4 px-4 md:mx-0 md:px-0">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">Mercato</h1>
                    <p className="text-muted-foreground text-sm">Gestisci la tua rosa e partecipa alle aste.</p>
                </div>

                <div className="flex items-center gap-3 bg-card border shadow-sm p-1.5 rounded-xl pr-4">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                        <HandCoins className="w-5 h-5 text-green-700 dark:text-green-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('credits')}</span>
                        <span className="text-lg font-black font-mono leading-none text-green-600 dark:text-green-400">
                            {team.credits_left}
                        </span>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 h-auto p-1 bg-muted/50 rounded-xl">
                    <TabsTrigger value="listone" className="flex flex-col gap-1 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-semibold">Listone</span>
                    </TabsTrigger>
                    <TabsTrigger value="auctions" className="flex flex-col gap-1 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all relative">
                        <div className="relative">
                            <Hammer className="w-4 h-4" />
                            {activeCount > 0 && (
                                <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-semibold">Aste</span>
                    </TabsTrigger>
                    <TabsTrigger value="my_team" className="flex flex-col gap-1 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-py-2 transition-all">
                        <RefreshCcw className="w-4 h-4" />
                        <span className="text-xs font-semibold">Gestione</span>
                    </TabsTrigger>
                </TabsList>

                {/* TAB: FREE AGENTS */}
                <TabsContent value="listone" className="space-y-4 focus-visible:outline-none">
                    <FreeAgentsList onBack={() => { }} teamId={team.id} refreshCredits={refreshTeam} />
                </TabsContent>

                {/* TAB: AUCTIONS */}
                <TabsContent value="auctions" className="space-y-4 focus-visible:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/10 border-orange-200 dark:border-orange-800">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-orange-900 dark:text-orange-100">Crea Nuova Asta</h3>
                                    <p className="text-xs text-orange-700 dark:text-orange-300">Metti all'asta un giocatore svincolato</p>
                                </div>
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20 shadow-lg" onClick={() => setActiveTab('new_auction')}>
                                    <ShoppingCart className="w-4 h-4 mr-1" /> Crea
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-blue-900 dark:text-blue-100 px-1">Aste Attive: {activeCount}</h3>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 px-1">Partecipa e vinci</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <ActiveAuctionsList onBack={() => { }} teamId={team.id} refreshCredits={refreshTeam} />
                </TabsContent>

                {/* TAB: MANAGEMENT (My Trades, Release) */}
                <TabsContent value="my_team" className="space-y-6 focus-visible:outline-none">
                    <div className="grid gap-6">
                        <section>
                            <h3
                                className="text-lg font-bold mb-3 flex items-center justify-between gap-2 cursor-pointer bg-card p-4 rounded-xl border border-border/50 shadow-sm hover:border-primary/30 transition-all"
                                onClick={() => setActiveRelease(!activeRelease)}
                            >
                                <span className="flex items-center gap-2">
                                    <UserMinus className="w-5 h-5 text-red-500" /> Svincola Giocatori
                                </span>
                                <span className={`mr-1 transition-transform duration-200 ${activeRelease ? 'rotate-180' : ''}`}>▼</span>
                            </h3>

                            <div className={`transition-all duration-300 overflow-hidden ${activeRelease ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <Card className="border-red-100 dark:border-red-900/30">
                                    <CardContent className="p-4">
                                        <ReleasePlayersList onBack={() => { }} teamId={team.id} refreshCredits={refreshTeam} />
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 px-1 text-primary">
                                <RefreshCcw className="w-5 h-5 text-blue-500" /> Scambi
                            </h3>
                            <TradesSection teamId={team.id} onNewTrade={() => setActiveTab('new_trade')} />
                        </section>
                    </div>
                </TabsContent>

                {/* HIDDEN TABS FOR FLOWS (Ideally these should be Modals or Sub-pages, but keeping as Tabs for now) */}
                <TabsContent value="new_auction">
                    <CreateAuctionScreen onBack={() => setActiveTab('auctions')} onAuctionCreated={() => { setActiveTab('auctions'); refreshTeam(); }} />
                </TabsContent>

                <TabsContent value="new_trade">
                    <NewTradeFlow myTeamId={team.id} onClose={() => setActiveTab('my_team')} />
                </TabsContent>

            </Tabs>
        </div>
    );
}

export default function MarketPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center py-24 min-h-screen"><LoadingPage /></div>}>
            <MarketContent />
        </Suspense>
    );
}
