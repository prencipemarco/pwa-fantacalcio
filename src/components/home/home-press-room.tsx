'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { Mic, Send } from 'lucide-react';
import { TeamLogo } from '@/components/team-logo';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [currentIdx, setCurrentIdx] = useState(0);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    // Fetch messages (Active < 6h)
    const fetchStatements = async () => {
        // Calculate 6 hours ago
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from('press_statements')
            .select(`
                id,
                content,
                created_at,
                teams (name, logo_url, logo_config)
            `)
            .gt('created_at', sixHoursAgo)
            .order('created_at', { ascending: false });

        if (data) {
            setStatements(data as any);
            // If current index is out of bounds, reset
            if (currentIdx >= data.length) setCurrentIdx(0);
        }
    };

    useEffect(() => {
        fetchStatements();

        // Poll every 30 seconds
        const pollInterval = setInterval(fetchStatements, 30000);

        // Realtime subscription for immediate feedback on new inserts
        const channel = supabase
            .channel('public:press_statements')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'press_statements' },
                () => fetchStatements()
            )
            .subscribe();

        return () => {
            clearInterval(pollInterval);
            supabase.removeChannel(channel);
        };
    }, []);

    // Carousel Auto-Rotation
    useEffect(() => {
        if (statements.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % statements.length);
        }, 5000); // Rotate every 5 seconds

        return () => clearInterval(interval);
    }, [statements.length]);


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

    // Current displayed statement
    const currentStatement = statements[currentIdx];

    return (
        <Card className="border-red-500/20 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 p-2 px-3 flex items-center justify-between gap-2 h-10">
                <div className="flex items-center gap-2">
                    <div className="bg-red-100 dark:bg-red-900/40 p-1 rounded-full">
                        <Mic className="h-3 w-3 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="font-bold text-xs text-red-900 dark:text-red-200 uppercase tracking-widest">Sala Stampa</h3>
                </div>
                {statements.length > 0 && (
                    <div className="flex gap-1">
                        {statements.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 w-1 rounded-full transition-colors ${idx === currentIdx ? 'bg-red-500' : 'bg-red-200 dark:bg-red-900'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="relative min-h-[60px] flex items-center bg-card">
                <AnimatePresence mode="wait">
                    {statements.length > 0 && currentStatement ? (
                        <motion.div
                            key={currentStatement.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 p-3 flex items-center gap-3 w-full"
                        >
                            <div className="shrink-0">
                                <TeamLogo
                                    teamName={currentStatement.teams.name}
                                    logoUrl={currentStatement.teams.logo_url}
                                    logoConfig={currentStatement.teams.logo_config}
                                    size={36}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                    <span className="font-bold text-foreground mr-1">{currentStatement.teams.name}:</span>
                                    <span className="text-muted-foreground italic">"{currentStatement.content}"</span>
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="w-full text-center py-4 text-xs text-muted-foreground italic">
                            Nessuna dichiarazione nelle ultime 6 ore.
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {userTeamId && (
                <div className="p-2 border-t bg-muted/20 flex gap-2">
                    <Input
                        placeholder="Lascia una dichiarazione..."
                        className="h-8 text-xs bg-background"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSend} disabled={loading || !newMessage.trim()}>
                        <Send className="h-3 w-3" />
                    </Button>
                </div>
            )}
        </Card>
    );
}
