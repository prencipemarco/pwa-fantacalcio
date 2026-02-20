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
import { PlayerDetailsModal } from '@/components/market/player-details-modal';

export function FreeAgentsList({ onBack, teamId, refreshCredits }: { onBack: () => void, teamId: string, refreshCredits: () => void }) {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [roster, setRoster] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [buyingId, setBuyingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

    // Initial load
    useEffect(() => {
        handleSearch('');
        // Load roster for limits check
        import('@/app/actions/user').then(mod => {
            mod.getMyRoster(teamId).then(data => setRoster(data || []));
        });
    }, [teamId]);

    const handleSearch = async (q: string) => {
        setLoading(true);
        try {
            // Exclude taken players = true
            let res = await searchPlayers(q, undefined, true);

            // Custom Sort: Role (P, D, C, A) then Name
            const roleOrder: Record<string, number> = { 'P': 1, 'D': 2, 'C': 3, 'A': 4 };
            res = res.sort((a, b) => {
                const roleDiff = (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
                if (roleDiff !== 0) return roleDiff;
                return a.name.localeCompare(b.name);
            });

            setResults(res);
        } catch (err) {
            console.error("Search failed:", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStartAuction = async (player: any) => {
        setError(null);
        setSuccess(null);

        // Check Limits
        const LIMITS: Record<string, number> = { 'P': 3, 'D': 8, 'C': 8, 'A': 6 };
        const role = player.role;
        const currentCount = roster.filter((r: any) => r.player.role === role).length;

        if (currentCount >= LIMITS[role]) {
            setError(`Hai già raggiunto il limite per il ruolo ${role} (${currentCount}/${LIMITS[role]}). Taglia un giocatore prima.`);
            return;
        }

        setBuyingId(player.id);
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

            {/* Search Bar & Filters */}
            <div className="flex flex-col gap-3">
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

                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/5 hover:text-primary gap-1.5 h-8 px-3"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <span className="text-sm font-medium">Filtri Avanzati</span>
                        {showFilters ? <span className="rotate-180 transition-transform">▲</span> : <span className="transition-transform">▼</span>}
                    </Button>
                </div>

                {showFilters && (
                    <div className="bg-muted/40 p-4 rounded-xl border border-border/50 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="text-sm text-muted-foreground text-center italic">
                            Filtri aggiuntivi in arrivo... (Ruolo, Squadra, Quotazione)
                        </div>
                    </div>
                )}
            </div>

            {error && <Alert variant="destructive"><AlertTitle>Errore</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert className="bg-green-50 border-green-500"><AlertTitle>Successo</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {results.map((player) => (
                    <Card key={player.id} className="hover:border-primary/50 transition-colors shadow-sm cursor-pointer" onClick={() => setSelectedPlayer(player)}>
                        <CardContent className="p-2 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {/* Role Badge */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0
                                    ${player.role === 'P' ? 'bg-orange-500' :
                                        player.role === 'D' ? 'bg-green-600' :
                                            player.role === 'C' ? 'bg-blue-600' : 'bg-red-600'
                                    }`}>
                                    {player.role}
                                </div>

                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-sm leading-tight truncate pr-1">{player.name}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider truncate">
                                        {player.team_real} • Qt. {player.quotation}
                                    </span>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleStartAuction(player); }}
                                disabled={buyingId === player.id}
                                className="rounded-full w-8 h-8 p-0 shadow-sm shrink-0"
                            >
                                {buyingId === player.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
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

            <PlayerDetailsModal
                player={selectedPlayer}
                isOpen={!!selectedPlayer}
                onClose={() => setSelectedPlayer(null)}
            />
        </div>
    );
}
