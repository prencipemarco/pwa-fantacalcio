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
            <div className="flex-1 p-2 pb-24 md:p-4 w-full">

                {/* 1. Compact Header */}
                <header className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <TeamLogoEditor
                                teamId={team?.id}
                                teamName={team?.name || 'My Team'}
                                initialLogoUrl={team?.logo_url}
                                initialLogoConfig={team?.logo_config}
                                trigger={
                                    <button className="relative group transition-transform hover:scale-105">
                                        <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
                                            <TeamLogo
                                                teamName={team?.name || 'My Team'}
                                                logoUrl={team?.logo_url}
                                                logoConfig={team?.logo_config}
                                                size={48}
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow-sm border border-border text-primary">
                                            <Pencil className="h-2.5 w-2.5" />
                                        </div>
                                    </button>
                                }
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Benvenuto</span>
                            <h1 className="font-bold text-lg leading-tight text-foreground truncate max-w-[180px]">
                                {team ? team.name : user.email?.split('@')[0]}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <SettingsDialog />
                        <LogoutButton />
                    </div>
                </header>

                <div className="space-y-6">
                    {/* 2. Next Match Hero Card */}
                    <NextMatchWidget nextMatch={nextMatch} />

                    {/* 3. Inserisci Rosa Button (Replacing Risultati/Classifica) */}
                    <Link href="/team/lineup" className="block w-full group">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-muted/60 hover:bg-secondary/40 hover:border-primary/20 transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Shirt className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg leading-tight text-foreground">Inserisci Formazione</span>
                                    <span className="text-xs text-muted-foreground font-medium">Non dimenticare di schierare!</span>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </Link>

                    {/* 4. Expanded Press Room */}
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
