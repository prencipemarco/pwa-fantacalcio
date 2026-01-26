'use client';

import { useEffect, useState } from 'react';
import { getLiveMatches, getMatchDetails, type LiveMatch } from '@/app/actions/football-data';
import { Card, CardContent } from '@/components/ui/card';
import { TeamLogo } from '@/components/team-logo';
import { Activity, Calendar, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function SerieALive() {
    const [matches, setMatches] = useState<LiveMatch[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getLiveMatches();
            setMatches(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Polling every 60s
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4 pb-24">
            <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-500" />
                    Serie A Live
                </h2>
                <button onClick={fetchData} className="p-2 rounded-full bg-gray-100 dark:bg-stone-800 hover:bg-gray-200 transition-colors">
                    <RefreshCcw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading && matches.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-stone-500">Caricamento risultati...</div>
            ) : matches.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-stone-500">Nessuna partita trovata.</div>
            ) : (
                matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                ))
            )}
        </div>
    );
}

function MatchCard({ match }: { match: LiveMatch }) {
    const [isOpen, setIsOpen] = useState(false);
    const [events, setEvents] = useState<any[]>(match.events || []);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailsLoaded, setDetailsLoaded] = useState(false);

    const isLive = match.status === 'LIVE';

    // Toggle expand
    const handleToggle = async () => {
        const newState = !isOpen;
        setIsOpen(newState);

        // Fetch details if opening, not yet loaded, and match is NOT Scheduled
        if (newState && !detailsLoaded && match.status !== 'SCHEDULED') {
            setLoadingDetails(true);
            try {
                const fetchedEvents = await getMatchDetails(match.id);
                setEvents(fetchedEvents);
                setDetailsLoaded(true);
            } catch (e) {
                console.error('Failed to load details', e);
            } finally {
                setLoadingDetails(false);
            }
        }
    };

    const homeWinning = (match.homeScore || 0) > (match.awayScore || 0);
    const awayWinning = (match.awayScore || 0) > (match.homeScore || 0);

    return (
        <Card
            className="overflow-hidden border-0 shadow-lg bg-white dark:bg-stone-900 transition-all duration-300 hover:shadow-xl group cursor-pointer"
            onClick={handleToggle}
        >
            <CardContent className="p-0">
                {/* Header: Status & Minute */}
                <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-stone-950/50 border-b border-gray-100 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                        {isLive ? (
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                                <span className="text-xs font-bold text-red-600 dark:text-red-500 tracking-wider">LIVE</span>
                                <span className="text-xs font-mono font-bold text-gray-900 dark:text-white ml-1">{match.minute}'</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-stone-500">
                                <Calendar className="w-3 h-3" />
                                <span className="text-xs font-medium tracking-wide">{match.status}</span>
                            </div>
                        )}
                    </div>
                    <div className={`text-gray-400 dark:text-stone-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>

                {/* Scoreboard Section */}
                <div className="flex items-center justify-between px-4 py-6">
                    {/* Home Team */}
                    <div className="flex flex-col items-center flex-1">
                        <TeamLogo teamName={match.homeTeam} size={48} className="mb-2 drop-shadow-sm" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white text-center leading-tight mt-2">
                            {match.homeTeam}
                        </span>
                    </div>

                    {/* Score Center */}
                    <div className="flex items-center justify-center px-4">
                        <div className="flex items-center gap-1">
                            <span className={`text-4xl font-black font-mono ${isLive ? (homeWinning ? 'text-gray-900 dark:text-white scale-110' : 'text-gray-400 dark:text-stone-500') : 'text-gray-600 dark:text-stone-400'}`}>
                                {match.status === 'SCHEDULED' ? '-' : match.homeScore}
                            </span>
                            <span className="text-xl text-gray-300 dark:text-stone-700 font-light mx-2">:</span>
                            <span className={`text-4xl font-black font-mono ${isLive ? (awayWinning ? 'text-gray-900 dark:text-white scale-110' : 'text-gray-400 dark:text-stone-500') : 'text-gray-600 dark:text-stone-400'}`}>
                                {match.status === 'SCHEDULED' ? '-' : match.awayScore}
                            </span>
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center flex-1">
                        <TeamLogo teamName={match.awayTeam} size={48} className="mb-2 drop-shadow-sm" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white text-center leading-tight mt-2">
                            {match.awayTeam}
                        </span>
                    </div>
                </div>

                {/* Events Timeline (Collapsible & Lazy Loaded) */}
                <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                >
                    {loadingDetails ? (
                        <div className="text-center py-4 text-xs text-gray-400">Caricamento dettagli...</div>
                    ) : events && events.length > 0 ? (
                        <div className="px-4 pb-4 pt-0 -mt-2">
                            <div className="border-t border-gray-100 dark:border-stone-800 pt-3 space-y-2">
                                {events.map((ev: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <span className="font-mono text-xs text-gray-400 w-6 text-right">{ev.minute}'</span>

                                        <div className="flex items-center justify-center w-5">
                                            {ev.type === 'GOAL' && <div className="text-sm">⚽️</div>}
                                            {ev.type === 'ASSIST' && <div className="text-xs bg-gray-200 dark:bg-stone-700 px-1 rounded text-gray-600 dark:text-gray-300">A</div>}
                                            {ev.type === 'YELLOW_CARD' && <div className="w-3 h-4 bg-yellow-400 rounded-sm shadow-sm border border-yellow-500/20"></div>}
                                            {ev.type === 'RED_CARD' && <div className="w-3 h-4 bg-red-500 rounded-sm shadow-sm border border-red-600/20"></div>}
                                        </div>

                                        <div className="flex-1">
                                            <span className="font-medium text-gray-700 dark:text-stone-300">{ev.playerName}</span>
                                            {ev.type === 'GOAL' && <span className="text-xs text-gray-400 ml-1 font-light">Goal</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : match.status !== 'SCHEDULED' ? (
                        <div className="px-4 pb-4 pt-1 text-center bg-gray-50/50 dark:bg-stone-950/30 mx-4 mb-4 rounded-lg">
                            <span className="text-xs text-gray-400 dark:text-stone-500 italic">"Non abbiamo soldi per permetterci di mostrare i dettagli, magari in futuro, per ora accontentatevi" 🤷‍♂️</span>
                        </div>
                    ) : null}
                </motion.div>
            </CardContent>
        </Card>
    );
}
