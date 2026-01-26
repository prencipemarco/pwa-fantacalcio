'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { searchPlayers } from '@/app/actions/user';
import { createAuction } from '@/app/actions/market';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export function CreateAuctionModal({ onAuctionCreated }: { onAuctionCreated: () => void }) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [role, setRole] = useState('ALL');
    const [team, setTeam] = useState('ALL');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter Options
    const roles = ['ALL', 'P', 'D', 'C', 'A'];
    const teams = ['ALL', 'Atalanta', 'Bologna', 'Cagliari', 'Como', 'Empoli', 'Fiorentina', 'Genoa', 'Inter', 'Juventus', 'Lazio', 'Lecce', 'Milan', 'Monza', 'Napoli', 'Parma', 'Roma', 'Torino', 'Udinese', 'Venezia', 'Verona'];

    const handleSearch = async () => {
        setLoading(true);
        const data = await searchPlayers(query, { role, team });
        setResults(data);
        setLoading(false);
    };

    const handleCreate = async (playerId: number, playerName: string) => {
        if (!confirm(`Avviare asta per ${playerName}? Base d'asta: 1 CR.`)) return;
        setLoading(true);
        // FORCE START PRICE TO 1
        const res = await createAuction(playerId, 1);
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
                <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">{t('startAuction')}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md h-[80vh] flex flex-col stop-swipe-nav">
                <DialogHeader>
                    <DialogTitle>{t('newAuction')}</DialogTitle>
                    <DialogDescription>Cerca giocatore per avviare l'asta (Base 1 CR).</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder={t('searchPlayer')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1"
                        />
                        <Button onClick={handleSearch} disabled={loading}>Search</Button>
                    </div>

                    <div className="flex gap-2">
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={team} onValueChange={setTeam}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Team" />
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 border rounded-md p-2">
                    {results.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-2 border rounded hover:bg-slate-50">
                            <div>
                                <div className="font-bold flex items-center gap-1">
                                    {p.name}
                                    <Badge variant="secondary" className={`text-[10px] h-4 leading-none px-1
                                        ${p.role === 'P' ? 'bg-orange-100 text-orange-700' :
                                            p.role === 'D' ? 'bg-green-100 text-green-700' :
                                                p.role === 'C' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.role}
                                    </Badge>
                                </div>
                                <div className="text-xs text-gray-500">{p.team_real} - Qt. {p.quotation}</div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleCreate(p.id, p.name)}>
                                Start (1)
                            </Button>
                        </div>
                    ))}
                    {results.length === 0 && !loading && <div className="text-center text-gray-400 text-sm mt-8">Cerca un giocatore...</div>}
                </div>
            </DialogContent>
        </Dialog>
    );
}
