'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ResultsSkeleton } from '@/components/skeletons';

type MatchDetail = {
    fixture: any;
    homeTeam: any;
    awayTeam: any;
    homeLineup: any[];
    awayLineup: any[];
    homeTotal: number;
    awayTotal: number;
    homeGoals: number;
    awayGoals: number;
};

export default function MatchDetailsPage() {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState<MatchDetail | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchDetails = async () => {
            if (!params.id) return;
            setLoading(true);

            // 1. Fetch Fixture
            const { data: fixture } = await supabase.from('fixtures').select('*').eq('id', params.id).single();
            if (!fixture) {
                setLoading(false);
                return;
            }

            // 2. Fetch Teams
            const { data: homeTeam } = await supabase.from('teams').select('id, name').eq('id', fixture.home_team_id).single();
            const { data: awayTeam } = await supabase.from('teams').select('id, name').eq('id', fixture.away_team_id).single();

            // 3. Fetch Lineups & Stats
            const homeData = await fetchTeamData(supabase, fixture, fixture.home_team_id);
            const awayData = await fetchTeamData(supabase, fixture, fixture.away_team_id);

            setMatch({
                fixture,
                homeTeam,
                awayTeam,
                homeLineup: homeData.players,
                awayLineup: awayData.players,
                homeTotal: homeData.total,
                awayTotal: awayData.total,
                homeGoals: fixture.home_goals,
                awayGoals: fixture.away_goals
            });
            setLoading(false);
        };
        fetchDetails();
    }, [params.id]);

    if (loading) return <ResultsSkeleton />;
    if (!match) return <div className="p-4">Match not found</div>;

    // ... types and upper part remain ...

    return (
        <div className="container mx-auto max-w-lg min-h-screen bg-background pb-safe-offset-20">
            {/* HEADER: Back & Title */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/40 p-4 flex items-center justify-between">
                <Button variant="ghost" size="icon" asChild className="-ml-2">
                    <Link href="/team/results">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="font-bold text-lg">Dettaglio Partita</div>
                <div className="w-9" /> {/* Spacer */}
            </div>

            {/* SCOREBOARD - Compact & Clean */}
            <div className="bg-card py-6 px-4 mb-2 shadow-sm border-b border-border/40">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    {/* Home */}
                    <div className="flex flex-col items-center w-[30%] text-center">
                        <span className="font-bold text-sm md:text-base leading-tight line-clamp-2 mb-1">{match.homeTeam?.name}</span>
                        <span className="text-xs text-muted-foreground">Tot: {match.homeTotal.toFixed(1)}</span>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center shrink-0">
                        <div className="text-4xl font-black tracking-tighter text-foreground flex gap-1">
                            <span>{match.homeGoals}</span>
                            <span className="text-muted-foreground/30">-</span>
                            <span>{match.awayGoals}</span>
                        </div>
                        <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-wider font-bold h-5 px-1.5">
                            Day {match.fixture.matchday}
                        </Badge>
                    </div>

                    {/* Away */}
                    <div className="flex flex-col items-center w-[30%] text-center">
                        <span className="font-bold text-sm md:text-base leading-tight line-clamp-2 mb-1">{match.awayTeam?.name}</span>
                        <span className="text-xs text-muted-foreground">Tot: {match.awayTotal.toFixed(1)}</span>
                    </div>
                </div>
            </div>

            {/* LINEUPS - Tabs or Vertical Stack? Vertical Stack for now as per image logic (Home then Away or Side by Side on Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:px-4">
                <TeamLineupColumn teamName={match.homeTeam?.name} players={match.homeLineup} total={match.homeTotal} color="blue" />
                <div className="md:hidden h-px bg-border/50 mx-4" /> {/* Divider on mobile */}
                <TeamLineupColumn teamName={match.awayTeam?.name} players={match.awayLineup} total={match.awayTotal} color="red" />
            </div>
        </div>
    );
}

// ... fetchTeamData ...

// ... calculatePlayerTotal ...


function TeamLineupColumn({ teamName, players, total, color }: { teamName: string, players: any[], total: number, color: 'blue' | 'red' }) {
    const roleOrder: any = { 'P': 1, 'D': 2, 'C': 3, 'A': 4 };
    const sortedPlayers = [...players].sort((a, b) => {
        const roleA = a.player?.role || 'A';
        const roleB = b.player?.role || 'A';
        // Sort by role P->D->C->A
        if (roleOrder[roleA] !== roleOrder[roleB]) return roleOrder[roleA] - roleOrder[roleB];
        return 0;
    });

    const themeColor = color === 'blue' ? 'text-blue-600' : 'text-red-600';
    const bgColor = color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-red-50 dark:bg-red-900/10';

    return (
        <div className="flex flex-col">
            <div className={`p-3 mx-4 rounded-xl ${bgColor} flex justify-between items-center mb-2`}>
                <span className={`font-bold text-sm uppercase tracking-wide ${themeColor}`}>{teamName}</span>
                <span className={`font-black text-lg ${themeColor}`}>{total.toFixed(1)}</span>
            </div>

            <div className="flex flex-col">
                {sortedPlayers.map((p) => (
                    <PlayerRow key={p.id} player={p} />
                ))}
                {sortedPlayers.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground italic">Formazione non disponibile</p>}
            </div>
        </div>
    );
}

function PlayerRow({ player }: { player: any }) {
    const stats = player.stats || {};
    const hasVote = stats.vote !== undefined;
    const totalPoints = player.points;

    // Role Config
    const roleConfig: any = {
        'P': { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'P' },
        'D': { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'D' },
        'C': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'C' },
        'A': { color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', label: 'A' }
    };
    const roleStyle = roleConfig[player.player.role] || roleConfig['A'];

    // FantaVote Color
    let fantaVoteColor = 'text-muted-foreground';
    let fantaVoteBg = 'bg-gray-100/50 dark:bg-gray-800/50';

    if (hasVote) {
        if (totalPoints >= 10) { fantaVoteColor = 'text-purple-600 dark:text-purple-400 font-black'; fantaVoteBg = 'bg-purple-50 dark:bg-purple-900/20'; }
        else if (totalPoints >= 7) { fantaVoteColor = 'text-emerald-600 dark:text-emerald-400 font-bold'; fantaVoteBg = 'bg-emerald-50 dark:bg-emerald-900/20'; }
        else if (totalPoints >= 6) { fantaVoteColor = 'text-blue-600 dark:text-blue-400 font-bold'; fantaVoteBg = 'bg-blue-50 dark:bg-blue-900/20'; }
        else if (totalPoints < 6) { fantaVoteColor = 'text-red-500 dark:text-red-400 font-bold'; fantaVoteBg = 'bg-red-50 dark:bg-red-900/20'; }
    }

    return (
        <div className="flex items-center justify-between py-3 px-4 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
            {/* Left: Role + Name */}
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${roleStyle.color}`}>
                    {roleStyle.label}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-foreground truncate">{player.player.name}</span>

                    {/* Event Icons (Under name for compactness) */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                        {stats.goals_for > 0 && (
                            <div className="flex items-center gap-0.5" title="Gol">
                                <span className="text-[10px]">⚽</span>
                                {stats.goals_for > 1 && <span className="text-[9px] font-bold text-green-600">x{stats.goals_for}</span>}
                            </div>
                        )}
                        {stats.assists > 0 && <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1 rounded" title="Assist">+1</span>}
                        {stats.yellow_cards > 0 && <div className="w-2 h-3 bg-yellow-400 rounded-[1px]" title="Ammonizione"></div>}
                        {stats.red_cards > 0 && <div className="w-2 h-3 bg-red-500 rounded-[1px]" title="Espulsione"></div>}
                        {stats.penalties_saved > 0 && <span className="text-[10px]" title="Rigore Parato">🧤</span>}
                        {stats.goals_against > 0 && <span className="text-[9px] font-bold text-red-500" title="Gol Subiti">-{stats.goals_against}</span>}
                    </div>
                </div>
            </div>

            {/* Right: Vote | FantaVote */}
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-center w-8">
                    <span className="text-xs text-muted-foreground/50 font-medium uppercase tracking-tighter" style={{ fontSize: '0.6rem' }}>VOTO</span>
                    <span className="text-sm font-medium text-muted-foreground">{hasVote ? stats.vote : '-'}</span>
                </div>

                <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg ${fantaVoteBg}`}>
                    {/* <span className="text-[9px] font-bold opacity-50 uppercase mb-[1px]" style={{ fontSize: '0.55rem' }}>FV</span> */}
                    <span className={`text-base ${fantaVoteColor}`}>{hasVote ? totalPoints : '-'}</span>
                </div>
            </div>
        </div>
    );
}

// Ensure clean end of file
