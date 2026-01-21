'use client';

import { useState, useEffect } from 'react';
import { getMyTeam } from '@/app/actions/user';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ResultsPage() {
    const [fixtures, setFixtures] = useState<any[]>([]);
    const [teamId, setTeamId] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const load = async () => {
            const { data: session } = await supabase.auth.getSession();
            if (!session.session) return;
            const team = await getMyTeam(session.session.user.id);
            if (team) {
                setTeamId(team.id);
                const { data: fixturesData } = await supabase
                    .from('fixtures')
                    .select('*')
                    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
                    .order('matchday', { ascending: true });
                if (fixturesData) setFixtures(fixturesData);
            }
        };
        load();
    }, []);

    if (!teamId) return <div className="p-4">Loading...</div>;

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Match Results</h1>

            <div className="space-y-4">
                {fixtures.map((f) => {
                    const isHome = f.home_team_id === teamId;
                    const score = f.calculated ? `${f.home_goals} - ${f.away_goals}` : 'vs';
                    const resultColor = !f.calculated ? 'bg-gray-100' :
                        ((isHome && f.home_goals > f.away_goals) || (!isHome && f.away_goals > f.home_goals)) ? 'bg-green-100 border-green-500' :
                            (f.home_goals === f.away_goals) ? 'bg-yellow-50 border-yellow-500' : 'bg-red-50 border-red-500';

                    return (
                        <Card key={f.id} className={`border-l-4 ${resultColor}`}>
                            <CardContent className="p-4 flex justify-between items-center">
                                <div className="text-sm font-bold text-gray-500 w-12 text-center">
                                    Day {f.matchday}
                                </div>
                                <div className={`flex-1 flex justify-between items-center px-4 ${f.calculated ? 'font-bold' : ''}`}>
                                    <span className={isHome ? 'text-primary' : ''}>
                                        {isHome ? 'My Team' : 'Opponent'}
                                        {/* We would fetch opponent name here ideally */}
                                    </span>
                                    <span className="mx-4 text-xl">{score}</span>
                                    <span className={!isHome ? 'text-primary' : ''}>
                                        {!isHome ? 'My Team' : 'Opponent'}
                                    </span>
                                </div>
                                <div>
                                    {f.calculated ? <Badge>Finished</Badge> : <Badge variant="outline">Upcoming</Badge>}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {fixtures.length === 0 && <p>No fixtures found.</p>}
            </div>
        </div>
    );
}
