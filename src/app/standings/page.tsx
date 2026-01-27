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

                                        // Rank Styles - Borders & Backgrounds
                                        let borderLeft = "border-l-4 border-l-transparent";
                                        let rowBg = "bg-card hover:bg-muted/30";
                                        let rankColor = "text-muted-foreground";

                                        if (rank === 1) {
                                            borderLeft = "border-l-4 border-l-amber-400"; // Gold
                                            rowBg = "bg-gradient-to-r from-amber-50/40 to-background dark:from-amber-900/10 dark:to-background";
                                            rankColor = "text-amber-600 dark:text-amber-400";
                                        } else if (rank === 2) {
                                            borderLeft = "border-l-4 border-l-slate-400"; // Silver
                                            rowBg = "bg-gradient-to-r from-slate-50/40 to-background dark:from-slate-900/10 dark:to-background";
                                            rankColor = "text-slate-500 dark:text-slate-400";
                                        } else if (rank === 3) {
                                            borderLeft = "border-l-4 border-l-[#CD7F32]"; // Bronze
                                            rowBg = "bg-gradient-to-r from-orange-50/40 to-background dark:from-orange-900/10 dark:to-background";
                                            rankColor = "text-[#CD7F32] dark:text-orange-400";
                                        }

                                        // "My Team" Highlight (Overridden or blended?)
                                        // Let's make "IsMe" have a specific blue highlight, but if top 3, keep the left border of the rank?
                                        // User wants "Cornice del giocatore relativa alla posizione". 
                                        // Let's keep Rank Border as priority for Top 3, but use Blue formatting for Text/Avatar if IsMe?
                                        // Or if IsMe is Top 1, it should probably be Gold bordered but maybe Blue background?
                                        // Let's prioritize Rank Border.

                                        if (isMe) {
                                            // Ensure contrast. If I am 1st, Gold border is cooler than Blue border.
                                            // But let's add a subtle blue tint if not top 3, or maybe modify background if isMe?
                                            if (rank > 3) {
                                                borderLeft = "border-l-4 border-l-[#4169E1]";
                                                rowBg = "bg-gradient-to-r from-blue-50/80 to-background dark:from-blue-900/10 dark:to-background";
                                            } else {
                                                // I am top 3. Keep rank border, but maybe add slight blue mix?
                                                // Let's stick to Rank visuals as primary for Table. My Team is highlighted by Avatar border anyway.
                                            }
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
                                                <TableCell className={cn("text-center p-0 relative w-[40px] md:w-[60px]", borderLeft)}>
                                                    <div className="flex items-center justify-center h-full w-full">
                                                        <span className={cn("font-black text-sm md:text-lg", rankColor)}>{rank}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Team */}
                                                <TableCell className="pl-2 md:pl-4 py-3">
                                                    <div className="flex items-center gap-2 md:gap-3">
                                                        <Avatar className={cn(
                                                            "w-7 h-7 md:w-10 md:h-10 border-2 flex-shrink-0",
                                                            isMe ? "border-blue-500" : "border-transparent bg-muted"
                                                        )}>
                                                            <AvatarFallback className={cn(
                                                                "font-bold text-[10px] md:text-sm",
                                                                isMe ? "bg-[#4169E1] text-white" : "bg-muted text-muted-foreground"
                                                            )}>
                                                                {team.teamName.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className={cn(
                                                                "font-bold text-xs md:text-[16px] truncate max-w-[100px] md:max-w-[300px]",
                                                                isMe ? "text-[#4169E1]" : "text-foreground"
                                                            )}>
                                                                {team.teamName}
                                                            </span>
                                                            {isMe && <span className="text-[9px] text-[#4169E1]/80 font-semibold uppercase tracking-wider md:hidden truncate">Tu</span>}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Points */}
                                                <TableCell className="text-center p-1 md:p-2">
                                                    <div className="inline-flex items-center justify-center w-[36px] h-[28px] md:w-[50px] md:h-[36px] bg-[#F0F9FF] dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                                        <span className="font-bold text-sm md:text-2xl text-foreground dark:text-blue-100">{team.points}</span>
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
                                                <TableCell className="text-right pr-3 md:pr-5 py-3">
                                                    <div className="inline-flex items-center justify-center px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/20 rounded-lg min-w-[50px] md:min-w-[70px]">
                                                        <span className="font-bold text-xs md:text-lg text-[#4169E1] dark:text-blue-400 font-mono">
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
