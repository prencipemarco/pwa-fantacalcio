'use client';

import { useState, useEffect } from 'react';
import { searchPlayers, buyPlayer } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';

export function FreeAgentsList({ onBack, teamId, refreshCredits }: { onBack: () => void, teamId: string, refreshCredits: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [buyingId, setBuyingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Initial load
    useEffect(() => {
        handleSearch('');
    }, []);

    const handleSearch = async (q: string) => {
        setLoading(true);
        // We might want to filter only unowned players here, but searchPlayers returns all. 
        // The buy action checks ownership.
        const res = await searchPlayers(q);
        setResults(res);
        setLoading(false);
    };

    const handleBuy = async (player: any) => {
        setBuyingId(player.id);
        setError(null);
        setSuccess(null);
        const price = player.quotation || 1;

        // DIRECT BUY? Or should "Free Agent" view still imply auction? 
        // Design Decision: Maintain "Direct Buy" for Free Agents if that's what the User implies by "Listone svincolati",
        // OR disable direct buy and force creating auction.
        // User said: "se non ci sono aste in corso il pulsante è offuscato...".
        // The requirement is mostly about AUCTIONS.
        // But traditionally "Svincolati" might be direct pick.
        // Let's assume this view is just for REFERENCE or Direct Buy if allowed.
        // I will keep Direct Buy for simplicity as a fallback, BUT warn user.
        // Actually, user said "creare una nuova asta... oppure visualizzare il listone svincolati".
        // This likely means detailed list. I'll keep the Buy button but maybe it should START AUCTION?
        // Let's keep it as Direct Buy for "Quotazione" as a quick mode, or maybe change to "Start Auction".
        // Let's stick to Direct Buy here designated as "Instant Buy" (maybe separate setting?). 
        // For compliance with "Auction System", maybe this list should just Start Auction too?
        // Let's keep it Direct Buy for now (classic mode) to avoid breaking existing flow completely, but maybe label it.

        // Actually, better to just START AUCTION from here too? 
        // User asked for "Creare nuova asta" explicitly.
        // Let's make the "Buy" button here actually "Start Auction" to enforce the rule?
        // "per acquistare un giocatore ... creare una nuova asta".
        // So purchasing is done VIA auction.
        // I will change the action to start auction.

        // Wait, "visualizzare il listone svincolati" might just be viewing.
        // I'll enable "Start Auction" from this list.

        /* 
        const res = await buyPlayer(teamId, player.id, price); 
        */
        const { createAuction } = await import('@/app/actions/market'); // Dynamic import to avoid cycles?
        const res = await createAuction(player.id, price);

        if (res.success) {
            setSuccess(`Auction started for ${player.name}!`);
            refreshCredits();
            onBack(); // Go back to home/active auctions
        } else {
            setError(res.error || 'Failed.');
        }
        setBuyingId(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
                <h2 className="text-xl font-bold">Free Agents (Listone)</h2>
            </div>

            <div className="flex gap-2">
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." />
                <Button onClick={() => handleSearch(query)} disabled={loading}>Search</Button>
            </div>

            {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert className="bg-green-50 border-green-500"><AlertTitle>Success</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}

            <div className="space-y-2">
                {results.map((player) => (
                    <Card key={player.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{player.name}</span>
                                    <Badge className={`w-5 h-5 p-0 flex items-center justify-center text-[10px] ${player.role === 'P' ? 'bg-amber-400' :
                                            player.role === 'D' ? 'bg-emerald-400' :
                                                player.role === 'C' ? 'bg-blue-400' : 'bg-red-500'
                                        }`}>{player.role}</Badge>
                                </div>
                                <p className="text-sm text-gray-500">{player.team_real} - Qt. {player.quotation}</p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => handleBuy(player)}
                                disabled={buyingId === player.id}
                                variant="secondary"
                            >
                                Start Auction ({player.quotation || 1})
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
