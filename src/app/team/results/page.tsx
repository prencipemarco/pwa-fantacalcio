'use client';

import { useState, useEffect } from 'react';
import { getMyTeam } from '@/app/actions/user';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResultsSkeleton } from '@/components/skeletons';
import Link from 'next/link';

export default function ResultsPage() {
    const [fixtures, setFixtures] = useState<any[]>([]);
    const [teamId, setTeamId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data: session } = await supabase.auth.getSession();
            if (!session.session) {
                setLoading(false);
                return;
            }
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
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <ResultsSkeleton />;

    if (!teamId) return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">No Team Found</h2>
            <p className="text-gray-500 mb-6">You need to create a team to see results.</p>
            <Button asChild className="bg-blue-600 text-white">
                <a href="/team/create">Create Team</a>
            </Button>
        </div>
    );

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
                        <Link href={`/team/results/${f.id}`} key={f.id} className="block group">
                            <Card className={`border-l-4 transition-all group-hover:shadow-md ${resultColor}`}>
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div className="text-sm font-bold text-gray-500 w-12 text-center">
                                        Day {f.matchday}
                                    </div>
                                    <div className={`flex-1 flex justify-between items-center px-4 ${f.calculated ? 'font-bold' : ''}`}>
                                        <span className={isHome ? 'text-primary' : ''}>
                                            {isHome ? 'My Team' : 'Opponent'}
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
                        </Link>
                    );
                })}

                {fixtures.length === 0 && <p>No fixtures found.</p>}
            </div>
        </div>
    );
}
