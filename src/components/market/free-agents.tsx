'use client';

import { useState, useEffect } from 'react';
import { searchPlayers } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, Loader2 } from 'lucide-react';

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
        } else {
            setError(res.error || 'Errore durante creazione asta.');
        }
        setBuyingId(null);
    };

    return (
        <div className="space-y-4">

            {/* Search Bar */}
            <div className="flex gap-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cerca giocatore (es. Lautaro)..."
                    className="pl-9 h-12 bg-card text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                />
                <Button onClick={() => handleSearch(query)} disabled={loading} size="lg" className="w-24">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('search')}
                </Button>
            </div>

            {error && <Alert variant="destructive"><AlertTitle>Errore</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert className="bg-green-50 border-green-500"><AlertTitle>Successo</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {results.map((player) => (
                    <Card key={player.id} className="hover:border-primary/50 transition-colors shadow-sm">
                        <CardContent className="p-2.5 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                {/* Role Badge */}
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0
                                    ${player.role === 'P' ? 'bg-orange-500' :
                                        player.role === 'D' ? 'bg-green-600' :
                                            player.role === 'C' ? 'bg-blue-600' : 'bg-red-600'
                                    }`}>
                                    {player.role}
                                </div>

                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-[15px] leading-tight truncate pr-1">{player.name}</span>
                                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider truncate">
                                        {player.team_real} • Qt. {player.quotation}
                                    </span>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                onClick={() => handleStartAuction(player)}
                                disabled={buyingId === player.id}
                                className="rounded-full w-9 h-9 p-0 shadow-sm shrink-0"
                            >
                                {buyingId === player.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {results.length === 0 && !loading && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Nessun giocatore trovato.</p>
                </div>
            )}

            {loading && results.length === 0 && (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}
        </div>
    );
}
