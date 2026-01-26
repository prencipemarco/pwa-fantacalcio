'use client';

import { useState, useEffect } from 'react';
import { getMyRoster } from '@/app/actions/user';
import { releasePlayer } from '@/app/actions/market';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function ReleasePlayersList({ onBack, teamId, refreshCredits }: { onBack: () => void, teamId: string, refreshCredits: () => void }) {
    const { t } = useLanguage();
    const [roster, setRoster] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [releasingId, setReleasingId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const loadRoster = async () => {
        setLoading(true);
        const data = await getMyRoster(teamId);
        setRoster(data || []);
        setLoading(false);
    };

    useEffect(() => {
        loadRoster();
    }, [teamId]);

    const handleRelease = async (player: any) => {
        const refund = Math.ceil((player.purchase_price || 0) / 2);
        if (!confirm(`${t('confirmRelease')} ${refund} CR`)) return;

        setReleasingId(player.player_id);
        setMessage(null);

        const res = await releasePlayer(teamId, player.player_id);
        if (res.success) {
            setMessage({ type: 'success', text: `${t('released')} (+${refund} CR)` });
            refreshCredits();
            loadRoster(); // Reload roster to remove player
        } else {
            setMessage({ type: 'error', text: res.error || 'Error' });
        }
        setReleasingId(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold">{t('releasePlayer')}</h2>
            </div>

            {message && (
                <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className={message.type === 'success' ? 'bg-green-50 border-green-500' : ''}>
                    <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    <AlertDescription>{message.text}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                {roster.sort((a, b) => (b.purchase_price || 0) - (a.purchase_price || 0)).map((entry) => (
                    <Card key={entry.player_id}>
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{entry.player.name}</span>
                                    <Badge className={`w-5 h-5 p-0 flex items-center justify-center text-[10px] 
                                        ${entry.player.role === 'P' ? 'bg-amber-400' :
                                            entry.player.role === 'D' ? 'bg-emerald-400' :
                                                entry.player.role === 'C' ? 'bg-blue-400' : 'bg-red-500'}`}>
                                        {entry.player.role}
                                    </Badge>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Bought: <span className="font-mono">{entry.purchase_price}</span> CR
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRelease(entry)}
                                disabled={releasingId === entry.player_id}
                                className="flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" />
                                <span className="text-xs">
                                    +{Math.ceil((entry.purchase_price || 0) / 2)}
                                </span>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {roster.length === 0 && !loading && (
                    <p className="text-center text-gray-500 py-8">No players in roster.</p>
                )}
            </div>
        </div>
    );
}
