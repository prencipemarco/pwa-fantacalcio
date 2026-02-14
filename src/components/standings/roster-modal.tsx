'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getTeamRoster } from '@/app/actions/user';
import { TeamLogo } from '@/components/team-logo';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { getRoleColor } from '@/lib/lineup-utils';

interface RosterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teamId: string | null;
    teamName: string;
}

export function RosterModal({ open, onOpenChange, teamId, teamName }: RosterModalProps) {
    const [roster, setRoster] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && teamId) {
            const loadRoster = async () => {
                setLoading(true);
                try {
                    const data = await getTeamRoster(teamId);
                    setRoster(data || []);
                } catch (error) {
                    console.error("Failed to load roster", error);
                } finally {
                    setLoading(false);
                }
            };
            loadRoster();
        }
    }, [open, teamId]);

    // Group by Role
    const groupedRoster = {
        P: roster.filter(r => r.player.role === 'P'),
        D: roster.filter(r => r.player.role === 'D'),
        C: roster.filter(r => r.player.role === 'C'),
        A: roster.filter(r => r.player.role === 'A'),
    };

    const roles = ['P', 'D', 'C', 'A'];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 border-b bg-muted/20">
                    <DialogTitle className="flex items-center gap-2">
                        <span>Rosa: <span className="text-primary">{teamName}</span></span>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 p-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {roles.map(role => (
                                <div key={role} className="space-y-2">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 border-l-2 border-primary/50">
                                        {role === 'P' ? 'Portieri' : role === 'D' ? 'Difensori' : role === 'C' ? 'Centrocampisti' : 'Attaccanti'}
                                        <span className="ml-2 bg-muted px-1.5 py-0.5 rounded text-[10px]">{groupedRoster[role as keyof typeof groupedRoster]?.length || 0}</span>
                                    </h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {groupedRoster[role as keyof typeof groupedRoster]?.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/50 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0 ${getRoleColor(item.player.role)}`}>
                                                        {item.player.role}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm">{item.player.name}</div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span className="font-mono flex items-center gap-1">
                                                                <TeamLogo teamName={item.player.team_real} size={12} />
                                                                {item.player.team_real.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
                                                        Qt. {item.player.quotation}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {groupedRoster[role as keyof typeof groupedRoster]?.length === 0 && (
                                            <div className="text-center py-2 text-xs text-muted-foreground italic">Nessun giocatore</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
