'use client';

import { useState, useEffect } from 'react';
import { getMyTeamId } from '@/app/actions/user';
import { getTeamResults, MatchResult } from '@/app/actions/results';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResultsSkeleton } from '@/components/skeletons';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { CalendarIcon, Trophy, Ban, Minus } from 'lucide-react';

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
            setResults(data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="p-4 container mx-auto max-w-2xl pt-20"><ResultsSkeleton /></div>;

    if (!hasTeam) return (
        <div className="p-8 text-center pt-24 container mx-auto max-w-md">
            <h2 className="text-xl font-bold mb-4">{t('noTeam')}</h2>
            <p className="text-gray-500 mb-6">{t('createTeamMessage')}</p>
            <Button asChild className="bg-blue-600 text-white w-full">
                <Link href="/team/create">{t('createTeam')}</Link>
            </Button>
        </div>
    );

    return (
        <div className="container mx-auto p-4 max-w-2xl pt-20 pb-24">
            {/* Matches Standings Minimal Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('matchResults')}
                </h1>
            </div>

            <div className="space-y-4">
                {results.map((f) => {
                    const myGoals = f.isHome ? f.homeGoals : f.awayGoals;
                    const theirGoals = f.isHome ? f.awayGoals : f.homeGoals;

                    let resultType = 'upcoming';
                    // Dark mode friendly colors
                    let statusColor = 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800';
                    let StatusIcon = CalendarIcon;

                    if (f.calculated) {
                        if (myGoals > theirGoals) {
                            resultType = 'win';
                            statusColor = 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900';
                            StatusIcon = Trophy;
                        } else if (myGoals < theirGoals) {
                            resultType = 'loss';
                            statusColor = 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900';
                            StatusIcon = Ban;
                        } else {
                            resultType = 'draw';
                            statusColor = 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900';
                            StatusIcon = Minus;
                        }
                    }

                    return (
                        <Link href={`/team/results/${f.id}`} key={f.id} className="block group">
                            <Card className={`border shadow-sm group-hover:shadow-md transition-all ${statusColor}`}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    {/* Left: Matchday & Status */}
                                    <div className="flex flex-col gap-1 w-20 shrink-0 border-r pr-4 border-gray-200/50 dark:border-white/10">
                                        <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">{t('matchday')}</span>
                                        <span className="text-2xl font-black text-gray-700 dark:text-gray-200">{f.matchday}</span>
                                    </div>

                                    {/* Center: Teams & Score */}
                                    <div className="flex-1 flex flex-col items-center justify-center px-2">
                                        {/* Opponent Name */}
                                        <div className="flex items-center gap-2 mb-2 w-full justify-between">
                                            <div className="flex flex-col items-start w-1/3">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{f.isHome ? 'Home' : 'Away'}</span>
                                                <span className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate w-full text-left">
                                                    {f.isHome ? t('myTeam') : f.opponentName}
                                                </span>
                                            </div>

                                            <div className={`px-3 py-1 rounded font-mono font-black text-lg min-w-[60px] text-center ${f.calculated ? 'bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-gray-100 dark:ring-zinc-700' : 'text-gray-400 bg-gray-100/50 dark:bg-zinc-800/50'}`}>
                                                {f.calculated ? `${f.homeGoals} - ${f.awayGoals}` : 'VS'}
                                            </div>

                                            <div className="flex flex-col items-end w-1/3">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{f.isHome ? 'Away' : 'Home'}</span>
                                                <span className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate w-full text-right">
                                                    {f.isHome ? f.opponentName : t('myTeam')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Result Badge */}
                                    <div className="w-8 flex justify-center items-center pl-2">
                                        {f.calculated ? (
                                            <div className={`p-2 rounded-full ${resultType === 'win' ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400' :
                                                    resultType === 'loss' ? 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400' :
                                                        'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400'
                                                }`}>
                                                <StatusIcon className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="p-2 rounded-full text-gray-400 bg-gray-100 dark:bg-zinc-800">
                                                <CalendarIcon className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}

                {results.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p>{t('noGames')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
