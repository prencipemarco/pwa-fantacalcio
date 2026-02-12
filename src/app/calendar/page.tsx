'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function CalendarPage() {
    const [leagues, setLeagues] = useState<any[]>([]);
    const [fixtures, setFixtures] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
            // 1. Fetch Leagues
            const { data: leaguesData } = await supabase.from('leagues').select('*');
            if (leaguesData) setLeagues(leaguesData);

            // 2. Fetch Teams (for names)
            const { data: teamsData } = await supabase.from('teams').select('id, name, logo_url');
            if (teamsData) setTeams(teamsData);

            // 3. Fetch Fixtures (Default to first league if exists)
            if (leaguesData && leaguesData.length > 0) {
                fetchFixtures(leaguesData[0].id);
            } else {
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchFixtures = async (leagueId: string) => {
        const { data } = await supabase.from('fixtures')
            .select('*')
            .eq('league_id', leagueId)
            .order('matchday', { ascending: true });

        if (data) setFixtures(data);
        setLoading(false);
    };

    const getTeam = (id: string) => teams.find(t => t.id === id);

    // Group by Matchday
    const groupedFixtures = fixtures.reduce((acc: any, fixture: any) => {
        if (!acc[fixture.matchday]) acc[fixture.matchday] = [];
        acc[fixture.matchday].push(fixture);
        return acc;
    }, {});

    return (
        <div className="container mx-auto p-4 max-w-3xl min-h-screen pb-20">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <CalendarIcon className="h-6 w-6" />
                    Calendario Serie A
                </h1>
            </div>

            {loading ? (
                <div className="text-center py-10">Caricamento calendario...</div>
            ) : (
                <div className="space-y-6">
                    {Object.keys(groupedFixtures).map((matchday) => (
                        <Card key={matchday} className="overflow-hidden border-none shadow-md">
                            <CardHeader className="bg-primary/5 py-3 border-b">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider flex justify-between items-center text-primary">
                                    <span>Giornata {matchday}</span>
                                    {/* Placeholder for date if available in future */}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {groupedFixtures[matchday].map((f: any) => {
                                        const homeTeam = getTeam(f.home_team_id);
                                        const awayTeam = getTeam(f.away_team_id);

                                        return (
                                            <div key={f.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-3 hover:bg-muted/30 transition-colors">
                                                {/* Home */}
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    {homeTeam?.logo_url ? (
                                                        <img src={homeTeam.logo_url} className="w-6 h-6 object-contain" alt={homeTeam.name} />
                                                    ) : (
                                                        <div className="w-6 h-6 bg-gray-200 rounded-full" />
                                                    )}
                                                    <span className="font-semibold text-sm truncate">{homeTeam?.name || 'TBD'}</span>
                                                </div>

                                                {/* Score / VS */}
                                                <div className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full text-center min-w-[40px]">
                                                    VS
                                                </div>

                                                {/* Away */}
                                                <div className="flex items-center justify-end gap-2 overflow-hidden text-right">
                                                    <span className="font-semibold text-sm truncate">{awayTeam?.name || 'TBD'}</span>
                                                    {awayTeam?.logo_url ? (
                                                        <img src={awayTeam.logo_url} className="w-6 h-6 object-contain" alt={awayTeam.name} />
                                                    ) : (
                                                        <div className="w-6 h-6 bg-gray-200 rounded-full" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {fixtures.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            Nessun calendario disponibile.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
