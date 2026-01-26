'use client';

import { useEffect, useState } from 'react';
import { getStandings, TeamStanding } from '@/app/actions/standings';
import { getMyTeamId } from '@/app/actions/user';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

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

    if (loading) {
        return (
            <div className="container mx-auto max-w-[1200px] pt-24 pb-24 px-4 space-y-4">
                <div className="flex justify-center mb-8"><div className="h-8 w-48 bg-gray-200 rounded animate-pulse" /></div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-16 w-full bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40 py-5">
                <h1 className="text-center font-bold text-2xl md:text-[28px] text-foreground">
                    {t('standings')}
                </h1>
            </div>

            <div className="container mx-auto px-4 max-w-[1200px] pt-8">
                {/* Main Card Wrapper */}
                <Card className="border shadow-[0_2px_12px_rgba(0,0,0,0.08)] rounded-[16px] overflow-hidden bg-card">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table className="min-w-full border-collapse">
                                <TableHeader className="sticky top-0 z-10">
                                    <TableRow className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 border-b-2 border-border">
                                        <TableHead className="w-[48px] text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground">#</TableHead>
                                        <TableHead className="text-left font-bold text-[11px] uppercase tracking-wider text-muted-foreground pl-4 flex-1 min-w-[180px]">{t('team')}</TableHead>
                                        <TableHead className="w-[60px] text-center font-extrabold text-[11px] uppercase tracking-wider text-foreground">{t('pt')}</TableHead>
                                        <TableHead className="w-[48px] md:w-[60px] text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground hidden sm:table-cell">{t('pg')}</TableHead>
                                        <TableHead className="w-[48px] md:w-[60px] text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground hidden sm:table-cell">{t('v')}</TableHead>
                                        <TableHead className="w-[48px] md:w-[60px] text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground hidden sm:table-cell">{t('n')}</TableHead>
                                        <TableHead className="w-[48px] md:w-[60px] text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground hidden sm:table-cell">{t('l')}</TableHead>
                                        <TableHead className="w-[48px] md:w-[60px] text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t('gf')}</TableHead>
                                        <TableHead className="w-[48px] md:w-[60px] text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t('gs')}</TableHead>
                                        <TableHead className="w-[80px] text-right font-bold text-[11px] uppercase tracking-wider text-primary pr-5">{t('tot')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {standings.map((team, index) => {
                                        const isMe = team.teamId === myTeamId;
                                        const rank = index + 1;

                                        // Rank Styles
                                        let rankBadge = null;
                                        if (rank === 1) {
                                            rankBadge = "bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-sm";
                                        } else if (rank === 2) {
                                            rankBadge = "bg-slate-400 text-white";
                                        } else if (rank === 3) {
                                            rankBadge = "bg-[#CD7F32] text-white";
                                        }

                                        // Row Styles
                                        let rowBg = "bg-card hover:bg-muted/30";
                                        let borderLeft = "border-l-4 border-l-transparent";

                                        if (isMe) {
                                            rowBg = "bg-gradient-to-r from-blue-50/80 to-background dark:from-blue-900/10 dark:to-background";
                                            borderLeft = "border-l-4 border-l-[#4169E1]";
                                        } else if (rank === 1) {
                                            borderLeft = "border-l-4 border-l-amber-400";
                                            rowBg = "bg-gradient-to-r from-amber-50/50 to-background dark:from-amber-900/10 dark:to-background";
                                        }

                                        return (
                                            <TableRow
                                                key={team.teamId}
                                                className={cn(
                                                    "h-[72px] transition-all cursor-pointer border-b border-border/60 last:border-0 relative group",
                                                    rowBg
                                                )}
                                            >
                                                {/* Rank & Border Accent */}
                                                <TableCell className={cn("text-center p-0 relative", borderLeft)}>
                                                    <div className="flex items-center justify-center h-full w-full">
                                                        {rank <= 3 ? (
                                                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", rankBadge)}>
                                                                {rank}
                                                            </div>
                                                        ) : (
                                                            <span className="font-bold text-lg text-foreground/80">{rank}</span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Team */}
                                                <TableCell className="pl-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className={cn(
                                                            "w-9 h-9 md:w-10 md:h-10 border-2",
                                                            isMe ? "border-blue-500" : "border-transparent bg-muted"
                                                        )}>
                                                            <AvatarFallback className={cn(
                                                                "font-bold text-sm",
                                                                isMe ? "bg-[#4169E1] text-white" : "bg-muted text-muted-foreground"
                                                            )}>
                                                                {team.teamName.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className={cn(
                                                                "font-bold text-sm md:text-[16px] truncate max-w-[140px] md:max-w-[300px]",
                                                                isMe ? "text-[#4169E1]" : "text-foreground"
                                                            )}>
                                                                {team.teamName}
                                                            </span>
                                                            {isMe && <span className="text-[10px] text-[#4169E1]/80 font-semibold uppercase tracking-wider md:hidden">La Mia Rosa</span>}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Points */}
                                                <TableCell className="text-center p-2">
                                                    <div className="inline-flex items-center justify-center w-[50px] h-[36px] bg-[#F0F9FF] dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                                        <span className="font-bold text-xl md:text-2xl text-foreground dark:text-blue-100">{team.points}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Stats */}
                                                <TableCell className="text-center text-[15px] font-medium text-muted-foreground hidden sm:table-cell">{team.played}</TableCell>
                                                <TableCell className="text-center text-[15px] font-medium text-muted-foreground hidden sm:table-cell">{team.won}</TableCell>
                                                <TableCell className="text-center text-[15px] font-medium text-muted-foreground hidden sm:table-cell">{team.drawn}</TableCell>
                                                <TableCell className="text-center text-[15px] font-medium text-muted-foreground hidden sm:table-cell">{team.lost}</TableCell>

                                                <TableCell className="text-center text-[13px] font-medium text-muted-foreground/70 hidden md:table-cell">{team.goalsFor}</TableCell>
                                                <TableCell className="text-center text-[13px] font-medium text-muted-foreground/70 hidden md:table-cell">{team.goalsAgainst}</TableCell>

                                                {/* Total Fantasy Points */}
                                                <TableCell className="text-right pr-5 py-3">
                                                    <div className="inline-flex items-center justify-center px-3 py-1.5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/20 rounded-lg min-w-[70px]">
                                                        <span className="font-bold text-base md:text-lg text-[#4169E1] dark:text-blue-400 font-mono">
                                                            {team.totalFantasyPoints.toFixed(1)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}

                                    {standings.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={10} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <Trophy className="w-16 h-16 text-muted-foreground/20 mb-4" />
                                                    <p className="text-lg font-medium">Classifica non disponibile</p>
                                                    <p className="text-sm opacity-60">Inizia a giocare per vedere la classifica!</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
