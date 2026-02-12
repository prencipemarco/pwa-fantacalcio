'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import { getSerieACalendar } from '@/app/actions/football-data';

export default function CalendarPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const data = await getSerieACalendar();
            setMatches(data);
            setLoading(false);

            // Scroll to current matchday
            if (data.length > 0) {
                // Find first unfinished match
                const nextMatch = data.find((m: any) => m.status === 'SCHEDULED' || m.status === 'TIMED');
                if (nextMatch) {
                    setTimeout(() => {
                        const el = document.getElementById(`matchday-${nextMatch.matchday}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 500);
                }
            }
        };
        init();
    }, []);

    // Group by Matchday
    const groupedMatches = matches.reduce((acc: any, match: any) => {
        if (!acc[match.matchday]) acc[match.matchday] = [];
        acc[match.matchday].push(match);
        return acc;
    }, {});

    return (
        <div className="container mx-auto p-4 max-w-3xl min-h-screen pb-20">
            <div className="flex items-center gap-4 mb-6 sticky top-0 bg-background/95 backdrop-blur z-20 py-4 -mx-4 px-4 border-b">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Calendario Serie A
                </h1>
            </div>

            {loading ? (
                <div className="text-center py-20 flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p>Caricamento calendario...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.keys(groupedMatches).map((matchday) => (
                        <div key={matchday} id={`matchday-${matchday}`} className="scroll-mt-24">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-3 px-1 sticky top-16 bg-background/95 backdrop-blur z-10 py-2">
                                Giornata {matchday}
                            </h3>
                            <Card className="overflow-hidden border-none shadow-sm bg-card/50">
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border/50">
                                        {groupedMatches[matchday].map((m: any) => {
                                            const isFinished = m.status === 'FINISHED';
                                            const isLive = m.status === 'IN_PLAY' || m.status === 'PAUSED';
                                            const score = isFinished || isLive
                                                ? `${m.score.fullTime.home ?? m.score.halfTime.home ?? 0} - ${m.score.fullTime.away ?? m.score.halfTime.away ?? 0}`
                                                : format(new Date(m.utcDate), 'HH:mm', { locale: it });

                                            return (
                                                <div key={m.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-3 hover:bg-muted/30 transition-colors">
                                                    {/* Home */}
                                                    <div className="flex items-center gap-3 overflow-hidden justify-end text-right">
                                                        <span className={`font-semibold text-xs md:text-sm truncate ${isLive ? 'text-red-600' : ''}`}>
                                                            {m.homeTeam.shortName || m.homeTeam.name}
                                                        </span>
                                                        {m.homeTeam.crest ? (
                                                            <img src={m.homeTeam.crest} className="w-6 h-6 object-contain" alt={m.homeTeam.name} />
                                                        ) : (
                                                            <div className="w-6 h-6 bg-gray-200 rounded-full" />
                                                        )}
                                                    </div>

                                                    {/* Score / Time */}
                                                    <div className={`text-xs font-bold px-2 py-1 rounded-md text-center min-w-[50px]
                                                        ${isLive ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-muted text-muted-foreground'}
                                                    `}>
                                                        {score}
                                                    </div>

                                                    {/* Away */}
                                                    <div className="flex items-center gap-3 overflow-hidden justify-start text-left">
                                                        {m.awayTeam.crest ? (
                                                            <img src={m.awayTeam.crest} className="w-6 h-6 object-contain" alt={m.awayTeam.name} />
                                                        ) : (
                                                            <div className="w-6 h-6 bg-gray-200 rounded-full" />
                                                        )}
                                                        <span className={`font-semibold text-xs md:text-sm truncate ${isLive ? 'text-red-600' : ''}`}>
                                                            {m.awayTeam.shortName || m.awayTeam.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}

                    {matches.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            Nessun calendario disponibile.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
