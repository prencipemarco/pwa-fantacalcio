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

export default function ResultsPage() {
    const { t } = useLanguage();
    const [results, setResults] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasTeam, setHasTeam] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const teamData = await getMyTeamId();
            if (!teamData) {
                setHasTeam(false);
                setLoading(false);
                return;
            }

            const data = await getTeamResults(teamData.id);
            // Sort by matchday ASCENDING (1 to 38)
            const sorted = data.sort((a, b) => a.matchday - b.matchday);
            setResults(sorted);
            setLoading(false);

            // Find current matchday (first uncalculated or last calculated)
            // Strategy: Find first match that is NOT calculated (upcoming). If all calculated, take last.
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

    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Header (No longer sticky) */}
            <div className="bg-background/80 backdrop-blur-md border-b border-border/40 py-5">
                <div className="container mx-auto px-4 max-w-[600px]">
                    <h1 className="text-left font-bold text-2xl md:text-[28px] text-foreground">
                        {t('matchResults')}
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-[600px] pt-4">
                <StaggerList className="space-y-3">
                    {results.map((f) => {
                        const myGoals = f.isHome ? f.homeGoals : f.awayGoals;
                        const theirGoals = f.isHome ? f.awayGoals : f.homeGoals;
                        const isWin = myGoals > theirGoals;
                        const isLoss = myGoals < theirGoals;
                        const isDraw = f.calculated && myGoals === theirGoals;

                        // Border accent based on result (if played)
                        let borderLeftClass = "border-l-[4px] border-l-transparent";
                        if (f.calculated) {
                            if (isWin) borderLeftClass = "border-l-[4px] border-l-emerald-500";
                            else if (isLoss) borderLeftClass = "border-l-[4px] border-l-destructive";
                            else borderLeftClass = "border-l-[4px] border-l-gray-400";
                        }

                        return (
                            <StaggerItem key={f.id} className="w-full" id={`match-card-${f.id}`}>
                                <Link href={`/team/results/${f.id}`} className="block group">
                                    <div className={cn(
                                        "relative flex items-center py-2.5 px-1 md:py-3 transition-colors rounded-lg",
                                        "border-b border-border/40 last:border-0",
                                        "hover:bg-muted/30"
                                    )}>
                                        {/* Status Indicator Bar (Left) */}
                                        <div className={cn(
                                            "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full opacity-70",
                                            f.calculated && isWin ? "bg-emerald-500" :
                                                f.calculated && isLoss ? "bg-red-500" :
                                                    f.calculated ? "bg-gray-400" : "bg-transparent"
                                        )} />

                                        {/* Day Number (Left) */}
                                        <div className="flex flex-col w-[60px] shrink-0 items-center justify-center pl-2">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">DAY</span>
                                            <span className="text-2xl font-black text-foreground leading-none">{f.matchday}</span>
                                        </div>

                                        {/* Match Content (Center) */}
                                        <div className="flex-1 flex items-center justify-between px-2 md:px-6">
                                            {/* Home Team */}
                                            <div className="flex-1 text-right flex flex-col justify-center">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5 lg:hidden">Home</span>
                                                <span className={cn(
                                                    "text-sm md:text-base leading-tight truncate",
                                                    f.isHome ? "font-bold text-[#4169E1]" : "font-medium text-foreground"
                                                )}>
                                                    {f.isHome ? t('myTeam') : f.opponentName}
                                                </span>
                                            </div>

                                            {/* VS / Score */}
                                            <div className="mx-2 md:mx-6 flex flex-col items-center justify-center min-w-[50px]">
                                                {f.calculated ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className="text-lg md:text-xl font-bold tracking-tighter leading-none">
                                                            {f.homeGoals}-{f.awayGoals}
                                                        </div>
                                                        <span className={cn(
                                                            "text-[9px] font-bold uppercase mt-0.5 px-1.5 py-px rounded-sm border",
                                                            isWin ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400" :
                                                                isLoss ? "text-red-600 bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400" :
                                                                    "text-gray-500 bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                                                        )}>
                                                            {isWin ? 'WIN' : isLoss ? 'LOSE' : 'DRAW'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-muted-foreground/30">VS</span>
                                                )}
                                            </div>

                                            {/* Away Team */}
                                            <div className="flex-1 text-left flex flex-col justify-center">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5 lg:hidden">Away</span>
                                                <span className={cn(
                                                    "text-sm md:text-base leading-tight truncate",
                                                    !f.isHome ? "font-bold text-[#4169E1]" : "font-medium text-foreground"
                                                )}>
                                                    {!f.isHome ? t('myTeam') : f.opponentName}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Icon (Right) */}
                                        <div className="pr-2 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
                                            {!f.calculated ? <CalendarIcon className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </Link>
                            </StaggerItem>
                        );
                    })}

                    {results.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center py-24 space-y-4">
                            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-2">
                                <CalendarIcon className="w-10 h-10 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">{t('noGames')}</h3>
                            <p className="text-muted-foreground text-sm max-w-[200px]">Matches will appear here once the season starts.</p>
                        </div>
                    )}
                </StaggerList>
            </div>
        </div>
    );
}
