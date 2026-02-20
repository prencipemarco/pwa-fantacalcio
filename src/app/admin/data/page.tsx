'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Database, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
    getMatchdayDataStatus,
    deleteMatchdayLineups,
    deleteMatchdayVotes
} from '@/app/actions/admin';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminDataManagement() {
    const { t } = useLanguage();
    const [matchday, setMatchday] = useState<string>('1');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [stats, setStats] = useState<{ lineups: number, votes: number } | null>(null);

    const matchdays = Array.from({ length: 38 }, (_, i) => i + 1);

    const loadStats = async (selectedMatchday: string) => {
        setIsLoading(true);
        setStats(null);
        try {
            const res = await getMatchdayDataStatus(parseInt(selectedMatchday));
            if (res.success) {
                setStats({ lineups: res.lineupsCount || 0, votes: res.votesCount || 0 });
            } else {
                toast.error("Errore nel recupero dati");
            }
        } catch (e: any) {
            toast.error(e.message || "Errore sconosciuto");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStats(matchday);
    }, [matchday]);

    const handleDeleteLineups = async () => {
        if (!confirm(`Sei sicuro di voler eliminare TUTTE le formazioni della giornata ${matchday}? Questa azione è irreversibile.`)) {
            return;
        }
        setIsDeleting(true);
        try {
            const res = await deleteMatchdayLineups(parseInt(matchday));
            if (res.success) {
                toast.success(`Eliminate ${res.count} formazioni.`);
                await loadStats(matchday);
            } else {
                toast.error(res.error || "Errore durante l'eliminazione.");
            }
        } catch (e: any) {
            toast.error(e.message || "Errore generico.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteVotes = async () => {
        if (!confirm(`Sei sicuro di voler eliminare TUTTI i voti e statiche partita della giornata ${matchday}? Questa azione è irreversibile.`)) {
            return;
        }
        setIsDeleting(true);
        try {
            const res = await deleteMatchdayVotes(parseInt(matchday));
            if (res.success) {
                toast.success(`Voti eliminati per la giornata ${matchday}.`);
                await loadStats(matchday);
            } else {
                toast.error(res.error || "Errore durante l'eliminazione.");
            }
        } catch (e: any) {
            toast.error(e.message || "Errore generico.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-[800px]">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b">
                <Button variant="outline" asChild>
                    <Link href="/admin">Torna alla Dashboard</Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Database className="w-8 h-8 text-blue-600" />
                        Gestione Dati Massiva
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Visualizza la mole di dati inserita nel database ed eliminala massivamente per giornata.
                    </p>
                </div>
            </div>

            <div className="mb-8 p-6 bg-card border rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-3">Seleziona Giornata</h3>
                <div className="flex items-center gap-4">
                    <Select value={matchday} onValueChange={setMatchday} disabled={isLoading || isDeleting}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Scegli giornata" />
                        </SelectTrigger>
                        <SelectContent>
                            {matchdays.map(m => (
                                <SelectItem key={m} value={m.toString()}>Giornata {m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="secondary"
                        onClick={() => loadStats(matchday)}
                        disabled={isLoading || isDeleting}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Aggiorna status
                    </Button>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lineups Card */}
                    <Card className="border-red-100 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                        <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10">
                            <CardTitle className="text-xl">Formazioni Inserite</CardTitle>
                            <CardDescription>
                                Gestione della tabella lineups e lineup_players per la G{matchday}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="text-4xl font-black text-center mb-2">
                                {stats.lineups}
                            </div>
                            <div className="text-center text-sm text-muted-foreground mb-4">
                                Squadre hanno salvato formazioni
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 pt-4 flex-col gap-2">
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleDeleteLineups}
                                disabled={isDeleting || stats.lineups === 0}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Elimina Tutte le Formazioni (G{matchday})
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Votes Card */}
                    <Card className="border-red-100 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                        <CardHeader className="bg-purple-50/50 dark:bg-purple-900/10">
                            <CardTitle className="text-xl">Voti Importati</CardTitle>
                            <CardDescription>
                                Gestione della tabella match_stats per la G{matchday}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="text-4xl font-black text-center mb-2">
                                {stats.votes}
                            </div>
                            <div className="text-center text-sm text-muted-foreground mb-4">
                                Statistiche giocatori lette da CSV
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 pt-4 flex-col gap-2">
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleDeleteVotes}
                                disabled={isDeleting || stats.votes === 0}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Elimina Tutti i Voti (G{matchday})
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
