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
                            <h3 className="font-bold mb-2">Fixtures Preview</h3>
                            {fixtures.length > 0 ? (
                                <div className="max-h-96 overflow-y-auto border rounded p-2">
                                    {fixtures.map((f) => (
                                        <div key={f.id} className="flex justify-between py-1 border-b text-sm">
                                            <span>Day {f.matchday}</span>
                                            <span>{f.home_team_id} vs {f.away_team_id}</span>
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
