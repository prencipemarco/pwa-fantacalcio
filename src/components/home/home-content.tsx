'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogoutButton } from '@/components/logout-button';
import { SettingsDialog } from '@/components/settings-dialog';
import { TeamLogo } from '@/components/team-logo';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shirt, ShoppingBag, Trophy, Calendar, ChevronRight, Pencil } from 'lucide-react';
import { TeamStanding } from '@/app/actions/standings';
import { TeamLogoEditor } from '@/components/team-logo-editor';
import { NextMatchWidget } from '@/components/home/next-match-widget';
import { HomePressRoom } from '@/components/home/home-press-room';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

function InnerHome({ user, team, standings = [], nextMatch }: { user: any, team?: any, standings?: TeamStanding[], nextMatch?: any }) {
    const { t } = useLanguage();

    // Quick stats or next match info
    // Quick stats or next match info
    const nextMatchDate = nextMatch?.kickoff ? new Date(nextMatch.kickoff) : new Date();
    const formattedDate = format(nextMatchDate, 'EEE d MMM, HH:mm', { locale: it });

    return (
        <div className="flex flex-col min-h-[100dvh] bg-background">
            <div className="flex-1 p-4 pb-24 md:p-8 container mx-auto max-w-5xl">

                {/* 1. Compact Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <TeamLogoEditor
                                teamId={team?.id}
                                teamName={team?.name || 'My Team'}
                                initialLogoUrl={team?.logo_url}
                                initialLogoConfig={team?.logo_config}
                                trigger={
                                    <button className="relative group transition-transform hover:scale-105">
                                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
                                            <TeamLogo
                                                teamName={team?.name || 'My Team'}
                                                logoUrl={team?.logo_url}
                                                logoConfig={team?.logo_config}
                                                size={56}
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1.5 shadow-sm border border-border text-primary">
                                            <Pencil className="h-3 w-3" />
                                        </div>
                                    </button>
                                }
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Benvenuto</span>
                            <h1 className="font-bold text-xl md:text-2xl leading-tight text-foreground truncate max-w-[200px] md:max-w-md">
                                {team ? team.name : user.email?.split('@')[0]}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {team && (
                            <div className="bg-primary/10 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm font-bold flex items-center gap-1.5 border border-primary/20 shadow-sm">
                                <span className="text-[10px] uppercase opacity-70">Cr.</span>
                                {team.credits_left}
                            </div>
                        )}
                        <SettingsDialog />
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                    {/* LEFT COLUMN (Mobile: Top, Desktop: Left 7/12) */}
                    <div className="md:col-span-7 space-y-6">

                        {/* 2. Next Match Hero Card */}
                        <NextMatchWidget nextMatch={nextMatch} />

                        {/* 3. Primary Actions Grid */}
                        {team && (
                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/team/lineup" className="block group">
                                    <div className="p-4 flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-32">
                                        <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Shirt className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-sm text-center">Rosa</h3>
                                    </div>
                                </Link>

                                <Link href="/market" className="block group">
                                    <div className="p-4 flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-32">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <ShoppingBag className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-sm text-center">Mercato</h3>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Mobile: Bottom, Desktop: Right 5/12) */}
                    <div className="md:col-span-5 space-y-6">
                        {/* 4. Secondary Features / Explore */}
                        <div className="space-y-4">
                            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Esplora</h2>

                            <div className="grid gap-3">
                                <Link href="/standings">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-muted/60 hover:bg-secondary/40 hover:border-primary/20 transition-all shadow-sm group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                                <Trophy className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-base text-foreground">Classifica</span>
                                                <span className="text-xs text-muted-foreground">Vedi posizione in campionato</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </Link>

                                <Link href="/team/results">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-muted/60 hover:bg-secondary/40 hover:border-primary/20 transition-all shadow-sm group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-base text-foreground">Risultati</span>
                                                <span className="text-xs text-muted-foreground">Storico partite e punteggi</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <HomePressRoom userTeamId={team?.id} />

                        {!user && (
                            <div className="mt-4">
                                <Card className="bg-primary/5 border-primary/20">
                                    <div className="p-6 text-center space-y-4">
                                        <div>
                                            <h3 className="font-bold text-lg">Accedi per gestire</h3>
                                            <p className="text-sm text-muted-foreground">Accedi per creare la tua squadra.</p>
                                        </div>
                                        <Link href="/login" className="block">
                                            <Button className="w-full">Login</Button>
                                        </Link>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export function HomeContent({ user, team, standings = [], nextMatch }: {
    user: any,
    team?: any,
    standings?: TeamStanding[],
    nextMatch?: {
        matchday?: number;
        kickoff?: string;
        home?: string;
        away?: string;
        homeLogo?: string;
        awayLogo?: string;
        found: boolean;
    }
}) {
    return (
        <InnerHome user={user} team={team} standings={standings} nextMatch={nextMatch} />
    );
}
