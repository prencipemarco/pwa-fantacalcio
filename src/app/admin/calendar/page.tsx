'use client';

import { useState, useEffect } from 'react';
import { generateCalendar } from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CalendarPage() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [leagues, setLeagues] = useState<any[]>([]);
    const [fixtures, setFixtures] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        // Fetch leagues
        const fetchLeagues = async () => {
            const { data } = await supabase.from('leagues').select('*');
            if (data) setLeagues(data);
        };
        fetchLeagues();
    }, []);

    const handleGenerate = async (leagueId: string) => {
        setLoading(true);
        setMsg(null);
        try {
            const res = await generateCalendar(leagueId);
            if (res.success) {
                setMsg({ type: 'success', text: `Calendar generated with ${res.count} fixtures.` });
                fetchFixtures(leagueId);
            } else {
                setMsg({ type: 'error', text: res.error || 'Unknown error' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to generate calendar.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchFixtures = async (leagueId: string) => {
        const { data } = await supabase.from('fixtures').select('*').eq('league_id', leagueId).order('matchday', { ascending: true });
        if (data) setFixtures(data);
    };

    // Load fixtures for first league automatically on start
    useEffect(() => {
        if (leagues.length > 0) {
            fetchFixtures(leagues[0].id);
        }
    }, [leagues]);

    const getTeamName = (id: string) => {
        const t = teams.find(team => team.id === id);
        return t ? t.name : id.substring(0, 8);
    };

    // Fetch teams for name mapping
    const [teams, setTeams] = useState<any[]>([]);
    useEffect(() => {
        const loadTeams = async () => {
            const { data } = await supabase.from('teams').select('id, name');
            if (data) setTeams(data);
        }
        loadTeams();
    }, []);

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Match Calendar</h1>

            {leagues.length === 0 && <p>No leagues found. Please create a league in DB.</p>}

            {leagues.map((league) => (
                <Card key={league.id} className="mb-8">
                    <CardHeader>
                        <CardTitle>{league.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 mb-4">
                            Generates a full 38-matchday calendar logic.
                            If teams are few (e.g. 8), rounds will repeat (Andata/Ritorno/Andata...) until Day 38.
                        </p>
                        <Button
                            onClick={() => handleGenerate(league.id)}
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Calendar'}
                        </Button>

                        {msg && (
                            <Alert className={`mt-4 ${msg.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                                <AlertTitle>{msg.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                                <AlertDescription>{msg.text}</AlertDescription>
                            </Alert>
                        )}

                        <div className="mt-6">
                            <h3 className="font-bold mb-4">Fixtures Preview</h3>
                            {fixtures.length > 0 ? (
                                <div className="space-y-8">
                                    {Array.from(new Set(fixtures.map(f => f.matchday))).map((matchday) => (
                                        <div key={matchday} className="border rounded-lg overflow-hidden">
                                            <div className="bg-gray-100 px-4 py-2 font-bold text-sm border-b flex justify-between">
                                                <span>Matchday {matchday}</span>
                                            </div>
                                            <div className="p-0">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b bg-gray-50 text-gray-500">
                                                            <th className="py-2 px-4 text-left w-[40%]">Home</th>
                                                            <th className="py-2 px-4 text-center">Score</th>
                                                            <th className="py-2 px-4 text-right w-[40%]">Away</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {fixtures.filter(f => f.matchday === matchday).map((f) => (
                                                            <tr key={f.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                                                <td className="py-2 px-4 font-semibold">{getTeamName(f.home_team_id)}</td>
                                                                <td className="py-2 px-4 text-center text-gray-400">vs</td>
                                                                <td className="py-2 px-4 text-right font-semibold">{getTeamName(f.away_team_id)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No fixtures yet. Click Generate to create.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
