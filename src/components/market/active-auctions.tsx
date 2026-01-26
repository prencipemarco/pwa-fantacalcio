'use client';

import { useState, useEffect } from 'react';
import { getActiveAuctions, placeBid, resolveAuction } from '@/app/actions/market';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Timer, ArrowLeft, ArrowUp, Loader2, Gavel } from 'lucide-react';
import { AuctionTimer } from './auction-timer';

export function ActiveAuctionsList({ onBack, teamId, refreshCredits }: { onBack: () => void, teamId: string, refreshCredits: () => void }) {
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [bidAmount, setBidAmount] = useState<{ [key: number]: number }>({});
    const [processingBid, setProcessingBid] = useState<number | null>(null);

    const loadAuctions = async () => {
        const data = await getActiveAuctions();
        setAuctions(data);
    };

    useEffect(() => {
        loadAuctions();
        const interval = setInterval(loadAuctions, 3000); // Faster polling (3s) for smoother experience
        return () => clearInterval(interval);
    }, []);

    const handleBid = async (auctionId: number, amount: number) => {
        // if (!confirm(`Bid ${amount} credits?`)) return; // Removed confirm for faster bidding
        setProcessingBid(auctionId);
        const res = await placeBid(auctionId, amount);
        if (res.success) {
            await loadAuctions();
            refreshCredits();
            setBidAmount(prev => ({ ...prev, [auctionId]: 0 }));
        } else {
            if (res.error === 'Auction ended.') {
                await resolveAuction(auctionId);
                await loadAuctions();
            } else {
                alert(res.error);
            }
        }
        setProcessingBid(null);
    };

    if (auctions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted p-4 rounded-full mb-3">
                    <Gavel className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Nessuna asta attiva al momento.</p>
                <p className="text-sm text-gray-400">Vai in "Listone" per crearne una!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auctions.map((a) => {
                const isWinning = a.current_winner_team_id === teamId;
                const minBid = a.current_price + 1;

                return (
                    <Card key={a.id} className={`border transition-all shadow-sm ${isWinning ? 'border-green-500 bg-green-50/10 dark:bg-green-900/10' : 'border-border hover:border-primary/50'}`}>
                        <CardContent className="p-3">
                            {/* Header: Player Info & Timer */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0
                                        ${a.player.role === 'P' ? 'bg-orange-500' :
                                            a.player.role === 'D' ? 'bg-green-600' :
                                                a.player.role === 'C' ? 'bg-blue-600' : 'bg-red-600'
                                        }`}>
                                        {a.player.role}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="font-bold text-[15px] leading-tight truncate">{a.player.name}</div>
                                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{a.player.team_real}</div>
                                    </div>
                                </div>

                                <Badge variant={isWinning ? "default" : "outline"} className={`h-7 px-2 font-mono text-[11px] ${isWinning ? 'bg-green-600 hover:bg-green-600' : ''}`}>
                                    <AuctionTimer endTime={a.end_time} />
                                </Badge>
                            </div>

                            {/* Price Info */}
                            <div className="flex justify-between items-end mb-4 bg-muted/30 p-3 rounded-lg">
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Offerta Attuale</div>
                                    <div className="text-2xl font-black font-mono flex items-center gap-1">
                                        {a.current_price} <span className="text-xs text-muted-foreground font-normal self-end mb-1">CR</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Vincente</div>
                                    <div className={`text-sm font-semibold truncate max-w-[120px] ${isWinning ? 'text-green-600' : ''}`}>
                                        {a.winner ? a.winner.name : 'Nessuno'}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button
                                    className={`flex-1 h-12 text-base font-bold shadow-md ${isWinning ? 'bg-gray-400 hover:bg-gray-400 cursor-default' : 'bg-primary hover:bg-primary/90'}`}
                                    onClick={() => handleBid(a.id, a.current_price + 1)}
                                    disabled={loading || isWinning || processingBid === a.id}
                                >
                                    {processingBid === a.id ? <Loader2 className="w-5 h-5 animate-spin" /> : (isWinning ? 'Stai Vincendo' : `Offri ${a.current_price + 1}`)}
                                </Button>

                                {!isWinning && (
                                    <div className="flex gap-1 w-1/3">
                                        <Input
                                            type="number"
                                            placeholder="..."
                                            className="h-12 text-center font-mono text-lg px-1"
                                            value={bidAmount[a.id] || ''}
                                            onChange={(e) => setBidAmount({ ...bidAmount, [a.id]: parseInt(e.target.value) })}
                                        />
                                        <Button
                                            size="icon"
                                            className="h-12 w-12 shrink-0 aspect-square"
                                            variant="outline"
                                            onClick={() => handleBid(a.id, bidAmount[a.id] || 0)}
                                            disabled={loading || !bidAmount[a.id] || bidAmount[a.id] <= a.current_price || processingBid === a.id}
                                        >
                                            <ArrowUp className="w-5 h-5" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
