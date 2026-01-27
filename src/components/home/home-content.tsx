'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogoutButton } from '@/components/logout-button';
import { MatchdayReminder } from '@/components/matchday-reminder';
import { SettingsDialog } from '@/components/settings-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shirt, ShoppingBag, Trophy, Users, Shield, ArrowRight, Plus, Calendar } from 'lucide-react';

import { TeamStanding } from '@/app/actions/standings';

function InnerHome({ user, team, standings }: { user: any, team: any, standings: TeamStanding[] }) {
    const { t } = useLanguage();

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            {/* Top Bar: Logo & Actions */}
            <div className="flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg text-white font-black text-xl">
                        F
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden md:inline-block">Fantacalcio</span>
                </div>

                <div className="flex items-center gap-2">
                    {user && <LogoutButton />}
                    <SettingsDialog />
                </div>
            </div>

            {/* Welcome Message */}
            {user && (
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                        {t('welcome')}, <span className="text-primary">{team ? team.name : user.email?.split('@')[0]}</span>
                    </h1>
                    <p className="text-muted-foreground">
                        {team ? 'Gestisci la tua rosa e schiera la formazione.' : 'Crea la tua squadra per iniziare.'}
                    </p>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

                {/* Left Column: Match & Team (8 cols) */}
                <div className="md:col-span-8 flex flex-col gap-6">
                    {/* Next Match - COMPACT VERSION */}
                    <Card className="border-none shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative">
                        {/* Green accent line on left */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500 rounded-l-xl z-20" />

                        <CardContent className="p-4 md:p-6 flex flex-row items-center justify-between relative z-10">
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                                    <Calendar className="h-6 w-6 md:h-8 md:w-8" />
                                </div>
                                <div>
                                    <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Prossima Giornata 23</h3>
                                    <div className="font-bold text-base md:text-lg">SS Lazio <span className="text-muted-foreground font-normal text-sm mx-1">vs</span> Genoa CFC</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Inizio <span className="font-medium text-foreground">ven 30 gen, 20:45</span>
                                    </div>
                                </div>
                            </div>

                            {/* Countdown - Right Side */}
                            <div className="text-right hidden sm:block">
                                <div className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-1">
                                    79h 23m
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mancano</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Status Section - EXPANDED */}
                    {user && !team ? (
                        <Card className="border-2 border-dashed border-primary/50 bg-primary/5 flex-grow min-h-[300px]">
                            <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 text-center space-y-6 h-full">
                                <div className="p-4 bg-primary/10 rounded-full animate-pulse">
                                    <Shield className="h-12 w-12 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">Crea la tua Squadra!</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        Non hai ancora una rosa attiva. Inizia subito creando il tuo team per partecipare al Fantacalcio.
                                    </p>
                                </div>
                                <Link href="/team/create">
                                    <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                        <Plus className="mr-2 h-6 w-6" />
                                        Crea Nuova Rosa
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : team ? (
                        <Card className="border-none shadow-sm bg-slate-50 dark:bg-zinc-900/50 flex-grow flex flex-col min-h-[280px]">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">La Tua Squadra</CardTitle>
                                        <CardDescription className="text-base mt-1">{team.credits_left} Crediti residui</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-background/80 backdrop-blur px-3 py-1 text-xs font-mono">
                                        {user.email}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="mt-auto pt-4 pb-8 px-6 md:px-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4 h-20 md:h-24">
                                    <Link href="/team/lineup" className="h-full">
                                        <Button size="lg" className="w-full h-full text-xl font-bold shadow-lg shadow-blue-500/20 bg-[#4169E1] hover:bg-[#3151b5] rounded-2xl transition-all hover:scale-[1.02]">
                                            <Shirt className="mr-3 h-6 w-6" />
                                            Rosa
                                        </Button>
                                    </Link>
                                    <Link href="/team/market" className="h-full">
                                        <Button variant="secondary" size="lg" className="w-full h-full text-xl font-bold bg-white dark:bg-zinc-800 text-[#4169E1] hover:bg-white/90 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl transition-all hover:scale-[1.02]">
                                            <ShoppingBag className="mr-3 h-6 w-6" />
                                            Asta
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}
                </div>

                {/* Right Column: Explore + Mini Standings (4 cols) - FULL HEIGHT */}
                <div className="md:col-span-4 flex flex-col h-full">
                    <Card className="flex flex-col h-full border-none shadow-sm bg-white dark:bg-zinc-950">
                        <CardHeader className="pb-4 pt-6 px-6">
                            <CardTitle className="text-lg font-bold">Esplora</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-1 flex-grow px-4 pb-6">
                            {/* Dashboard-style Menu Items */}
                            <Link href="/standings">
                                <Button variant="ghost" className="w-full justify-between h-14 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl group transition-all">
                                    <span className="flex items-center gap-4">
                                        <div className="p-2 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/40 transition-colors">
                                            <Trophy className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold text-base text-slate-700 dark:text-slate-300">Classifica</span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </Button>
                            </Link>

                            <Link href="/teams">
                                <Button variant="ghost" className="w-full justify-between h-14 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl group transition-all">
                                    <span className="flex items-center gap-4">
                                        <div className="p-2 bg-purple-100/50 dark:bg-purple-900/20 rounded-lg text-purple-600 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold text-base text-slate-700 dark:text-slate-300">Tutte le Squadre</span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </Button>
                            </Link>

                            <Link href="/team/market?view=free_agents">
                                <Button variant="ghost" className="w-full justify-between h-14 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl group transition-all">
                                    <span className="flex items-center gap-4">
                                        <div className="p-2 bg-green-100/50 dark:bg-green-900/20 rounded-lg text-green-600 group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold text-base text-slate-700 dark:text-slate-300">Svincolati</span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </Button>
                            </Link>

                            {/* Separator */}
                            <div className="h-px bg-slate-100 dark:bg-zinc-800 my-4 mx-2" />

                            {/* Mini Standings Table - Embed within White Card */}
                            <div className="mt-2 flex-grow flex flex-col px-2">
                                {standings.length > 0 ? (
                                    <div className="flex flex-col gap-0 w-full bg-slate-50/50 dark:bg-zinc-900/30 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800/50 h-full">
                                        {standings.slice(0, 5).map((s, i) => (
                                            <div key={s.teamId} className="flex items-center justify-between text-sm py-3 px-1 border-b last:border-0 border-slate-100 dark:border-zinc-800">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-black w-4 text-center text-xs ${i === 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                        {i + 1}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[110px]">{s.teamName}</span>
                                                    </div>
                                                </div>
                                                <div className="font-bold tabular-nums text-slate-900 dark:text-white text-xs">
                                                    {s.points} <span className="text-[10px] text-slate-400 font-normal">pt</span>
                                                </div>
                                            </div>
                                        ))}
                                        <Link href="/standings" className="text-xs text-center text-slate-400 hover:text-blue-600 mt-auto pt-3 font-medium transition-colors">
                                            Vedi tutti ({standings.length})
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="h-24 flex items-center justify-center text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                        Nessuna classifica
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {!user && (
                        <div className="mt-4">
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-6 text-center space-y-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{t('loginToManage')}</h3>
                                        <p className="text-sm text-muted-foreground">Accedi per creare la tua squadra.</p>
                                    </div>
                                    <Link href="/login" className="block">
                                        <Button className="w-full">{t('login')}</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 text-center text-muted-foreground text-xs py-8 border-t">
                <p>Fantacalcio PWA v0.5 (Beta) - {t('beta')}</p>
            </div>
        </div>
    );
}

export function HomeContent({ user, team, standings = [] }: { user: any, team?: any, standings?: TeamStanding[] }) {
    return (
        <InnerHome user={user} team={team} standings={standings} />
    );
}
