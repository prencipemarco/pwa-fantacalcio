'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogoutButton } from '@/components/logout-button';
import { MatchdayReminder } from '@/components/matchday-reminder';
import { SettingsDialog } from '@/components/settings-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shirt, ShoppingBag, Trophy, Users, Shield, ArrowRight, Plus } from 'lucide-react';

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

                {/* Left Column: reminder + CTA/Team (8 cols) */}
                <div className="md:col-span-8 flex flex-col gap-6">
                    <MatchdayReminder />

                    {/* Team Status Section */}
                    {user && !team ? (
                        <Card className="border-2 border-dashed border-primary/50 bg-primary/5 flex-grow">
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
                        <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden relative flex-grow">
                            <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl">La Tua Squadra</CardTitle>
                                        <CardDescription>{team.credits_left} Crediti residui</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-background/50 backdrop-blur">
                                        {user.email}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Link href="/team/lineup">
                                        <Button size="lg" className="w-full h-16 text-lg shadow-blue-500/20">
                                            <Shirt className="mr-2 h-5 w-5" />
                                            {t('myTeam')}
                                        </Button>
                                    </Link>
                                    <Link href="/team/market">
                                        <Button variant="secondary" size="lg" className="w-full h-16 text-lg bg-white hover:bg-white/90 text-primary shadow-sm">
                                            <ShoppingBag className="mr-2 h-5 w-5" />
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
                    <Card className="flex flex-col h-full border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                        <CardHeader className="pb-3 flex-shrink-0">
                            <CardTitle className="text-base">Esplora</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 flex-grow">
                            {/* Navigation Links */}
                            <div className="space-y-2 flex-shrink-0">
                                <Link href="/standings">
                                    <Button variant="ghost" className="w-full justify-between h-12 hover:bg-muted/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                        <span className="flex items-center gap-3">
                                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600">
                                                <Trophy className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-sm">{t('standings')}</span>
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                                    </Button>
                                </Link>
                                <Link href="/teams">
                                    <Button variant="ghost" className="w-full justify-between h-12 hover:bg-muted/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                        <span className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-sm">Tutte le Squadre</span>
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                                    </Button>
                                </Link>
                                <Link href="/team/market?view=free_agents">
                                    <Button variant="ghost" className="w-full justify-between h-12 hover:bg-muted/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                        <span className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-sm">{t('freeAgents') || 'Listone'}</span>
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Mini Standings Table - Fills remaining space */}
                            <div className="mt-auto pt-4 border-t w-full flex-grow flex flex-col">
                                {standings.length > 0 ? (
                                    <div className="flex flex-col gap-1 w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border h-full overflow-hidden">
                                        {standings.slice(0, 5).map((s, i) => (
                                            <div key={s.teamId} className="flex items-center justify-between text-xs py-2 px-2 border-b last:border-0 border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-bold w-4 text-center ${i === 0 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                                                        {i + 1}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium truncate max-w-[100px]">{s.teamName}</span>
                                                    </div>
                                                </div>
                                                <div className="font-bold tabular-nums text-slate-700 dark:text-slate-300">
                                                    {s.points} <span className="text-[10px] text-muted-foreground font-normal">pt</span>
                                                </div>
                                            </div>
                                        ))}
                                        {standings.length > 5 && (
                                            <Link href="/standings" className="text-[10px] text-center text-muted-foreground hover:text-primary mt-auto pt-2 block">
                                                Vedi tutti ({standings.length})
                                            </Link>
                                        )}
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
                                    <Shield className="w-10 h-10 mx-auto text-primary" />
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
