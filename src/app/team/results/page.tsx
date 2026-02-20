'use client';

import { useState, useEffect } from 'react';
import { getMyTeamId } from '@/app/actions/user';
import { getTeamResults, MatchResult } from '@/app/actions/results';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { CalendarIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StaggerList, StaggerItem } from '@/components/ui/motion-primitives';
import { TeamLogo } from '@/components/team-logo';

export default function ResultsPage() {
    const { t } = useLanguage();
    const [results, setResults] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasTeam, setHasTeam] = useState(true);
    const [myTeamName, setMyTeamName] = useState<string>('');

    useEffect(() => {
        const load = async () => {
            try {
                console.log('ResultsPage: Loading...');
                setLoading(true);
                const teamData = await getMyTeamId();
                if (!teamData) {
                    console.log('ResultsPage: No team data found');
                    setHasTeam(false);
                    setLoading(false);
                    return;
                }

                console.log('ResultsPage: Team data found', teamData);
                setMyTeamName(teamData.name || '');

                const data = await getTeamResults(teamData.id);
                console.log('ResultsPage: Results fetched', data?.length);

                if (!data) {
                    setResults([]);
                    setLoading(false);
                    return;
                }

                // Sort by matchday ASCENDING (1 to 38)
                const sorted = data.sort((a, b) => a.matchday - b.matchday);
                setResults(sorted);
                setLoading(false);

                // Find current matchday (first uncalculated or last calculated)
                const upcomingIndex = sorted.findIndex(m => !m.calculated);
                const targetIndex = upcomingIndex >= 0 ? upcomingIndex : sorted.length - 1;

                // Scroll to that element after a brief delay to ensure rendering
                if (targetIndex >= 0) {
                    setTimeout(() => {
                        const element = document.getElementById(`match-card-${sorted[targetIndex].id}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 100);
                }
            } catch (err) {
                console.error('ResultsPage: Error loading data', err);
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto max-w-[600px] pt-24 pb-24 px-4 space-y-4">
                <div className="flex justify-center mb-8"><Skeleton className="h-8 w-48 rounded" /></div>
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
            </div>
        );
    }

    if (!hasTeam) return (
        <div className="p-8 text-center pt-32 container mx-auto max-w-md">
            <h2 className="text-xl font-bold mb-4">{t('noTeam')}</h2>
            <p className="text-muted-foreground mb-6">{t('createTeamMessage')}</p>
            <Button asChild className="w-full">
                <Link href="/team/create">{t('createTeam')}</Link>
            </Button>
        </div>
    );

    console.log('ResultsPage: Rendering', { resultsCount: results.length, myTeamName });

    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Header */}
            <div className="bg-background/80 backdrop-blur-md border-b border-border/40 py-5">
                <div className="container mx-auto px-4 max-w-[600px]">
                    <h1 className="text-left font-bold text-2xl md:text-[28px] text-foreground">
                        {t('matchResults')}
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-[600px] pt-4">
                <Card className="text-card-foreground flex flex-col gap-6 rounded-xl border py-1 border-border/60 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-0">
                        <StaggerList>
                            {results.map((f, index) => {
                                const myGoals = f.isHome ? f.homeGoals : f.awayGoals;
                                const theirGoals = f.isHome ? f.awayGoals : f.homeGoals;
                                const isWin = myGoals > theirGoals;
                                const isLoss = myGoals < theirGoals;

                                // Defensive checks for team names
                                const myTeamDisplayName = myTeamName || t('myTeam');
                                const homeTeamName = f.isHome ? myTeamDisplayName : f.opponentName;
                                const awayTeamName = !f.isHome ? myTeamDisplayName : f.opponentName;

                                // Logos
                                const homeLogoUrl = f.homeTeamLogoUrl;
                                const homeLogoConfig = f.homeTeamLogoConfig;
                                const awayLogoUrl = f.awayTeamLogoUrl;
                                const awayLogoConfig = f.awayTeamLogoConfig;

                                return (
                                    <StaggerItem key={f.id} className="w-full" id={`match-card-${f.id}`}>
                                        <Link href={`/team/results/${f.id}`} className="block group">

                                            {/* --- DESKTOP VIEW (md+) --- */}
                                            <div className={cn(
                                                "hidden md:flex relative items-center py-4 px-4 transition-colors",
                                                "border-b border-border/40",
                                                index === results.length - 1 ? "border-0" : "",
                                                "hover:bg-muted/30"
                                            )}>
                                                {/* Status Indicator */}
                                                <div className={cn(
                                                    "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full opacity-70",
                                                    f.calculated && isWin ? "bg-emerald-500" :
                                                        f.calculated && isLoss ? "bg-red-500" :
                                                            f.calculated ? "bg-gray-400" : "bg-transparent"
                                                )} />

                                                {/* Day */}
                                                <div className="flex flex-col w-[60px] shrink-0 items-center justify-center border-r border-border/30 mr-4">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">DAY</span>
                                                    <span className="text-2xl font-black text-foreground leading-none">{f.matchday}</span>
                                                </div>

                                                {/* Match */}
                                                <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                                                    {/* Home */}
                                                    <div className="flex items-center justify-end gap-3 z-10 transition-transform group-hover:translate-x-1 min-w-0">
                                                        <span className={cn("text-sm font-bold truncate text-right", f.isHome ? "text-primary" : "")}>{homeTeamName}</span>
                                                        <div className="shrink-0">
                                                            <TeamLogo teamName={homeTeamName} logoUrl={homeLogoUrl} logoConfig={homeLogoConfig} size={36} />
                                                        </div>
                                                    </div>

                                                    {/* Score */}
                                                    <div className="flex justify-center w-[80px] shrink-0">
                                                        {f.calculated ? (
                                                            <div className="px-3 py-1 bg-muted/50 rounded-lg font-mono font-bold text-lg border border-border/50">
                                                                {f.homeGoals} - {f.awayGoals}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs font-bold text-muted-foreground/50 bg-muted/20 px-2 py-1 rounded">VS</span>
                                                        )}
                                                    </div>

                                                    {/* Away */}
                                                    <div className="flex items-center justify-start gap-3 z-10 transition-transform group-hover:-translate-x-1 min-w-0">
                                                        <div className="shrink-0">
                                                            <TeamLogo teamName={awayTeamName} logoUrl={awayLogoUrl} logoConfig={awayLogoConfig} size={36} />
                                                        </div>
                                                        <span className={cn("text-sm font-bold truncate text-left", !f.isHome ? "text-primary" : "")}>{awayTeamName}</span>
                                                    </div>
                                                </div>

                                                <ChevronRight className="ml-4 h-5 w-5 text-muted-foreground/30" />
                                            </div>


                                            {/* --- MOBILE VIEW (md-hidden) --- */}
                                            <div className={cn(
                                                "md:hidden flex flex-col py-4 px-2 relative",
                                                "border-b border-border/40",
                                                index === results.length - 1 ? "border-0" : "",
                                                "active:bg-muted/30 transition-colors"
                                            )}>
                                                {/* Status Strip */}
                                                <div className={cn(
                                                    "absolute left-0 top-4 bottom-4 w-1 rounded-r-full opacity-60",
                                                    f.calculated && isWin ? "bg-emerald-500" :
                                                        f.calculated && isLoss ? "bg-red-500" :
                                                            f.calculated ? "bg-gray-300" : "bg-transparent"
                                                )} />

                                                <div className="text-[10px] text-center font-black text-foreground uppercase tracking-widest mb-3">
                                                    Giornata {f.matchday}
                                                </div>

                                                <div className="flex items-center justify-between px-2">
                                                    {/* Home */}
                                                    <div className="flex flex-col items-center justify-start w-[35%] gap-2 text-center min-w-0">
                                                        <div className="relative shrink-0">
                                                            <TeamLogo teamName={homeTeamName} logoUrl={homeLogoUrl} logoConfig={homeLogoConfig} size={42} />
                                                            {f.isHome && <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-blue-500 rounded-full border-2 border-background" />}
                                                        </div>
                                                        <span className={cn("text-[11px] font-bold leading-tight line-clamp-2 w-full", f.isHome ? "text-primary" : "")}>
                                                            {homeTeamName}
                                                        </span>
                                                    </div>

                                                    {/* Score */}
                                                    <div className="flex items-center justify-center w-[30%]">
                                                        {f.calculated ? (
                                                            <div className="flex items-center gap-1 font-black text-2xl text-foreground tracking-tighter">
                                                                <span>{f.homeGoals}</span>
                                                                <span className="text-muted-foreground/30 text-lg">-</span>
                                                                <span>{f.awayGoals}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-muted/40 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                                VS
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Away */}
                                                    <div className="flex flex-col items-center justify-start w-[35%] gap-2 text-center min-w-0">
                                                        <div className="relative shrink-0">
                                                            <TeamLogo teamName={awayTeamName} logoUrl={awayLogoUrl} logoConfig={awayLogoConfig} size={42} />
                                                            {!f.isHome && <div className="absolute -bottom-1 -left-1 h-3 w-3 bg-blue-500 rounded-full border-2 border-background" />}
                                                        </div>
                                                        <span className={cn("text-[11px] font-bold leading-tight line-clamp-2", !f.isHome ? "text-primary" : "")}>
                                                            {awayTeamName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                        </Link>
                                    </StaggerItem>
                                );
                            })}

                            {results.length === 0 && (
                                <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-2">
                                        <CalendarIcon className="w-8 h-8 text-muted-foreground/40" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">{t('noGames')}</h3>
                                    <p className="text-muted-foreground text-xs max-w-[200px]">Matches will appear here once the season starts.</p>
                                </div>
                            )}
                        </StaggerList>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
