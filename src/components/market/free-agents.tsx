'use client';

import { useState, useEffect } from 'react';
import { searchPlayers, buyPlayer } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';

export function FreeAgentsList({ onBack, teamId, refreshCredits }: { onBack: () => void, teamId: string, refreshCredits: () => void }) {
    const { t } = useLanguage();
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
        // Exclude taken players = true
        const res = await searchPlayers(q, undefined, true);
        setResults(res);
        setLoading(false);
    };

    const handleStartAuction = async (player: any) => {
        setBuyingId(player.id);
        setError(null);
        setSuccess(null);
        const price = player.quotation || 1;

        if (!confirm(`Avviare asta per ${player.name} a ${price} crediti?`)) {
            setBuyingId(null);
            return;
        }

        const { createAuction } = await import('@/app/actions/market');
        const res = await createAuction(player.id, price);

        if (res.success) {
            setSuccess(`Asta avviata per ${player.name}!`);
            refreshCredits();
            // Optional: wait a bit then go back?
            setTimeout(() => onBack(), 1000);
        } else {
            setError(res.error || 'Errore durante creazione asta.');
        }
        setBuyingId(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t('freeAgents') || 'Svincolati'}</h2>
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> {t('back')}
                </Button>
            </div>

            <div className="flex gap-2">
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchPlayer')} />
                <Button onClick={() => handleSearch(query)} disabled={loading}>{t('search')}</Button>
            </div>

            {error && <Alert variant="destructive"><AlertTitle>Errore</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert className="bg-green-50 border-green-500"><AlertTitle>Successo</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}

            <div className="space-y-2">
                {results.map((player) => (
                    <Card key={player.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{player.name}</span>
                                    <Badge className={`w-5 h-5 p-0 flex items-center justify-center text-[10px] ${player.role === 'P' ? 'bg-orange-100 text-orange-700' :
                                        player.role === 'D' ? 'bg-green-100 text-green-700' :
                                            player.role === 'C' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                        }`}>{player.role}</Badge>
                                </div>
                                <p className="text-sm text-gray-500">{player.team_real} - Qt. {player.quotation}</p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => handleStartAuction(player)}
                                disabled={buyingId === player.id}
                                variant="secondary"
                            >
                                Asta ({player.quotation})
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {results.length === 0 && !loading && <p className="text-center text-gray-400 py-8">Nessun giocatore trovato.</p>}
            </div>
        </div>
    );
}
