'use client';

import { useEffect, useState } from 'react';
import { getStandings, TeamStanding } from '@/app/actions/standings';
import { getMyTeamId } from '@/app/actions/user';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResultsSkeleton } from '@/components/skeletons';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function StandingsPage() {
    const { t } = useLanguage();
    const [standings, setStandings] = useState<TeamStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [myTeamId, setMyTeamId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [data, teamData] = await Promise.all([
                getStandings(),
                getMyTeamId()
            ]);
            setStandings(data);
            if (teamData) setMyTeamId(teamData.id);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="p-4 container mx-auto max-w-4xl pt-20"><ResultsSkeleton /></div>;

    return (
        <div className="container mx-auto p-4 pb-24 max-w-3xl pt-20">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {t('standings')}
                </h1>
            </div>

            <Card className="shadow-sm border rounded-lg overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 border-b hover:bg-gray-50">
                                    <TableHead className="w-[50px] text-center font-semibold text-gray-600">{t('rank')}</TableHead>
                                    <TableHead className="min-w-[150px] font-semibold text-gray-600">{t('team')}</TableHead>
                                    <TableHead className="text-center font-bold text-gray-900">{t('pt')}</TableHead>
                                    <TableHead className="text-center text-xs text-gray-500 hidden sm:table-cell">{t('pg')}</TableHead>
                                    <TableHead className="text-center text-xs text-gray-500 hidden sm:table-cell">{t('v')}</TableHead>
                                    <TableHead className="text-center text-xs text-gray-500 hidden sm:table-cell">{t('n')}</TableHead>
                                    <TableHead className="text-center text-xs text-gray-500 hidden sm:table-cell">{t('l')}</TableHead>
                                    <TableHead className="text-center text-xs text-gray-500 hidden md:table-cell">{t('gf')}</TableHead>
                                    <TableHead className="text-center text-xs text-gray-500 hidden md:table-cell">{t('gs')}</TableHead>
                                    <TableHead className="text-right font-semibold text-indigo-600 pr-6">{t('tot')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {standings.map((team, index) => {
                                    const isMe = team.teamId === myTeamId;
                                    const rank = index + 1;

                                    return (
                                        <TableRow key={team.teamId} className={`border-b last:border-0 h-14 ${isMe ? 'bg-blue-50/60' : ''}`}>
                                            <TableCell className="text-center text-gray-500 font-medium text-sm">
                                                {rank}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8 border border-gray-200">
                                                        <AvatarFallback className={`${isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'} text-xs font-bold`}>
                                                            {team.teamName.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className={`font-semibold text-sm ${isMe ? 'text-blue-700' : 'text-gray-900'}`}>
                                                            {team.teamName}
                                                        </span>
                                                        {isMe && <span className="text-[10px] text-blue-500 font-medium sm:hidden">You</span>}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-lg text-gray-900">
                                                {team.points}
                                            </TableCell>

                                            {/* Sub stats */}
                                            <TableCell className="text-center text-gray-600 text-sm hidden sm:table-cell">{team.played}</TableCell>
                                            <TableCell className="text-center text-gray-600 text-sm hidden sm:table-cell">{team.won}</TableCell>
                                            <TableCell className="text-center text-gray-600 text-sm hidden sm:table-cell">{team.drawn}</TableCell>
                                            <TableCell className="text-center text-gray-600 text-sm hidden sm:table-cell">{team.lost}</TableCell>

                                            <TableCell className="text-center text-xs text-gray-500 hidden md:table-cell">{team.goalsFor}</TableCell>
                                            <TableCell className="text-center text-xs text-gray-500 hidden md:table-cell">{team.goalsAgainst}</TableCell>

                                            <TableCell className="text-right font-mono font-bold text-indigo-600 pr-6 text-base">
                                                {team.totalFantasyPoints.toFixed(1)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {standings.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-gray-400 text-sm">
                                            {t('noGames')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-4 flex justify-between px-2 text-[10px] text-gray-400 sm:hidden">
                <span>{t('scrollHint')}</span>
                <span><span className="font-bold text-indigo-600">Tot</span> = Punti Fanta</span>
            </div>
        </div>
    );
}
