'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@/utils/supabase/client';
import { Mic, Send } from 'lucide-react';
import { TeamLogo } from '@/components/team-logo';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface PressStatement {
    id: string;
    content: string;
    created_at: string;
    teams: {
        name: string;
        logo_url: string;
        logo_config: any;
    };
}

export function HomePressRoom({ userTeamId }: { userTeamId?: string }) {
    const [statements, setStatements] = useState<PressStatement[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchStatements();

        const channel = supabase
            .channel('public:press_statements')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'press_statements' },
                (payload) => {
                    fetchStatements(); // Refresh logic or append manually
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchStatements = async () => {
        const { data, error } = await supabase
            .from('press_statements')
            .select(`
                id,
                content,
                created_at,
                teams (name, logo_url, logo_config)
            `)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) setStatements(data as any);
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !userTeamId) return;
        setLoading(true);

        const { error } = await supabase.from('press_statements').insert({
            team_id: userTeamId,
            content: newMessage.trim(),
        });

        if (!error) {
            setNewMessage('');
            fetchStatements();
        } else {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <Card className="border-red-500/20 shadow-sm overflow-hidden">
            <div className="bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 p-3 flex items-center gap-2">
                <div className="bg-red-100 dark:bg-red-900/40 p-1.5 rounded-full">
                    <Mic className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-bold text-sm text-red-900 dark:text-red-200">Sala Stampa</h3>
                <div className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>

            <div className="p-0">
                <ScrollArea className="h-[250px] p-4">
                    <div className="space-y-4">
                        {statements.length === 0 && (
                            <p className="text-center text-xs text-muted-foreground italic py-8">
                                Nessuna dichiarazione recente.
                            </p>
                        )}
                        {statements.map((stmt) => (
                            <div key={stmt.id} className="flex gap-3 items-start group">
                                <div className="shrink-0 mt-0.5">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-muted">
                                        <TeamLogo
                                            teamName={stmt.teams.name}
                                            logoUrl={stmt.teams.logo_url}
                                            logoConfig={stmt.teams.logo_config}
                                            size={32}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between mb-0.5">
                                        <span className="text-xs font-bold truncate mr-2">{stmt.teams.name}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {format(new Date(stmt.created_at), 'HH:mm', { locale: it })}
                                        </span>
                                    </div>
                                    <div className="bg-secondary/30 rounded-r-lg rounded-bl-lg p-2.5 text-sm leading-relaxed">
                                        {stmt.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {userTeamId && (
                    <div className="p-3 border-t bg-background flex gap-2">
                        <Input
                            placeholder="Rilascia una dichiarazione..."
                            className="h-9 text-sm"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSend} disabled={loading || !newMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
