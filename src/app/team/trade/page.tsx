'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTradeProposal, getMyTrades, acceptTrade, rejectTrade, deleteTrade } from '@/app/actions/trade';
import { getAllTeams } from '@/app/actions/admin';
import { getMyRoster, getMyTeam, getMyTeamId } from '@/app/actions/user'; // Need getMyTeamId or similar
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TradePage() {
    const [teams, setTeams] = useState<any[]>([]);
    const [myId, setMyId] = useState<string | null>(null);
    const [myRoster, setMyRoster] = useState<any[]>([]);
    const [oppRoster, setOppRoster] = useState<any[]>([]);

    // Proposal Form State
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [selectedMyPlayer, setSelectedMyPlayer] = useState('');
    const [selectedOppPlayer, setSelectedOppPlayer] = useState('');
    const [credits, setCredits] = useState(0);
    const [loading, setLoading] = useState(false);

    // History State
    const [trades, setTrades] = useState<{ sent: any[], received: any[] }>({ sent: [], received: [] });

    const router = useRouter();

    useEffect(() => {
        // Init Load
        getMyTeamId().then(id => {
            if (!id) return; // Handle auth redirect usually
            setMyId(id.id);
            getAllTeams().then(all => {
                setTeams(all.filter((t: any) => t.id !== id.id));
            });
            getMyRoster(id.id).then(data => setMyRoster(data || []));
            getMyTrades().then(setTrades);
        });
    }, []);

    useEffect(() => {
        if (selectedTeamId) {
            getMyRoster(selectedTeamId).then(data => setOppRoster(data || []));
        } else {
            setOppRoster([]);
        }
    }, [selectedTeamId]);

    const handlePropose = async () => {
        if (!selectedTeamId || !selectedMyPlayer || !selectedOppPlayer) return;
        setLoading(true);
        const res = await createTradeProposal(selectedTeamId, parseInt(selectedMyPlayer), parseInt(selectedOppPlayer), Number(credits));
        if (res.success) {
            alert('Proposal sent!');
            setSelectedTeamId('');
            setSelectedMyPlayer('');
            setSelectedOppPlayer('');
            setCredits(0);
            getMyTrades().then(setTrades);
        } else {
            alert('Error: ' + res.error);
        }
        setLoading(false);
    };

    const handleAccept = async (id: number) => {
        if (!confirm('Accept this trade? This is irreversible.')) return;
        const res = await acceptTrade(id);
        if (res.success) {
            alert('Trade accepted!');
            getMyTrades().then(setTrades);
            router.refresh();
        } else {
            alert('Error: ' + res.error);
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Reject this trade?')) return;
        await rejectTrade(id);
        getMyTrades().then(setTrades);
    };

    const handleCancel = async (id: number) => {
        if (!confirm('Cancel proposal?')) return;
        await deleteTrade(id);
        getMyTrades().then(setTrades);
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 pb-24">
            <h1 className="text-3xl font-bold">Trade Center</h1>

            <Tabs defaultValue="propose">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="propose">Propose Trade</TabsTrigger>
                    <TabsTrigger value="history">My Trades</TabsTrigger>
                </TabsList>

                <TabsContent value="propose">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Proposal</CardTitle>
                            <CardDescription>Select an opponent and a player to listen to offer.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Opponent Team</Label>
                                <Select onValueChange={setSelectedTeamId} value={selectedTeamId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select team..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teams.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>I Give (My Player)</Label>
                                    <Select onValueChange={setSelectedMyPlayer} value={selectedMyPlayer}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {myRoster.map(r => (
                                                <SelectItem key={r.player.id} value={r.player.id.toString()}>
                                                    {r.player.name} ({r.player.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>I Get (Opponent Player)</Label>
                                    <Select onValueChange={setSelectedOppPlayer} value={selectedOppPlayer} disabled={!selectedTeamId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {oppRoster.map(r => (
                                                <SelectItem key={r.player.id} value={r.player.id.toString()}>
                                                    {r.player.name} ({r.player.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Credits Adjustment (Example: 10 = I pay 10. -10 = I receive 10)</Label>
                                <Input
                                    type="number"
                                    value={credits}
                                    onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                />
                            </div>

                            <Button className="w-full" onClick={handlePropose} disabled={loading || !selectedTeamId}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Proposal
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card className="mb-6">
                        <CardHeader><CardTitle>Incoming Requests</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {trades.received.length === 0 ? <p className="text-sm text-gray-500">No requests.</p> :
                                trades.received.map(t => (
                                    <div key={t.id} className="border p-4 rounded-lg flex justify-between items-center text-sm">
                                        <div>
                                            <div className="font-bold mb-1">{t.proposer_team.name}</div>
                                            <div>Offers: <span className="text-green-600 font-bold">{t.proposer_player.name}</span></div>
                                            <div>For: <span className="text-blue-600 font-bold">{t.receiver_player.name}</span></div>
                                            {t.credits_offer !== 0 && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Includes: {t.credits_offer > 0 ? `+${t.credits_offer} credits` : `${t.credits_offer} credits`}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleAccept(t.id)}>Accept</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleReject(t.id)}>Reject</Button>
                                        </div>
                                    </div>
                                ))
                            }
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Sent Proposals</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {trades.sent.length === 0 ? <p className="text-sm text-gray-500">No sent proposals.</p> :
                                trades.sent.map(t => (
                                    <div key={t.id} className="border p-4 rounded-lg flex justify-between items-center text-sm">
                                        <div>
                                            <div className="font-bold mb-1">To: {t.receiver_team.name}</div>
                                            <div>Give: {t.proposer_player.name}</div>
                                            <div>Get: {t.receiver_player.name}</div>
                                            <div className="text-xs text-gray-400 mt-1">Status: {t.status}</div>
                                        </div>
                                        {t.status === 'PENDING' && (
                                            <Button size="sm" variant="outline" onClick={() => handleCancel(t.id)}>Cancel</Button>
                                        )}
                                    </div>
                                ))
                            }
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
