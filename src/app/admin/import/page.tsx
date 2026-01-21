'use client';

import { useState } from 'react';
import { parsePlayerListone, parseRosterCSV, parseVotesCSV } from '@/lib/fantacalcio/parsers';
import { importPlayers, importRosters, importVotes } from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

export default function ImportPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [matchday, setMatchday] = useState<number>(1);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'players' | 'rosters' | 'votes') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setResult(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;

            try {
                let res;
                if (type === 'players') {
                    const data = parsePlayerListone(text);
                    res = await importPlayers(data);
                } else if (type === 'rosters') {
                    const data = parseRosterCSV(text);
                    res = await importRosters(data);
                } else if (type === 'votes') {
                    const data = parseVotesCSV(text);
                    res = await importVotes(data, matchday);
                }

                setResult(res);
            } catch (err) {
                setResult({ success: false, error: 'Failed to parse or upload file.' });
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Admin Import Dashboard</h1>

            <Tabs defaultValue="players">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="players">Players (Listone)</TabsTrigger>
                    <TabsTrigger value="rosters">Rosters</TabsTrigger>
                    <TabsTrigger value="votes">Votes</TabsTrigger>
                </TabsList>

                {/* PLAYERS IMPORT */}
                <TabsContent value="players">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Players</CardTitle>
                            <CardDescription>Upload the official listone CSV (Cod, Ruolo, Nome, Squadra, Quotazione).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="players-file">Select CSV</Label>
                                <Input id="players-file" type="file" accept=".csv,.txt" onChange={(e) => handleFileChange(e, 'players')} disabled={loading} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ROSTERS IMPORT */}
                <TabsContent value="rosters">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Rosters</CardTitle>
                            <CardDescription>Upload auction results CSV (Team Name, Player Name, Price).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="roster-file">Select CSV</Label>
                                <Input id="roster-file" type="file" accept=".csv,.txt" onChange={(e) => handleFileChange(e, 'rosters')} disabled={loading} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* VOTES IMPORT */}
                <TabsContent value="votes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Votes</CardTitle>
                            <CardDescription>Upload weekly Fantacalcio.it CSV.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="matchday">Matchday (Giornata)</Label>
                                <Input
                                    id="matchday"
                                    type="number"
                                    min={1}
                                    max={38}
                                    value={matchday}
                                    onChange={(e) => setMatchday(parseInt(e.target.value))}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="votes-file">Select CSV</Label>
                                <Input id="votes-file" type="file" accept=".csv,.txt" onChange={(e) => handleFileChange(e, 'votes')} disabled={loading} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* RESULT ALERT */}
            {loading && <p className="mt-4 text-blue-500">Processing...</p>}

            {result && (
                <Alert className={`mt-6 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
                    <AlertDescription>
                        {result.success
                            ? `Processed ${result.count} records successfully.`
                            : `Error: ${result.error}`}
                        {result.details && result.details.length > 0 && (
                            <ul className="mt-2 text-xs list-disc pl-4 h-32 overflow-y-auto">
                                {result.details.map((d: string, i: number) => <li key={i}>{d}</li>)}
                            </ul>
                        )}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
