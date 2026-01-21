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

    return (
        <div className="container mx-auto p-4 max-w-4xl pb-24">
            <div className="mb-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/team/results">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
                    </Link>
                </Button>
            </div>

            {/* SCOREBOARD */}
            <Card className="mb-6 bg-slate-900 text-white border-none">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center text-center">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold truncate px-2">{match.homeTeam?.name || 'Ghost Team'}</h2>
                            <div className="text-sm opacity-70">Total: {match.homeTotal.toFixed(1)}</div>
                        </div>
                        <div className="mx-4">
                            <div className="text-5xl font-bold font-mono tracking-tighter">
                                {match.homeGoals} - {match.awayGoals}
                            </div>
                            <div className="text-[10px] opacity-50 uppercase tracking-widest mt-1">
                                Matchday {match.fixture.matchday}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold truncate px-2">{match.awayTeam?.name || 'Ghost Team'}</h2>
                            <div className="text-sm opacity-70">Total: {match.awayTotal.toFixed(1)}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* HOME LINEUP */}
                <TeamLineupColumn teamName={match.homeTeam?.name} players={match.homeLineup} total={match.homeTotal} />

                {/* AWAY LINEUP */}
                <TeamLineupColumn teamName={match.awayTeam?.name} players={match.awayLineup} total={match.awayTotal} />
            </div>
        </div>
    );
}

async function fetchTeamData(supabase: any, fixture: any, teamId: string) {
    if (!teamId) return { players: [], total: 0 };

    // Get Lineup
    const { data: lineup } = await supabase.from('lineups').select('id').eq('fixture_id', fixture.id).eq('team_id', teamId).single();
    if (!lineup) return { players: [], total: 0 };

    // Get Players aka Starters
    const { data: players } = await supabase.from('lineup_players')
        .select(`
            *,
            player:players(name, role, team_real)
        `)
        .eq('lineup_id', lineup.id)
        .eq('is_starter', true);

    if (!players) return { players: [], total: 0 };

    // Get Stats for these players for this Matchday
    const playerIds = players.map((p: any) => p.player_id);
    const { data: stats } = await supabase.from('match_stats')
        .select('*')
        .eq('matchday', fixture.matchday)
        .in('player_id', playerIds);

    // Map stats to players and Calculate Total
    let totalTeamScore = 0;
    const enrichedPlayers = players.map((p: any) => {
        const stat = stats?.find((s: any) => s.player_id === p.player_id) || {};
        const points = calculatePlayerTotal(stat);

        // Only add to team total if they have a vote? 
        // Logic: if no vote, sub logic would apply. For MVP we assume starters played.
        if (stat.vote) totalTeamScore += points;

        return { ...p, stats: stat, points };
    });

    return { players: enrichedPlayers, total: totalTeamScore };
}

function calculatePlayerTotal(stats: any) {
    if (!stats || stats.vote === undefined) return 0;
    let total = stats.vote;
    total += ((stats.goals_for || 0) * 3);
    total += ((stats.assists || 0) * 1);
    total -= ((stats.yellow_cards || 0) * 0.5);
    total -= ((stats.red_cards || 0) * 1);
    total += ((stats.penalties_saved || 0) * 3);
    total -= ((stats.penalties_missed || 0) * 3);
    total -= ((stats.own_goals || 0) * 2);
    total -= ((stats.goals_against || 0) * 1);
    return Math.round(total * 2) / 2;
}


function TeamLineupColumn({ teamName, players, total }: { teamName: string, players: any[], total: number }) {
    const roleOrder: any = { 'P': 1, 'D': 2, 'C': 3, 'A': 4 };
    const sortedPlayers = [...players].sort((a, b) => {
        const roleA = a.player?.role || 'A';
        const roleB = b.player?.role || 'A';
        if (roleOrder[roleA] !== roleOrder[roleB]) return roleOrder[roleA] - roleOrder[roleB];
        return 0;
    });

    return (
        <Card>
            <CardHeader className="py-3 bg-gray-50 border-b">
                <CardTitle className="text-sm font-bold uppercase text-gray-500 text-center">{teamName || 'Empty Slot'}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                    {sortedPlayers.map((p) => (
                        <PlayerRow key={p.id} player={p} />
                    ))}
                    {sortedPlayers.length === 0 && <p className="p-6 text-center text-sm text-gray-400 italic">No Lineup Available</p>}
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-between items-center font-bold text-slate-700">
                    <span>Total Points</span>
                    <span className="text-xl">{total.toFixed(1)}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function PlayerRow({ player }: { player: any }) {
    const stats = player.stats || {};
    const hasVote = stats.vote !== undefined;
    const totalPoints = player.points;

    // Badge Colors
    const roleColors: any = {
        'P': 'bg-orange-100 text-orange-700 border-orange-200',
        'D': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'C': 'bg-blue-100 text-blue-700 border-blue-200',
        'A': 'bg-rose-100 text-rose-700 border-rose-200'
    };

    // Score Colors
    let scoreColor = 'text-gray-400';
    if (hasVote) {
        if (totalPoints >= 10) scoreColor = 'text-purple-600 font-black';
        else if (totalPoints >= 7) scoreColor = 'text-green-600 font-bold';
        else if (totalPoints >= 6) scoreColor = 'text-blue-600 font-medium';
        else scoreColor = 'text-red-500 font-medium';
    }

    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50/80 transition-colors text-sm group">
            <div className="flex items-center gap-3 overflow-hidden">
                <span className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-md border ${roleColors[player.player.role] || 'bg-gray-100'}`}>
                    {player.player.role}
                </span>
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-700 truncate max-w-[140px] leading-tight">{player.player.name}</span>
                    <span className="text-[10px] text-gray-400 uppercase">{player.player.team_real}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Visual Indicators */}
                {stats.goals_for > 0 && <Badge variant="outline" className="h-5 px-1 bg-green-50 text-green-600 border-green-200 gap-1">⚽ {stats.goals_for > 1 && stats.goals_for}</Badge>}
                {stats.assists > 0 && <Badge variant="outline" className="h-5 px-1 bg-blue-50 text-blue-600 border-blue-200">+1</Badge>}
                {(stats.yellow_cards > 0 || stats.red_cards > 0) && (
                    <div className={`w-3 h-4 rounded-sm ${stats.red_cards ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                )}

                <div className="flex items-center w-16 justify-end gap-3 font-mono border-l pl-3 ml-2">
                    <span className="text-gray-400 text-xs">{hasVote ? stats.vote : '-'}</span>
                    <span className={`text-base ${scoreColor}`}>{hasVote ? totalPoints : '-'}</span>
                </div>
            </div>
        </div>
    );
}
