'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/loading-spinner';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type TeamWithRoster = {
    id: string;
    name: string;
    credits_left: number;
    rosters: {
        player: {
            id: number;
            name: string;
            role: string;
            team_real: string;
        };
        purchase_price: number;
    }[];
};

export default function AllTeamsPage() {
    const [teams, setTeams] = useState<TeamWithRoster[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            const supabase = createClient();

            // Fetch teams + roster + players
            const { data } = await supabase
                .from('teams')
                .select(`
                    id, 
                    name, 
                    credits_left, 
                    rosters(
                        purchase_price,
                        player:players(id, name, role, team_real)
                    )
                `)
                .order('name');

            if (data) setTeams(data as any);
            setLoading(false);
        };

        fetchTeams();
    }, []);

    if (loading) return <LoadingPage />;

    return (
        <div className="container mx-auto p-4 pb-24 pt-4 max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
                <Link href="/">
                    <Button variant="ghost" size="icon"><ArrowLeft /></Button>
                </Link>
                <h1 className="text-2xl font-bold">Tutte le Squadre</h1>
            </div>

            <div className="space-y-4">
                {teams.map(team => (
                    <Card key={team.id} className="overflow-hidden">
                        <div
                            className="p-3 flex justify-between items-center cursor-pointer bg-white dark:bg-zinc-900 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800"
                            onClick={() => setExpandedTeamId(expandedTeamId === team.id ? null : team.id)}
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">{team.name}</span>
                                <span className="text-xs text-green-600 font-mono">{team.credits_left} cr.</span>
                            </div>
                            {expandedTeamId === team.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>

                        {expandedTeamId === team.id && (
                            <div className="bg-gray-50 dark:bg-zinc-950/50 p-4 border-t dark:border-zinc-800 max-h-96 overflow-y-auto stop-swipe-nav">
                                {team.rosters.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Nessun giocatore in rosa.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {team.rosters.map(r => (
                                            <div key={r.player.id} className="flex justify-between items-center text-sm border-b border-gray-100 last:border-0 pb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold w-6 ${r.player.role === 'P' ? 'text-orange-500' :
                                                        r.player.role === 'D' ? 'text-green-600' :
                                                            r.player.role === 'C' ? 'text-blue-600' : 'text-red-600'
                                                        }`}>{r.player.role}</span>
                                                    <span>{r.player.name}</span>
                                                    <span className="text-xs text-gray-400 capitalize">({r.player.team_real.toLowerCase()})</span>
                                                </div>
                                                <span className="font-mono text-gray-600">{r.purchase_price}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
