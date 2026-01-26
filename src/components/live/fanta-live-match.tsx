'use client';

import { useEffect, useState } from 'react';
import { getLineup } from '@/app/actions/team';
import { getLiveModifier } from '@/lib/live-mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FantaLiveMatchProps {
    teamId: string;
}

export function FantaLiveMatch({ teamId }: FantaLiveMatchProps) {
    const [lineup, setLineup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const MATCHDAY = 22; // Hardcoded for demo

    useEffect(() => {
        const fetchLineup = async () => {
            setLoading(true);
            const res = await getLineup(teamId, MATCHDAY);
            if (res.success) {
                setLineup(res.data);
            }
            setLoading(false);
        };
        fetchLineup();
    }, [teamId]);

    if (loading) return <div className="text-center py-10 text-gray-500 dark:text-stone-500">Caricamento formazione...</div>;

    if (!lineup) return (
        <div className="text-center py-10">
            <h3 className="tex-xl font-bold">Formazione non inserita!</h3>
            <p className="text-stone-400">Non hai schierato la formazione per la giornata {MATCHDAY}.</p>
        </div>
    );

    // Process Players
    const starters = lineup.lineup_players
        .filter((p: any) => p.is_starter)
        .sort((a: any, b: any) => a.bench_order - b.bench_order); // Sort by order if available, or role

    const bench = lineup.lineup_players
        .filter((p: any) => !p.is_starter)
        .sort((a: any, b: any) => a.bench_order - b.bench_order);

    let totalScore = 0;

    return (
        <div className="space-y-6 pb-24">
            {/* Scoreboard */}
            <Card className="bg-stone-900 border-stone-800 text-white mb-6 sticky top-16 z-30 shadow-xl">
                <CardContent className="p-4 flex justify-between items-center">
                    <div className="text-left">
                        <div className="text-sm text-stone-400 font-bold uppercase tracking-wider">La Tua Squadra</div>
                        <div className="text-3xl font-bold text-green-400 font-mono">
                            {/* Calculated Render */}
                            <LiveScoreCounter starters={starters} onTotal={(t) => totalScore = t} />
                        </div>
                    </div>
                    <div className="text-right opacity-50">
                        <div className="text-sm text-stone-400 font-bold uppercase tracking-wider">Avversario</div>
                        <div className="text-3xl font-bold text-stone-600 font-mono">0.0</div>
                    </div>
                </CardContent>
            </Card>

            {/* Starters List */}
            <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase text-stone-500 px-2 flex justify-between">
                    <span>Titolari</span>
                    <span>Voto Live</span>
                </h3>
                {starters.map((p: any) => (
                    <PlayerLiveRow key={p.player.id} player={p.player} />
                ))}
            </div>

            {/* Bench List */}
            <div className="space-y-2 mt-6">
                <h3 className="text-sm font-bold uppercase text-stone-500 px-2">Panchina</h3>
                {bench.map((p: any) => (
                    <PlayerLiveRow key={p.player.id} player={p.player} isBench />
                ))}
            </div>
        </div>
    );
}

function LiveScoreCounter({ starters, onTotal }: { starters: any[], onTotal: (n: number) => void }) {
    // Determine score
    const total = starters.reduce((acc, p) => {
        const bonus = getLiveModifier(p.player.name);
        const baseVote = 6.0; // Assume 6 politically for everyone playing simulated
        return acc + baseVote + bonus;
    }, 0);

    // In a real app we'd pass this up, but for display we just render
    return <span>{total.toFixed(1)}</span>;
}

function PlayerLiveRow({ player, isBench }: { player: any, isBench?: boolean }) {
    const bonus = getLiveModifier(player.name);
    // Logic: If Match is LIVE/Finished, base is 6. If not, hidden.
    // For Mock, we assume "Simulated" Status.

    // We can infer if they "Played" by checking if we have any Modifier event or if Simulated Match is active.
    // Let's assume everyone in simulation plays 6 and gets bonus.

    const baseVote = 6.0;
    const totalVote = baseVote + bonus;

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'P': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
            case 'D': return 'bg-green-500/20 text-green-500 border-green-500/30';
            case 'C': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
            case 'A': return 'bg-red-500/20 text-red-500 border-red-500/30';
            default: return 'bg-stone-800 text-stone-400';
        }
    }

    return (
        <Card className={`border-stone-800 ${isBench ? 'bg-stone-950 opacity-60' : 'bg-stone-900'}`}>
            <CardContent className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`${getRoleColor(player.role)} w-6 h-6 p-0 flex items-center justify-center text-[10px]`}>
                        {player.role}
                    </Badge>
                    <div>
                        <div className="font-bold text-sm text-stone-200">{player.name}</div>
                        <div className="text-[10px] text-stone-500 uppercase">{player.team_real}</div>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className={`font-mono font-bold text-lg ${totalVote >= 6.5 ? 'text-green-400' : totalVote < 6 ? 'text-red-400' : 'text-stone-300'}`}>
                        {totalVote}
                    </div>
                    {bonus !== 0 && (
                        <div className="text-[10px] font-mono">
                            {bonus > 0 ? `+${bonus}` : bonus}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
