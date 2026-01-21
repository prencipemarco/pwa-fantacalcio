'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { searchPlayers } from '@/app/actions/user';
import { createAuction } from '@/app/actions/market';
import { Badge } from '@/components/ui/badge';

export function CreateAuctionModal({ onAuctionCreated }: { onAuctionCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        const data = await searchPlayers(query);
        setResults(data);
        setLoading(false);
    };

    const handleCreate = async (playerId: number, quotation: number) => {
        if (!confirm('Start auction for this player? Base price is ' + (quotation || 1))) return;
        setLoading(true);
        const res = await createAuction(playerId, quotation || 1);
        if (res.success) {
            setOpen(false);
            onAuctionCreated();
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">Start Auction</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Start New Auction</DialogTitle>
                    <DialogDescription>Search for a player. Auction will last 24h.</DialogDescription>
                </DialogHeader>

                <div className="flex gap-2 mb-4">
                    <Input placeholder="Player name..." value={query} onChange={(e) => setQuery(e.target.value)} />
                    <Button onClick={handleSearch} disabled={loading}>Search</Button>
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {results.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-2 border rounded hover:bg-slate-50">
                            <div>
                                <div className="font-bold flex items-center gap-1">
                                    {p.name}
                                    <Badge variant="secondary" className="text-[10px] h-4 leading-none px-1">{p.role}</Badge>
                                </div>
                                <div className="text-xs text-gray-500">{p.team_real}</div>
                            </div>
                            <Button size="sm" onClick={() => handleCreate(p.id, p.quotation)}>
                                Start ({p.quotation || 1})
                            </Button>
                        </div>
                    ))}
                    {results.length === 0 && query && !loading && <p className="text-center text-gray-400 text-sm">No results.</p>}
                </div>
            </DialogContent>
        </Dialog>
    );
}
