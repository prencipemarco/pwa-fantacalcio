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
                                    <Card className={cn(
                                        "rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer overflow-hidden",
                                        "bg-card group-hover:border-primary/20",
                                        borderLeftClass
                                    )}>
                                        <CardContent className="p-4 md:p-5 flex items-center gap-4">
                                            {/* Left: Matchday */}
                                            <div className="flex flex-col items-start w-[50px] shrink-0 border-r border-border/40 mr-1">
                                                <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mb-0.5">{t('day')}</span>
                                                <span className="text-3xl font-bold text-foreground leading-none">{f.matchday}</span>
                                            </div>

                                            {/* Center: Matchup */}
                                            <div className="flex-1 flex items-center justify-between">
                                                {/* Home Team */}
                                                <div className="flex-1 flex flex-col items-end text-right pr-2">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold mb-0.5">Home</span>
                                                    <span className={cn(
                                                        "text-base md:text-[16px] truncate max-w-[100px] sm:max-w-none leading-tight",
                                                        f.isHome ? "font-bold text-[#4169E1]" : "font-semibold text-foreground"
                                                    )}>
                                                        {f.isHome ? t('myTeam') : f.opponentName}
                                                    </span>
                                                </div>

                                                {/* VS or Score */}
                                                <div className="flex flex-col items-center justify-center min-w-[60px] relative z-10">
                                                    {f.calculated ? (
                                                        <>
                                                            <div className="flex items-center gap-1.5 text-2xl font-bold text-foreground leading-none">
                                                                <span>{f.homeGoals}</span>
                                                                <span className="text-muted-foreground/60 text-xl font-black px-1 border-b-2 border-transparent">:</span>
                                                                <span>{f.awayGoals}</span>
                                                            </div>
                                                            <div className={cn(
                                                                "mt-1.5 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border",
                                                                isWin ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                                    isLoss ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400" :
                                                                        "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300"
                                                            )}>
                                                                {isWin ? 'V' : isLoss ? 'P' : 'N'}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-lg font-bold text-muted-foreground/40">VS</span>
                                                    )}
                                                </div>

                                                {/* Away Team */}
                                                <div className="flex-1 flex flex-col items-start text-left pl-2">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold mb-0.5">Away</span>
                                                    <span className={cn(
                                                        "text-base md:text-[16px] truncate max-w-[100px] sm:max-w-none leading-tight",
                                                        !f.isHome ? "font-bold text-[#4169E1]" : "font-semibold text-foreground"
                                                    )}>
                                                        {!f.isHome ? t('myTeam') : f.opponentName}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right: Icon */}
                                            <div className="flex items-center gap-1 pl-2 text-muted-foreground/40 group-hover:text-primary/60 transition-colors">
                                                {!f.calculated && <CalendarIcon className="w-5 h-5 text-muted-foreground/30" />}
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </CardContent>
                                    </Card>
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
