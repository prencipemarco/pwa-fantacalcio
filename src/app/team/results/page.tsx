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

                                return (
                                    <StaggerItem key={f.id} className="w-full" id={`match-card-${f.id}`}>
                                        <Link href={`/team/results/${f.id}`} className="block group">
                                            <div className={cn(
                                                "relative flex items-center py-3 px-3 transition-colors",
                                                "border-b border-border/40",
                                                index === results.length - 1 ? "border-0" : "",
                                                "hover:bg-muted/30"
                                            )}>
                                                {/* Status Indicator Bar (Left) - slimmer */}
                                                <div className={cn(
                                                    "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full opacity-70",
                                                    f.calculated && isWin ? "bg-emerald-500" :
                                                        f.calculated && isLoss ? "bg-red-500" :
                                                            f.calculated ? "bg-gray-400" : "bg-transparent"
                                                )} />

                                                {/* Day Number (Left) */}
                                                <div className="flex flex-col w-[50px] shrink-0 items-center justify-center pl-2 border-r border-border/30 mr-3">
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">DAY</span>
                                                    <span className="text-xl font-black text-foreground leading-none">{f.matchday}</span>
                                                </div>

                                                {/* Match Content (Center) - Grid Layout for alignment */}
                                                <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                                    {/* Home Team */}
                                                    <div className="flex items-center justify-end gap-2 min-w-0">
                                                        <div className="flex flex-col items-end min-w-0">
                                                            <span className={cn(
                                                                "text-sm font-semibold leading-tight truncate w-full text-right",
                                                                f.isHome ? "text-[#4169E1]" : "text-foreground"
                                                            )}>
                                                                {homeTeamName}
                                                            </span>
                                                        </div>
                                                        <TeamLogo teamName={homeTeamName} size={28} className="shrink-0" />
                                                    </div>

                                                    {/* VS / Score */}
                                                    <div className="flex flex-col items-center justify-center w-[50px]">
                                                        {f.calculated ? (
                                                            <div className="flex flex-col items-center bg-muted/30 px-2 py-0.5 rounded">
                                                                <div className="text-base font-bold tracking-tight leading-none whitespace-nowrap">
                                                                    {f.homeGoals}-{f.awayGoals}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-muted-foreground/40">VS</span>
                                                        )}
                                                    </div>

                                                    {/* Away Team */}
                                                    <div className="flex items-center justify-start gap-2 min-w-0">
                                                        <TeamLogo teamName={awayTeamName} size={28} className="shrink-0" />
                                                        <div className="flex flex-col items-start min-w-0">
                                                            <span className={cn(
                                                                "text-sm font-semibold leading-tight truncate w-full text-left",
                                                                !f.isHome ? "text-[#4169E1]" : "text-foreground"
                                                            )}>
                                                                {awayTeamName}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Icon (Right) */}
                                                <div className="pl-2 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors">
                                                    <ChevronRight className="w-4 h-4" />
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
