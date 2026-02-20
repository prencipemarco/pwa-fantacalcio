import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPlayerStats, PlayerStatsAggregated } from '@/app/actions/stats';
import { Loader2 } from 'lucide-react';

export function PlayerDetailsModal({ player, isOpen, onClose }: { player: any, isOpen: boolean, onClose: () => void }) {
    const { t } = useLanguage();
    const [stats, setStats] = useState<PlayerStatsAggregated | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && player) {
            setLoading(true);
            getPlayerStats(player.id).then((data) => {
                setStats(data);
                setLoading(false);
            });
        }
    }, [isOpen, player]);

    if (!player) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0
                            ${player.role === 'P' ? 'bg-orange-500' :
                                player.role === 'D' ? 'bg-green-600' :
                                    player.role === 'C' ? 'bg-blue-600' : 'bg-red-600'
                            }`}>
                            {player.role}
                        </div>
                        {player.name}
                    </DialogTitle>
                    <DialogDescription>
                        {player.team_real} • Quotazione: {player.quotation}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-5">
                    {loading ? (
                        <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    ) : stats ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/40 p-3 rounded-xl border flex flex-col items-center justify-center">
                                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Media Voto</span>
                                    <span className="text-2xl font-black">{stats.averageVote.toFixed(2)}</span>
                                </div>
                                <div className="bg-primary/10 border-primary/20 p-3 rounded-xl border flex flex-col items-center justify-center">
                                    <span className="text-xs text-primary/80 font-bold uppercase tracking-wider mb-1">Fantavoto</span>
                                    <span className="text-2xl font-black text-primary">{stats.averageFantaVote.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2 border-t border-border/50">
                                <h4 className="text-sm font-bold text-foreground">Statistiche (Su {stats.gamesPlayed} partite)</h4>

                                <StatBar label={player.role === 'P' ? "Gol Subiti" : "Gol Fatti"} value={player.role === 'P' ? stats.goalsAgainst! : stats.totalGoals} max={20} color={player.role === 'P' ? "bg-red-500" : "bg-green-500"} />
                                {player.role !== 'P' && <StatBar label="Assist" value={stats.totalAssists} max={15} color="bg-blue-500" />}
                                <StatBar label="Ammonizioni" value={stats.totalYellowCards} max={10} color="bg-yellow-500" />
                                <StatBar label="Espulsioni" value={stats.totalRedCards} max={3} color="bg-red-600" />
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic text-center">
                            Nessun voto disponibile.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StatBar({ label, value, max, color }: { label: string, value: number, max: number, color: string }) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground">{value}</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
