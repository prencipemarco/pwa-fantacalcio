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
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

function InnerHome({ user, team, standings = [], nextMatch }: { user: any, team?: any, standings?: TeamStanding[], nextMatch?: any }) {
    const { t } = useLanguage();

    // Quick stats or next match info
    const nextMatchDate = nextMatch ? new Date(nextMatch.date) : new Date();
    const formattedDate = format(nextMatchDate, 'EEE d MMM, HH:mm', { locale: it });

    return (
        <div className="flex flex-col min-h-[100dvh] bg-background">
            <div className="flex-1 p-4 space-y-6 pb-24">

                {/* 1. Compact Header */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <TeamLogoEditor
                                teamId={team?.id}
                                teamName={team?.name || 'My Team'}
                                initialLogoUrl={team?.logo_url}
                                initialLogoConfig={team?.logo_config}
                                trigger={
                                    <button className="relative group">
                                        <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
                                            <TeamLogo
                                                teamName={team?.name || 'My Team'}
                                                logoUrl={team?.logo_url}
                                                logoConfig={team?.logo_config}
                                                size={48}
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow-sm border border-border text-primary">
                                            <Pencil className="h-3 w-3" />
                                        </div>
                                    </button>
                                }
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground font-medium">Benvenuto</span>
                            <h1 className="font-bold text-lg leading-tight text-foreground truncate max-w-[150px]">
                                {team ? team.name : user.email?.split('@')[0]}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {team && (
                            <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 border border-primary/20">
                                <span className="text-[10px] uppercase opacity-70">Cr.</span>
                                {team.credits_left}
                            </div>
                        )}
                        <SettingsDialog />
                    </div>
                </header>

                {/* 2. Next Match Hero Card */}
                {nextMatch ? (
                    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-primary/90 to-blue-600 text-white relative">
                        {/* Decorative background pattern */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black/10 blur-xl" />

                        <div className="p-5 relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="inline-flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm">
                                    <Calendar className="h-3 w-3" />
                                    <span>Giornata {nextMatch.matchday}</span>
                                </div>
                                <div className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                                    Prossimo Turno
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-col items-center gap-2 flex-1">
                                    <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm p-1 flex items-center justify-center">
                                        <TeamLogo teamName={nextMatch.home_team_name} size={40} className="drop-shadow-md" />
                                    </div>
                                    <span className="text-xs font-bold text-center leading-tight line-clamp-2 w-full">
                                        {nextMatch.home_team_name}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center gap-1 px-2">
                                    <span className="text-2xl font-black italic opacity-90">VS</span>
                                    <span className="text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded-full text-white whitespace-nowrap">
                                        {formattedDate}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center gap-2 flex-1">
                                    <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm p-1 flex items-center justify-center">
                                        <TeamLogo teamName={nextMatch.away_team_name} size={40} className="drop-shadow-md" />
                                    </div>
                                    <span className="text-xs font-bold text-center leading-tight line-clamp-2 w-full">
                                        {nextMatch.away_team_name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="p-6 flex flex-col items-center justify-center text-center gap-3 border-dashed bg-muted/30">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Nessuna partita in programma</h3>
                            <p className="text-sm text-muted-foreground">Il calendario verrà aggiornato presto.</p>
                        </div>
                    </Card>
                )}

                {/* 3. Primary Actions Grid */}
                {team && (
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/team" className="block group h-full">
                            <Card className="h-full p-4 flex flex-col justify-between hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-card to-secondary/5 border-muted/60">
                                <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Shirt className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">La Tua Rosa</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">Gestisci la formazione</p>
                                </div>
                            </Card>
                        </Link>

                        <Link href="/market" className="block group h-full">
                            <Card className="h-full p-4 flex flex-col justify-between hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-card to-secondary/5 border-muted/60">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <ShoppingBag className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">Mercato</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">Acquista e scambia</p>
                                </div>
                            </Card>
                        </Link>
                    </div>
                )}

                {/* 4. Secondary Features */}
                <div className="space-y-3">
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Esplora</h2>

                    <div className="grid gap-2">
                        <Link href="/standings">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-muted/60 hover:bg-secondary/20 transition-colors shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                                        <Trophy className="h-4 w-4" />
                                    </div>
                                    <span className="font-semibold text-sm">Classifica Generale</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </Link>

                        <Link href="/team/results">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-muted/60 hover:bg-secondary/20 transition-colors shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <span className="font-semibold text-sm">Ultimi Risultati</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </Link>
                    </div>
                </div>

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
    );
}

export function HomeContent({ user, team, standings = [], nextMatch }: { user: any, team?: any, standings?: TeamStanding[], nextMatch?: any }) {
    return (
        <InnerHome user={user} team={team} standings={standings} nextMatch={nextMatch} />
    );
}
