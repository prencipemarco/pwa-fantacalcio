'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { searchPlayers } from '@/app/actions/user';
import { createAuction } from '@/app/actions/market';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';

export function CreateAuctionScreen({ onBack, onAuctionCreated }: { onBack: () => void, onAuctionCreated: () => void }) {
    const { t } = useLanguage();
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
        // excludeTaken = true
        const data = await searchPlayers(query, { role, team }, true);
        setResults(data);
        setLoading(false);
    };

    const handleCreate = async (playerId: number, playerName: string, quotation: number) => {
        const startPrice = quotation || 1;
        if (!confirm(`Avviare asta per ${playerName}? Base d'asta: ${startPrice} CR.`)) return;
        setLoading(true);

        const res = await createAuction(playerId, startPrice);
        if (res.success) {
            onAuctionCreated();
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> {t('back')}
                </Button>
                <h2 className="text-xl font-bold">{t('newAuction')}</h2>
            </div>

            <p className="text-sm text-gray-500 mb-4">{t('searchPlayer')} to start bidding (Base = Quotation).</p>

            <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <Input
                        placeholder={t('searchPlayer')}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1"
                        autoFocus // Fix keyboard issue
                    />
                    <Button onClick={handleSearch} disabled={loading}>{t('search') || 'Search'}</Button>
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

            <div className="space-y-2 border-t pt-4">
                {results.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 border rounded bg-white shadow-sm">
                        <div>
                            <div className="font-bold flex items-center gap-2">
                                {p.name}
                                <Badge variant="secondary" className={`text-[10px] h-5 px-1.5
                                    ${p.role === 'P' ? 'bg-orange-100 text-orange-700' :
                                        p.role === 'D' ? 'bg-green-100 text-green-700' :
                                            p.role === 'C' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                    {p.role}
                                </Badge>
                            </div>
                            <div className="text-xs text-gray-500">{p.team_real} - Qt. {p.quotation}</div>
                        </div>
                        <Button size="sm" onClick={() => handleCreate(p.id, p.name, p.quotation)}>
                            Start ({p.quotation})
                        </Button>
                    </div>
                ))}
                {results.length === 0 && !loading && <div className="text-center text-gray-400 text-sm mt-8">{t('noResults') || 'No players found.'}</div>}
            </div>
        </div>
    );
}
