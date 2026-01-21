'use client';

import { useEffect, useState } from 'react';
import { getStandings, TeamStanding } from '@/app/actions/standings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResultsSkeleton } from '@/components/skeletons';

export default function StandingsPage() {
    const [standings, setStandings] = useState<TeamStanding[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await getStandings();
            setStandings(data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="p-4"><ResultsSkeleton /></div>;

    return (
        <div className="container mx-auto p-4 pb-24 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Classifica</h1>

            <Card className="overflow-hidden border-none shadow-md">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-100">
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">#</TableHead>
                                    <TableHead className="min-w-[120px]">Squadra</TableHead>
                                    <TableHead className="text-center">PT</TableHead>
                                    <TableHead className="text-center hidden sm:table-cell">PG</TableHead>
                                    <TableHead className="text-center hidden sm:table-cell">V</TableHead>
                                    <TableHead className="text-center hidden sm:table-cell">N</TableHead>
                                    <TableHead className="text-center hidden sm:table-cell">P</TableHead>
                                    <TableHead className="text-center text-xs sm:text-sm">GF</TableHead>
                                    <TableHead className="text-center text-xs sm:text-sm">GS</TableHead>
                                    <TableHead className="text-right font-bold text-blue-600">Tot</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {standings.map((team, index) => (
                                    <TableRow key={team.teamId} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                        <TableCell className="font-bold text-center text-slate-500">{index + 1}</TableCell>
                                        <TableCell className="font-semibold">{team.teamName}</TableCell>
                                        <TableCell className="text-center font-bold text-lg">{team.points}</TableCell>
                                        <TableCell className="text-center text-gray-500 hidden sm:table-cell">{team.played}</TableCell>
                                        <TableCell className="text-center text-green-600 hidden sm:table-cell">{team.won}</TableCell>
                                        <TableCell className="text-center text-yellow-600 hidden sm:table-cell">{team.drawn}</TableCell>
                                        <TableCell className="text-center text-red-600 hidden sm:table-cell">{team.lost}</TableCell>
                                        <TableCell className="text-center text-xs sm:text-sm text-gray-600">{team.goalsFor}</TableCell>
                                        <TableCell className="text-center text-xs sm:text-sm text-gray-600">{team.goalsAgainst}</TableCell>
                                        <TableCell className="text-right font-mono text-blue-600 font-bold">{team.totalFantasyPoints.toFixed(1)}</TableCell>
                                    </TableRow>
                                ))}
                                {standings.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-gray-400">
                                            Nessuna partita giocata ancora.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Mobile Legend / Compact View Hint */}
            <div className="mt-4 text-xs text-center text-gray-400 sm:hidden">
                <p>Scorri orizzontalmente per vedere tutte le statistiche.</p>
                <p>PT: Punti Classifica | Tot: Fantapunti Totali</p>
            </div>
        </div>
    );
}
