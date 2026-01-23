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
        case 'P': return 'bg-yellow-100/50 text-yellow-700 border-yellow-200';
        case 'D': return 'bg-green-100/50 text-green-700 border-green-200';
        case 'C': return 'bg-blue-100/50 text-blue-700 border-blue-200';
        case 'A': return 'bg-red-100/50 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700';
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
            className={`text-xs md:text-sm p-2 rounded cursor-grab active:cursor-grabbing flex justify-between items-center hover:bg-gray-50 transition-colors border ${isSelected ? 'bg-blue-50 border-blue-200' : 'border-transparent'} ${isDragging ? 'opacity-50' : ''}`}
        >
            <span className="truncate font-medium max-w-[100px]">{player.player.name}</span>
            <TeamLogo teamName={player.player.team_real} size={16} />
        </div>
    );
}

function DroppableSlot({ id, role, currentItem, onRemove, onClick }: { id: string, role: string, currentItem: any | null, onRemove: () => void, onClick?: () => void }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { role, type: id.startsWith('bench') ? 'bench' : 'field' }
    });

    return (
        <div ref={setNodeRef} className="relative cursor-pointer" onClick={onClick}>
            <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all shadow-md
                ${currentItem
                        ? 'bg-white border-white text-black'
                        : isOver
                            ? 'bg-green-400/80 border-white scale-110' // Highlight on hover
                            : 'bg-black/40 border-white text-white hover:bg-black/60'
                    }`}
            >
                {currentItem ? (
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-xs overflow-hidden truncate px-1 max-w-full leading-tight">{currentItem.player.name.substring(0, 8)}</span>
                        <div
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer hover:bg-red-600 shadow-sm"
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        >
                            ×
                        </div>
                    </div>
                ) : (
                    <span className="text-xl font-bold">+</span>
                )}
            </div>
            {currentItem && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap flex items-center gap-1">
                    <TeamLogo teamName={currentItem.player.team_real} size={12} className="inline brightness-0 invert" />
                </div>
            )}
            {!currentItem && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white/80 font-mono bg-black/20 px-1 rounded">
                    {role}
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
                variant="outline"
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center p-0 border-dashed transition-all
                ${currentItem
                        ? 'border-solid border-blue-500 bg-blue-50 text-blue-900'
                        : isOver
                            ? 'border-solid border-green-500 bg-green-50 scale-105'
                            : 'text-gray-400'
                    }`}
                onClick={onClick}
            >
                {currentItem ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <span className="font-bold text-[9px] overflow-hidden truncate px-1 max-w-full">{currentItem.player.name.substring(0, 3)}</span>
                        <div
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] cursor-pointer hover:bg-red-600"
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        >
                            ×
                        </div>
                    </div>
                ) : (
                    <span className="text-xs font-mono">{role}</span>
                )}
            </Button>
            <span className="text-[10px] text-gray-500 font-mono">{index + 1}</span>
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
                    <Card className="md:col-span-3 h-[600px] md:h-[800px] flex flex-col order-2 md:order-1">
                        <CardContent className="p-4 flex-1 overflow-y-auto">
                            <h3 className="font-bold mb-4 text-sm uppercase text-gray-500">{t('myRoster')} ({roster.length})</h3>
                            {roster.length === 0 ? (
                                <div className="text-center text-gray-500 mt-10">No players found.</div>
                            ) : (
                                ['A', 'C', 'D', 'P'].map(role => (
                                    <div key={role} className="mb-4">
                                        <h4 className="font-bold text-xs bg-gray-100 p-1 rounded mb-2 text-center text-gray-700">{role === 'P' ? 'GK' : role === 'D' ? 'DEF' : role === 'C' ? 'MID' : 'FWD'}</h4>
                                        <div className="space-y-1">
                                            {groupedRoster[role]?.map((item: any) => {
                                                const isUsed = Object.values(lineup).some((p: any) => p.player.id === item.player.id) || bench.some(p => p?.player.id === item.player.id);
                                                return (
                                                    <div key={item.id} onClick={() => setSelectedRosterPlayer(item)} className={isUsed ? 'opacity-50 grayscale' : ''}>
                                                        <DraggablePlayer player={item} isSelected={selectedRosterPlayer?.id === item.id} />
                                                    </div>
                                                );
                                            })}
                                            {(!groupedRoster[role] || groupedRoster[role].length === 0) && <p className="text-[9px] text-gray-300 text-center">Empty</p>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* CENTER PANEL: PITCH & BENCH */}
                    <div className="md:col-span-6 flex flex-col gap-6 order-1 md:order-2">
                        {/* Pitch */}
                        <div className="relative w-full aspect-[3/4] bg-green-600 rounded-xl shadow-inner border-2 border-green-800 overflow-hidden">
                            {/* Pitch markings */}
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/30 -translate-y-1/2"></div>
                            <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute top-0 left-1/4 w-1/2 h-16 border-b-2 border-l-2 border-r-2 border-white/30 bg-transparent"></div>
                            <div className="absolute bottom-0 left-1/4 w-1/2 h-16 border-t-2 border-l-2 border-r-2 border-white/30 bg-transparent"></div>

                            {formation.map((pos, index) => (
                                <div
                                    key={index}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
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
                            <h3 className="font-bold mb-6 text-sm uppercase text-gray-500">{t('playerDetails')}</h3>
                            {selectedRosterPlayer ? (
                                <StaggerItem className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-24 h-24 relative flex items-center justify-center">
                                        <TeamLogo teamName={selectedRosterPlayer.player.team_real} size={88} className="opacity-10 absolute inset-0 m-auto blur-sm" />
                                        <Avatar className="w-24 h-24 z-10 border-4 border-white shadow-xl">
                                            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700">
                                                {selectedRosterPlayer.player.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-bold">{selectedRosterPlayer.player.name}</h2>
                                        <div className="flex items-center justify-center gap-2">
                                            <TeamLogo teamName={selectedRosterPlayer.player.team_real} size={16} />
                                            <span className="text-muted-foreground">{selectedRosterPlayer.player.team_real}</span>
                                        </div>
                                    </div>

                                    <Badge className="text-lg px-4 py-1">
                                        {selectedRosterPlayer.player.role}
                                    </Badge>

                                    <div className="grid grid-cols-2 gap-4 w-full pt-4">
                                        <div className="bg-gray-50 p-3 rounded text-center">
                                            <div className="text-[10px] uppercase text-gray-500 mb-1">{t('price')}</div>
                                            <div className="font-mono font-bold text-lg">{selectedRosterPlayer.purchase_price}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded text-center">
                                            <div className="text-[10px] uppercase text-gray-500 mb-1">QT.</div>
                                            <div className="font-bold text-gray-800">{selectedRosterPlayer.player.quotation || '-'}</div>
                                        </div>
                                    </div>
                                </StaggerItem>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center text-sm">
                                    <p>{t('selectPlayerDetails')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* PLAYER SELECTOR DIALOG */}
                    <Dialog open={!!openSelector} onOpenChange={(open) => !open && setOpenSelector(null)}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{t('selectPlayer')} ({openSelector?.role})</DialogTitle>
                                <DialogDescription>{t('choosePlayerInsert')}</DialogDescription>
                            </DialogHeader>
                            <StaggerList className="grid gap-2 overflow-y-auto max-h-[60vh] pr-2">
                                {getAvailablePlayers(openSelector?.role).map((item) => (
                                    <StaggerItem key={item.id} className="w-full">
                                        <div
                                            onClick={() => handleSelectPlayer(item)}
                                            className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center group
                                                ${getRoleColor(item.player.role)} hover:shadow-md transition-all active:scale-95`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="font-bold text-xs bg-white/50 w-6 h-6 flex items-center justify-center rounded-full border border-black/10">
                                                    {item.player.role}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{item.player.name}</span>
                                                    <span className="text-[10px] opacity-70 flex items-center gap-1">
                                                        Qt. {item.player.quotation || '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <TeamLogo teamName={item.player.team_real} size={24} />
                                            </div>
                                        </div>
                                    </StaggerItem>
                                ))}
                                {getAvailablePlayers(openSelector?.role).length === 0 && (
                                    <p className="text-center text-gray-500 py-4 text-xs italic">{t('noPlayersAvailable')}</p>
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
