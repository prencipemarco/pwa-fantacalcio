'use client';

import { MOCK_LIVE_MATCHES } from '@/lib/live-mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { TeamLogo } from '@/components/team-logo';
import { Trophy, Club, Activity, Calendar, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function SerieALive() {
    return (
        <div className="space-y-4 pb-24">
            <h2 className="text-xl font-bold mb-4 px-2 text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" />
                Serie A Live
            </h2>

            {MOCK_LIVE_MATCHES.map((match) => (
                <MatchCard key={match.id} match={match} />
            ))}
        </div>
    );
}

function MatchCard({ match }: { match: any }) {
    const isLive = match.status === 'LIVE';

    // Determine winner for highlight
    const homeWinning = match.homeScore > match.awayScore;
    const awayWinning = match.awayScore > match.homeScore;

    return (
        <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-stone-900 transition-all duration-300 hover:shadow-xl group">
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
                </div>

                {/* Scoreboard Section */}
                <div className="flex items-center justify-between px-4 py-6">
                    {/* Home Team */}
                    <div className="flex flex-col items-center flex-1">
                        <TeamLogo teamName={match.homeTeam} size={48} className="mb-2 drop-shadow-sm" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white text-center leading-tight">
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
                        <span className="text-sm font-bold text-gray-900 dark:text-white text-center leading-tight">
                            {match.awayTeam}
                        </span>
                    </div>
                </div>

                {/* Events Timeline */}
                {match.events.length > 0 && (
                    <div className="px-4 pb-4 pt-2 -mt-2">
                        <div className="border-t border-gray-100 dark:border-stone-800 pt-3 space-y-2">
                            {match.events.map((ev: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <span className="font-mono text-xs text-gray-400 w-6 text-right">{ev.minute}'</span>

                                    <div className="flex items-center justify-center w-5">
                                        {ev.type === 'GOAL' && <div className="text-lg">⚽️</div>}
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
                )}
            </CardContent>
        </Card>
    );
}
