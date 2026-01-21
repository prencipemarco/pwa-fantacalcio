'use client';

import { useState, useEffect } from 'react';
import { getActiveAuctions, placeBid, resolveAuction } from '@/app/actions/market';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { Timer, ArrowLeft, ArrowUp } from 'lucide-react';

export function ActiveAuctionsList({ onBack, teamId, refreshCredits }: { onBack: () => void, teamId: string, refreshCredits: () => void }) {
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [bidAmount, setBidAmount] = useState<{ [key: number]: number }>({});

    const loadAuctions = async () => {
        const data = await getActiveAuctions();
        setAuctions(data);
    };

    useEffect(() => {
        loadAuctions();
        const interval = setInterval(loadAuctions, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleBid = async (auctionId: number, amount: number) => {
        if (!confirm(`Bid ${amount} credits?`)) return;
        setLoading(true);
        const res = await placeBid(auctionId, amount);
        if (res.success) {
            await loadAuctions();
            refreshCredits();
            setBidAmount(prev => ({ ...prev, [auctionId]: 0 })); // Reset input
        } else {
            // If error implies CLOSED, try resolving
            if (res.error === 'Auction ended.') {
                await resolveAuction(auctionId);
                await loadAuctions();
            }
            alert(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
                <h2 className="text-xl font-bold">Active Auctions</h2>
            </div>

            {auctions.length === 0 && <p className="text-center text-gray-500 py-8">No active auctions.</p>}

            {auctions.map((a) => {
                const isWinning = a.current_winner_team_id === teamId;
                const minBid = a.current_price + 1;
                const timeLeft = new Date(a.end_time);

                return (
                    <Card key={a.id} className={`border-l-4 ${isWinning ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">{a.player.name}</span>
                                        <Badge variant="outline">{a.player.role}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-500">{a.player.team_real}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold font-mono">{a.current_price}</div>
                                    <div className="text-xs text-gray-400 uppercase">Current Bid</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm mb-4 bg-slate-50 p-2 rounded">
                                <div className="flex items-center gap-1 text-orange-600 font-medium">
                                    <Timer className="w-4 h-4" />
                                    {formatDistanceToNow(timeLeft, { addSuffix: true })}
                                </div>
                                <div className="text-gray-600">
                                    Winner: {a.winner ? <span className="font-bold">{a.winner.name}</span> : 'None'}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    size="sm"
                                    onClick={() => handleBid(a.id, a.current_price + 1)}
                                    disabled={loading || isWinning}
                                >
                                    Bid {a.current_price + 1}
                                </Button>
                                <div className="flex gap-1 flex-1">
                                    <Input
                                        type="number"
                                        placeholder="Custom"
                                        className="h-9 text-xs"
                                        value={bidAmount[a.id] || ''}
                                        onChange={(e) => setBidAmount({ ...bidAmount, [a.id]: parseInt(e.target.value) })}
                                    />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleBid(a.id, bidAmount[a.id] || 0)}
                                        disabled={loading || !bidAmount[a.id] || bidAmount[a.id] <= a.current_price}
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
