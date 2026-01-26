'use client';

import { useState, useEffect } from 'react';
import { getMyTeam, getMyRoster } from '@/app/actions/user';
import { saveLineup } from '@/app/actions/team';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { TeamLogo } from '@/components/team-logo';
import { PageTransition, StaggerList, StaggerItem, TapScale } from '@/components/ui/motion-primitives';
import { cn } from '@/lib/utils';

// --- Constants & Helpers ---

const MODULES = ['3-4-3', '3-5-2', '4-4-2', '4-5-1', '5-3-2', '5-4-1'];

const getFormationCoords = (module: string) => {
    const [def, mid, fwd] = module.split('-').map(Number);
    const coords: { role: string; x: number; y: number }[] = [];
    // GK
    coords.push({ role: 'P', x: 50, y: 90 });
    // Defenders
    for (let i = 0; i < def; i++) coords.push({ role: 'D', x: (100 / (def + 1)) * (i + 1), y: 70 });
    // Midfielders
    for (let i = 0; i < mid; i++) coords.push({ role: 'C', x: (100 / (mid + 1)) * (i + 1), y: 45 });
    // Forwards
    for (let i = 0; i < fwd; i++) coords.push({ role: 'A', x: (100 / (fwd + 1)) * (i + 1), y: 15 });
    return coords;
};

// Bench structure: 2 P, 3 D, 3 C, 3 A = 11 slots
const BENCH_STRUCTURE = [
    { role: 'P', label: 'GK' }, { role: 'P', label: 'GK' },
    { role: 'D', label: 'DEF' }, { role: 'D', label: 'DEF' }, { role: 'D', label: 'DEF' },
    { role: 'C', label: 'MID' }, { role: 'C', label: 'MID' }, { role: 'C', label: 'MID' },
    { role: 'A', label: 'FWD' }, { role: 'A', label: 'FWD' }, { role: 'A', label: 'FWD' }
];

const getRoleColor = (role: string) => {
    switch (role) {
        case 'P': return 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-800';
        case 'D': return 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-800';
        case 'C': return 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-800';
        case 'A': return 'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-900/30 dark:text-rose-100 dark:border-rose-800';
        default: return 'bg-muted text-muted-foreground';
    }
};

// --- DnD Components ---

function DraggablePlayer({ player, isSelected }: { player: any, isSelected: boolean }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `roster-${player.id}`,
        data: { player, type: 'roster' }
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "relative flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing touch-none select-none",
                isSelected
                    ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(var(--primary),1)]"
                    : "bg-card hover:bg-accent/50 hover:border-accent-foreground/30 border-border",
                isDragging && "opacity-40 grayscale scale-95",
            )}
        >
            <div className="flex items-center gap-2 overflow-hidden">
                <Badge variant="outline" className={cn("text-[10px] w-5 h-5 flex items-center justify-center p-0 shrink-0", getRoleColor(player.player.role))}>
                    {player.player.role}
                </Badge>
                <span className="truncate font-medium text-xs sm:text-sm">{player.player.name}</span>
            </div>
            <TeamLogo teamName={player.player.team_real} size={18} />
        </div>
    );
}

function DroppableSlot({ id, role, currentItem, onRemove, onClick }: { id: string, role: string, currentItem: any | null, onRemove: () => void, onClick?: () => void }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { role, type: id.startsWith('bench') ? 'bench' : 'field' }
    });

    return (
        <div ref={setNodeRef} className="relative cursor-pointer group" onClick={onClick}>
            <div
                className={cn(
                    "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 transition-all shadow-sm backdrop-blur-md",
                    currentItem
                        ? "bg-white/95 border-white text-slate-900 shadow-md"
                        : isOver
                            ? "bg-primary/80 border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]" // Highlight drop zone
                            : "bg-black/30 border-white/20 text-white/50 hover:bg-black/50 hover:border-white/40"
                )}
            >
                {currentItem ? (
                    <div className="flex flex-col items-center w-full">
                        <span className="font-bold text-[10px] md:text-xs overflow-hidden truncate px-1 max-w-full leading-tight text-center">
                            {currentItem.player.name.split(' ').pop()?.substring(0, 9)}
                        </span>
                        <div
                            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer hover:scale-110 shadow-sm transition-transform"
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        >
                            ×
                        </div>
                    </div>
                ) : (
                    <span className="text-sm font-bold opacity-50">{role}</span>
                )}
            </div>
            {currentItem && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white shadow-sm text-slate-900 text-[9px] px-1.5 py-0.5 rounded-sm font-bold border border-slate-200 flex items-center gap-1 whitespace-nowrap z-10">
                    <TeamLogo teamName={currentItem.player.team_real} size={10} />
                    {currentItem.player.role}
                </div>
            )}
        </div>
    );
}

function DroppableBenchSlot({ index, role, currentItem, onRemove, onClick }: { index: number, role: string, currentItem: any | null, onRemove: () => void, onClick?: () => void }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `bench-${index}`,
        data: { role, type: 'bench', index }
    });

    return (
        <div ref={setNodeRef} className="flex flex-col items-center gap-1">
            <Button
                variant="ghost"
                className={cn(
                    "w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center p-0 border-2 border-dashed transition-all relative",
                    currentItem
                        ? "border-solid border-border bg-card shadow-sm text-foreground hover:bg-accent"
                        : isOver
                            ? "border-primary bg-primary/5 scale-105"
                            : "border-muted text-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/20"
                )}
                onClick={onClick}
            >
                {currentItem ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
                        <span className="font-bold text-[9px] sm:text-[10px] leading-tight overflow-hidden text-center w-full truncate">
                            {currentItem.player.name.split(' ').pop()?.substring(0, 9)}
                        </span>
                        <Badge variant="secondary" className="text-[8px] h-3 px-1 mt-0.5 opacity-70">
                            {role}
                        </Badge>
                        <div
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer hover:scale-110 shadow-sm"
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        >
                            ×
                        </div>
                    </div>
                ) : (
                    <span className="text-xs font-bold font-mono">{role}</span>
                )}
            </Button>
            <span className="text-[9px] text-muted-foreground font-mono">{index + 1}</span>
        </div>
    );
}


// --- Main Page Component ---

export default function LineupPage() {
    const { t } = useLanguage();
    const [team, setTeam] = useState<any>(null);
    const [roster, setRoster] = useState<any[]>([]);
    const [module, setModule] = useState('3-4-3');
    const [lineup, setLineup] = useState<Record<number, any>>({}); // index -> player
    const [bench, setBench] = useState<(any | null)[]>(new Array(11).fill(null)); // Fixed 11 slots
    const [matchday, setMatchday] = useState<string>("1");

    // UI selections
    const [selectedRosterPlayer, setSelectedRosterPlayer] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeDragItem, setActiveDragItem] = useState<any | null>(null);
    // Selector state: target 'lineup' or 'bench'
    const [openSelector, setOpenSelector] = useState<{ type: 'lineup' | 'bench', index: number; role?: string } | null>(null);

    const supabase = createClient();
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    useEffect(() => {
        const fetchTeam = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) return;

            const teamData = await getMyTeam(sessionData.session.user.id);
            if (teamData) {
                setTeam(teamData);
                const rosterData = await getMyRoster(teamData.id);
                if (rosterData) setRoster(rosterData);
            } else {
                window.location.href = '/team/create';
            }
        };
        fetchTeam();
    }, []);

    const formation = getFormationCoords(module);

    // Helpers
    const getGroupedRoster = () => {
        const groups: Record<string, any[]> = { P: [], D: [], C: [], A: [] };
        roster.forEach(r => {
            if (groups[r.player.role]) groups[r.player.role].push(r);
        });
        return groups;
    };
    const groupedRoster = getGroupedRoster();

    // -- Selection Logic (Click Fallback) --

    const getAvailablePlayers = (role?: string) => {
        // Exclude players already in lineup OR bench
        const lineupIds = Object.values(lineup).map((p: any) => p.player.id);
        const benchIds = bench.filter(b => b !== null).map((p: any) => p.player.id);
        const usedIds = [...lineupIds, ...benchIds];

        return roster.filter(r =>
            (!role || r.player.role === role) &&
            !usedIds.includes(r.player.id)
        );
    };

    const handleSelectPlayer = (player: any) => {
        if (!openSelector) return;

        // Same logic as DnD but simpler
        if (openSelector.type === 'lineup') {
            setLineup(prev => ({ ...prev, [openSelector.index]: player }));
        } else {
            // Bench
            setBench(prev => {
                const newBench = [...prev];
                newBench[openSelector.index] = player;
                return newBench;
            });
        }
        setOpenSelector(null);
    };

    // -- DnD Handlers --

    const handleDragStart = (event: any) => {
        const { active } = event;
        const player = active.data.current?.player;
        setActiveDragItem(player);
        setSelectedRosterPlayer(player);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        const player = active.data.current?.player; // roster item wrapper
        if (!player) return;

        // Check if dropping on a slot
        const overId = String(over.id);
        const overData = over.data.current;

        if (!overData) return;

        // 1. Role Validation
        if (overData.role !== player.player.role) {
            return;
        }

        // 2. Already used check
        const isLineup = Object.values(lineup).some((p: any) => p.player.id === player.player.id);
        const isBench = bench.some(p => p?.player.id === player.player.id);
        if (isLineup || isBench) {
            removeFromTeam(player.player.id);
        }

        // 3. Place in new spot
        if (overId.startsWith('field-')) {
            const index = parseInt(overId.replace('field-', ''));
            setLineup(prev => ({ ...prev, [index]: player }));
        } else if (overId.startsWith('bench-')) {
            const index = parseInt(overId.replace('bench-', ''));
            setBench(prev => {
                const newBench = [...prev];
                newBench[index] = player;
                return newBench;
            });
        }
    };

    const removeFromTeam = (playerId: string) => {
        // Remove from lineup
        const lineupsKeys = Object.keys(lineup).filter(k => lineup[parseInt(k)].player.id === playerId);
        if (lineupsKeys.length > 0) {
            const newLineup = { ...lineup };
            lineupsKeys.forEach(k => delete newLineup[parseInt(k)]);
            setLineup(newLineup);
        }

        // Remove from bench
        const benchIndex = bench.findIndex(p => p?.player.id === playerId);
        if (benchIndex !== -1) {
            const newBench = [...bench];
            newBench[benchIndex] = null;
            setBench(newBench);
        }
    };

    const handleSubmit = async () => {
        if (!team) return;
        setLoading(true);

        // Validate 11 starters
        if (Object.keys(lineup).length < 11) {
            alert(t('lineupIncomplete') || "You must select 11 starters.");
            setLoading(false);
            return;
        }

        const validBench = bench.filter(b => b !== null);

        const res = await saveLineup(
            team.id,
            parseInt(matchday),
            null,
            lineup,
            validBench,
            module
        );

        if (res.success) {
            alert(t('lineupSaved') || "Lineup saved successfully!");
        } else {
            alert(t('error') + ": " + res.error);
        }
        setLoading(false);
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="container mx-auto p-4 max-w-7xl pb-24">
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold">{t('lineup')}</h1>
                        <div className="flex gap-2">
                            <Select value={matchday} onValueChange={setMatchday}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 38 }, (_, i) => (
                                        <SelectItem key={i + 1} value={(i + 1).toString()}>Day {i + 1}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={module} onValueChange={setModule}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Module" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">

                    {/* LEFT PANEL: ROSTER */}
                    <Card className="md:col-span-3 h-[600px] md:h-[800px] flex flex-col order-2 md:order-1 border-0 shadow-none bg-transparent md:bg-card md:border md:shadow-sm">
                        <CardContent className="p-0 md:p-4 flex-1 overflow-y-auto">
                            <h3 className="font-bold mb-4 text-sm uppercase text-muted-foreground hidden md:block">{t('myRoster')} ({roster.length})</h3>
                            {roster.length === 0 ? (
                                <div className="text-center text-muted-foreground mt-10 text-sm">No players found.</div>
                            ) : (
                                ['P', 'D', 'C', 'A'].map(role => (
                                    <div key={role} className="mb-6">
                                        <div className="flex items-center gap-2 mb-3 px-1">
                                            <Badge variant="secondary" className="font-bold text-xs rounded-md">
                                                {role === 'P' ? 'GK' : role === 'D' ? 'DEF' : role === 'C' ? 'MID' : 'FWD'}
                                            </Badge>
                                            <div className="h-px bg-border flex-1"></div>
                                        </div>
                                        <div className="space-y-2">
                                            {groupedRoster[role]?.map((item: any) => {
                                                const isUsed = Object.values(lineup).some((p: any) => p.player.id === item.player.id) || bench.some(p => p?.player.id === item.player.id);
                                                return (
                                                    <div key={item.id} onClick={() => setSelectedRosterPlayer(item)} className={cn("transition-all", isUsed ? 'opacity-40 grayscale pointer-events-none' : '')}>
                                                        <DraggablePlayer player={item} isSelected={selectedRosterPlayer?.id === item.id} />
                                                    </div>
                                                );
                                            })}
                                            {(!groupedRoster[role] || groupedRoster[role].length === 0) && <p className="text-[10px] text-muted-foreground text-center py-2 italic">No players</p>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* CENTER PANEL: PITCH & BENCH */}
                    <div className="md:col-span-6 flex flex-col gap-6 order-1 md:order-2">
                        {/* Pitch */}
                        <div className="relative w-full aspect-[3/4] rounded-xl shadow-xl overflow-hidden touch-none select-none bg-gradient-to-b from-emerald-600 to-emerald-700 border-4 border-white/20">
                            {/* Pitch Texture Overlay */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100/30 via-transparent to-transparent pointer-events-none"></div>

                            {/* Pitch Markings */}
                            <div className="absolute top-[5%] bottom-[5%] left-[5%] right-[5%] border-2 border-white/40 opacity-80 rounded-sm pointer-events-none"></div>
                            <div className="absolute top-1/2 left-[5%] right-[5%] h-px bg-white/40 -translate-y-1/2 pointer-events-none"></div>
                            <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                            {/* Penalty Areas */}
                            <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-1/2 h-24 border-b-2 border-l-2 border-r-2 border-white/40 bg-white/5 pointer-events-none"></div>
                            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-1/2 h-24 border-t-2 border-l-2 border-r-2 border-white/40 bg-white/5 pointer-events-none"></div>

                            {/* Goal Areas */}
                            <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-1/4 h-10 border-b-2 border-l-2 border-r-2 border-white/40 pointer-events-none"></div>
                            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-1/4 h-10 border-t-2 border-l-2 border-r-2 border-white/40 pointer-events-none"></div>

                            {formation.map((pos, index) => (
                                <div
                                    key={index}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                >
                                    <DroppableSlot
                                        id={`field-${index}`}
                                        role={pos.role}
                                        currentItem={lineup[index]}
                                        onRemove={() => removeFromTeam(lineup[index]?.player.id)}
                                        onClick={() => setOpenSelector({ type: 'lineup', index, role: pos.role })}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Bench */}
                        <div>
                            <h3 className="font-bold mb-3 text-sm uppercase text-gray-500">{t('bench')}</h3>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                        {BENCH_STRUCTURE.map((slot, index) => (
                                            <DroppableBenchSlot
                                                key={index}
                                                index={index}
                                                role={slot.role}
                                                currentItem={bench[index]}
                                                onRemove={() => {
                                                    if (bench[index]) removeFromTeam(bench[index].player.id);
                                                }}
                                                onClick={() => setOpenSelector({ type: 'bench', index, role: slot.role })}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <TapScale>
                            <Button className="w-full size-lg font-bold" onClick={handleSubmit} disabled={loading}>
                                {loading ? t('loading') : t('saveLineup')}
                            </Button>
                        </TapScale>
                    </div>

                    {/* RIGHT PANEL: DETAILS */}
                    <Card className="md:col-span-3 h-[400px] md:h-[800px] order-3">
                        <CardContent className="p-6">
                            <h3 className="font-bold mb-6 text-sm uppercase text-muted-foreground">{t('playerDetails')}</h3>
                            {selectedRosterPlayer ? (
                                <StaggerItem className="flex flex-col items-center text-center space-y-6">
                                    <div className="w-28 h-28 relative flex items-center justify-center">
                                        <TeamLogo teamName={selectedRosterPlayer.player.team_real} size={100} className="opacity-10 absolute inset-0 m-auto blur-sm scale-110" />
                                        <Avatar className="w-24 h-24 z-10 border-4 border-card shadow-2xl">
                                            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-muted to-muted/50 text-foreground">
                                                {selectedRosterPlayer.player.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold leading-tight">{selectedRosterPlayer.player.name}</h2>
                                        <div className="flex items-center justify-center gap-2">
                                            <TeamLogo teamName={selectedRosterPlayer.player.team_real} size={20} />
                                            <span className="text-muted-foreground font-medium">{selectedRosterPlayer.player.team_real}</span>
                                        </div>
                                    </div>

                                    <Badge variant="outline" className={cn("text-lg px-6 py-1.5 rounded-full shadow-sm", getRoleColor(selectedRosterPlayer.player.role))}>
                                        {selectedRosterPlayer.player.role}
                                    </Badge>

                                    <div className="grid grid-cols-2 gap-4 w-full pt-6">
                                        <div className="bg-muted/50 p-4 rounded-xl text-center border border-border/50">
                                            <div className="text-[10px] uppercase text-muted-foreground mb-1 tracking-wider">{t('price')}</div>
                                            <div className="font-mono font-bold text-2xl text-primary">{selectedRosterPlayer.purchase_price}</div>
                                        </div>
                                        <div className="bg-muted/50 p-4 rounded-xl text-center border border-border/50">
                                            <div className="text-[10px] uppercase text-muted-foreground mb-1 tracking-wider">QT.</div>
                                            <div className="font-bold text-lg">{selectedRosterPlayer.player.quotation || '-'}</div>
                                        </div>
                                    </div>
                                </StaggerItem>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center text-sm space-y-4 opacity-50">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                        <span className="text-3xl">👤</span>
                                    </div>
                                    <p>{t('selectPlayerDetails')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* PLAYER SELECTOR DIALOG */}
                    <Dialog open={!!openSelector} onOpenChange={(open) => !open && setOpenSelector(null)}>
                        <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
                            <DialogHeader className="p-6 pb-2">
                                <DialogTitle className="flex items-center gap-2 text-xl">
                                    {t('selectPlayer')}
                                    <Badge variant="outline" className="text-base px-2 py-0.5 ml-2">
                                        {openSelector?.role === 'P' ? 'GK' : openSelector?.role === 'D' ? 'DEF' : openSelector?.role === 'C' ? 'MID' : 'FWD'}
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription>{t('choosePlayerInsert')}</DialogDescription>
                            </DialogHeader>
                            <div className="px-6 py-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full bg-muted/50 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <StaggerList className="flex flex-col gap-1 overflow-y-auto max-h-[50vh] p-4 pt-0">
                                {getAvailablePlayers(openSelector?.role).map((item) => (
                                    <StaggerItem key={item.id} className="w-full">
                                        <div
                                            onClick={() => handleSelectPlayer(item)}
                                            className={cn(
                                                "p-3 rounded-lg cursor-pointer flex justify-between items-center group transition-all border border-transparent hover:border-border hover:bg-muted/40 active:scale-[0.98]",
                                                getRoleColor(item.player.role).replace('bg-', 'bg-opacity-10 ').replace('text-', 'text-opacity-90 ')
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "font-bold text-xs w-8 h-8 flex items-center justify-center rounded-full border shadow-sm",
                                                    getRoleColor(item.player.role)
                                                )}>
                                                    {item.player.role}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-foreground">{item.player.name}</span>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="font-mono">Qt. {item.player.quotation}</span>
                                                        <span>•</span>
                                                        <span className="uppercase">{item.player.team_real}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <TeamLogo teamName={item.player.team_real} size={32} />
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                                    <span className="sr-only">Select</span>
                                                    <span className="text-xl">+</span>
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="h-px bg-border/40 mx-2" />
                                    </StaggerItem>
                                ))}
                                {getAvailablePlayers(openSelector?.role).length === 0 && (
                                    <div className="text-center py-8 opacity-50 flex flex-col items-center">
                                        <span className="text-4xl mb-2">🤷‍♂️</span>
                                        <p className="text-sm font-medium">{t('noPlayersAvailable')}</p>
                                        <p className="text-xs text-muted-foreground">Try removing a player from the lineup first.</p>
                                    </div>
                                )}
                            </StaggerList>
                        </DialogContent>
                    </Dialog>

                </div>

                <DragOverlay>
                    {activeDragItem ? (
                        <div className="bg-white p-2 rounded shadow-lg border border-blue-500 w-[150px] opacity-90 cursor-grabbing">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-sm truncate">{activeDragItem.player.name}</span>
                                <Badge variant="secondary" className="text-[10px]">{activeDragItem.player.role}</Badge>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}
