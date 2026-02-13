'use client';

import { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    DragEndEvent,
    DragStartEvent
} from '@dnd-kit/core';
import { LineupField } from './lineup-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TeamLogo } from '@/components/team-logo';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { getFormationCoords, MODULES, getRoleColor } from '@/lib/lineup-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Save, LogOut, Loader2, ChevronLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

interface LineupBuilderProps {
    roster: any[];
    initialLineup?: Record<number, any>;
    initialBench?: (any | null)[];
    initialModule?: string;
    initialMatchday: string;
    onSave: (lineup: Record<number, any>, bench: (any | null)[], module: string) => Promise<void>;
    loading?: boolean;
}

export function LineupBuilder({ roster, initialLineup = {}, initialBench = new Array(11).fill(null), initialModule = '3-4-3', initialMatchday, onSave, loading }: LineupBuilderProps) {
    const { t } = useLanguage();

    // State
    const [module, setModule] = useState(initialModule);
    const [lineup, setLineup] = useState<Record<number, any>>(initialLineup);
    const [bench, setBench] = useState<(any | null)[]>(initialBench);
    const [activeDragItem, setActiveDragItem] = useState<any | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 10 } })
    );

    const formation = getFormationCoords(module);

    const isUsed = (playerId: string) => {
        return Object.values(lineup).some((p: any) => p.player.id === playerId) ||
            bench.some(p => p?.player.id === playerId);
    };

    // -- DnD Handlers (Simplified for Field Swapping / Bench Moving) --

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        // logic for dragging FROM field/bench if we allow re-arranging
        // For now, let's keep it simple: Clicking is primary for adding.
        // Dragging might be complex without a visible roster list.
        // If user drags a player ON FIELD, maybe they want to swap?
        // Let's implement full click-based flow first as requested ("Remove roster list").
    };

    const handleDragEnd = (event: DragEndEvent) => {
        // Placeholder if we enable drag later
    };

    // Clean removal
    const removeFromTeam = (playerId: string) => {
        const newLineup = { ...lineup };
        let updated = false;

        // Check Lineup
        Object.keys(newLineup).forEach(key => {
            if (newLineup[parseInt(key)]?.player.id === playerId) {
                delete newLineup[parseInt(key)];
                updated = true;
            }
        });

        // Check Bench
        const benchIndex = bench.findIndex(p => p?.player.id === playerId);
        let newBench = [...bench];
        if (benchIndex !== -1) {
            newBench[benchIndex] = null;
            updated = true;
        }

        if (updated) {
            setLineup(newLineup);
            setBench(newBench);
        }
    };

    // -- Click Handling (Modal Selector) --

    const [selectorOpen, setSelectorOpen] = useState<{ type: 'field' | 'bench', index: number, role: string } | null>(null);

    const handleSlotClick = (index: number, role: string, type: 'field' | 'bench') => {
        setSelectorOpen({ type, index, role });
    };

    const handleSelectFromDialog = (player: any) => {
        if (!selectorOpen) return;

        removeFromTeam(player.player.id); // Remove from old spot if exists

        if (selectorOpen.type === 'field') {
            setLineup(prev => ({ ...prev, [selectorOpen.index]: player }));
        } else {
            setBench(prev => {
                const newBench = [...prev];
                newBench[selectorOpen.index] = player;
                return newBench;
            });
        }
        setSelectorOpen(null);
    };

    // -- Module Selector Visuals --
    // Horizontal scrollable strip

    return (
        <div className="flex flex-col gap-4 pb-24">

            {/* --- HEADER --- */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md pt-4 pb-2 border-b">
                <div className="flex justify-between items-center mb-4 px-1">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-accent transition-colors">
                            <ChevronLeft size={24} />
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">{t('lineup')}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-secondary/50 px-4 py-2 rounded-full border border-border/50 min-h-[40px]">
                            <Calendar size={16} className="text-muted-foreground" />
                            <span className="text-md font-bold font-mono">Day {initialMatchday}</span>
                        </div>

                        <Button
                            onClick={() => onSave(lineup, bench, module)}
                            disabled={loading}
                            size="icon"
                            className="rounded-full w-10 h-10 shadow-md bg-primary hover:bg-primary/90"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={20} />}
                        </Button>
                    </div>
                </div>

                {/* --- MODULE STRIP --- */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 mask-fade-sides">
                    {MODULES.map(m => (
                        <button
                            key={m}
                            onClick={() => setModule(m)}
                            className={cn(
                                "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                                module === m
                                    ? "bg-foreground text-background border-foreground shadow-sm scale-105"
                                    : "bg-card text-muted-foreground border-border hover:bg-accent hover:border-foreground/20"
                            )}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                    {/* FIELD Section */}
                    <div className="md:col-span-12 flex flex-col gap-6">

                        {/* Visual Field */}
                        <LineupField
                            formation={formation}
                            lineup={lineup}
                            onRemove={(id) => removeFromTeam(id)}
                            onSlotClick={(index, role) => handleSlotClick(index, role, 'field')}
                        />

                        {/* Bench Section */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                {t('bench')}
                                <span className="h-px bg-border flex-1"></span>
                            </h3>
                            <div className="grid grid-cols-6 sm:grid-cols-11 gap-2 overflow-x-auto pb-2">
                                {bench.map((item, index) => {
                                    // Bench Bench Structure mapping
                                    // 2 P, 3 D, 3 C, 3 A
                                    const role = index < 2 ? 'P' : index < 5 ? 'D' : index < 8 ? 'C' : 'A';

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleSlotClick(index, role, 'bench')}
                                            className={cn(
                                                "aspect-square rounded-xl flex flex-col items-center justify-center border-2 border-dashed cursor-pointer transition-all relative overflow-hidden",
                                                item ? "border-solid border-border bg-card shadow-sm" : "border-muted/30 hover:bg-accent/50"
                                            )}
                                        >
                                            {item ? (
                                                <div className="w-full h-full p-1 flex flex-col items-center justify-center">
                                                    <span className="text-[9px] font-bold truncate w-full text-center">{item.player.name.split(' ').pop()?.substring(0, 8)}</span>
                                                    <Badge variant="secondary" className="text-[7px] h-3 px-1 mt-0.5">{item.player.role}</Badge>
                                                    <div
                                                        className="absolute top-0 right-0 p-0.5 bg-destructive text-white rounded-bl-md opacity-0 group-hover:opacity-100"
                                                        onClick={(e) => { e.stopPropagation(); removeFromTeam(item.player.id) }}
                                                    >
                                                        ✕
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-muted-foreground/40">{role}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- DIALOG SELECTOR (MODAL) --- */}
                <Dialog open={!!selectorOpen} onOpenChange={(open) => !open && setSelectorOpen(null)}>
                    <DialogContent className="max-w-md h-[80vh] flex flex-col p-0 gap-0 border-0 md:border md:rounded-xl md:h-[600px]">
                        <DialogHeader className="p-4 border-b bg-muted/20">
                            <DialogTitle className="flex items-center gap-2">
                                Select {selectorOpen?.role}
                                <Badge variant="outline" className="ml-auto">{
                                    roster.filter(r => r.player.role === selectorOpen?.role && !isUsed(r.player.id)).length
                                } Available</Badge>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="overflow-y-auto flex-1 p-2 space-y-1">
                            {roster
                                .filter(r => r.player.role === selectorOpen?.role && !isUsed(r.player.id))
                                .map(r => (
                                    <div
                                        key={r.id}
                                        onClick={() => handleSelectFromDialog(r)}
                                        className="p-3 rounded-lg border border-transparent hover:bg-accent/40 hover:border-border cursor-pointer flex justify-between items-center transition-all active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Role Badge */}
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0",
                                                getRoleColor(r.player.role)
                                            )}>
                                                {r.player.role}
                                            </div>

                                            <div className="flex flex-col min-w-0">
                                                <div className="font-bold text-sm truncate">{r.player.name}</div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="font-mono flex items-center gap-1">
                                                        <TeamLogo teamName={r.player.team_real} size={12} />
                                                        {r.player.team_real.toUpperCase()}
                                                    </span>
                                                    {r.player.quotation && <span>• Qt. {r.player.quotation}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                                            <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-lg leading-none pb-0.5">+</div>
                                        </Button>
                                    </div>
                                ))
                            }
                            {roster.filter(r => r.player.role === selectorOpen?.role && !isUsed(r.player.id)).length === 0 && (
                                <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                                    <span className="text-4xl">🏜️</span>
                                    <p>No players available for this role.</p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

            </DndContext>
        </div>
    );
}
