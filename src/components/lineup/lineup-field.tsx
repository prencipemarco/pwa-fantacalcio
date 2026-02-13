import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { TeamLogo } from '@/components/team-logo';
import { motion } from 'framer-motion';

interface LineupFieldProps {
    formation: { role: string; x: number; y: number }[];
    lineup: Record<number, any>;
    onRemove: (playerId: string) => void;
    onSlotClick: (index: number, role: string) => void;
}

export function LineupField({ formation, lineup, onRemove, onSlotClick }: LineupFieldProps) {
    return (
        <div className="relative w-full aspect-[3/4] rounded-2xl shadow-xl overflow-hidden touch-none select-none bg-[#1a472a] border-2 border-white/10">
            {/* --- Advanced Pitch Visuals --- */}

            {/* Grass Texture (Subtle Striping) */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10%, #000 10%, #000 20%)',
                    backgroundSize: '100% 100%'
                }}
            />
            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

            {/* Pitch Lines (White with glow) */}
            <div className="absolute inset-[15px] border-2 border-white/40 rounded-sm pointer-events-none" />

            <div className="absolute top-1/2 left-[15px] right-[15px] h-0.5 bg-white/40 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/60 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            {/* Penalty Areas */}
            <div className="absolute top-[15px] left-1/2 -translate-x-1/2 w-[60%] h-32 border-b-2 border-l-2 border-r-2 border-white/40 pointer-events-none" />
            <div className="absolute top-[15px] left-1/2 -translate-x-1/2 w-[25%] h-12 border-b-2 border-l-2 border-r-2 border-white/40 pointer-events-none" />

            <div className="absolute bottom-[15px] left-1/2 -translate-x-1/2 w-[60%] h-32 border-t-2 border-l-2 border-r-2 border-white/40 pointer-events-none" />
            <div className="absolute bottom-[15px] left-1/2 -translate-x-1/2 w-[25%] h-12 border-t-2 border-l-2 border-r-2 border-white/40 pointer-events-none" />

            {/* Corner Arcs */}
            <div className="absolute top-[15px] left-[15px] w-6 h-6 border-b-2 border-r-2 border-white/40 rounded-br-full pointer-events-none" />
            <div className="absolute top-[15px] right-[15px] w-6 h-6 border-b-2 border-l-2 border-white/40 rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-[15px] left-[15px] w-6 h-6 border-t-2 border-r-2 border-white/40 rounded-tr-full pointer-events-none" />
            <div className="absolute bottom-[15px] right-[15px] w-6 h-6 border-t-2 border-l-2 border-white/40 rounded-tl-full pointer-events-none" />


            {/* --- Players Slots --- */}
            {formation.map((pos, index) => (
                <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                    <FieldSlot
                        id={`field-${index}`}
                        role={pos.role}
                        player={lineup[index]}
                        onRemove={() => onRemove(lineup[index]?.player.id)}
                        onClick={() => onSlotClick(index, pos.role)}
                    />
                </div>
            ))}
        </div>
    );
}

function FieldSlot({ id, role, player, onRemove, onClick }: { id: string, role: string, player: any | null, onRemove: () => void, onClick?: () => void }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { role, type: 'field' }
    });

    return (
        <div ref={setNodeRef} onClick={onClick} className="relative group cursor-pointer">
            {/* Slot Circle */}
            <motion.div
                layout
                className={cn(
                    "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all shadow-md relative overflow-hidden",
                    player
                        ? "bg-card border-white text-foreground"
                        : isOver
                            ? "bg-yellow-400 border-yellow-200 scale-110 shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                            : "bg-black/30 border-white/20 hover:bg-black/40 hover:border-white/50 backdrop-blur-sm"
                )}
            >
                {player ? (
                    <>
                        {/* Jersey / Team Logo as BG - Opacity increased for visibility */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-muted/20">
                            <TeamLogo teamName={player.player.team_real} size={36} className="opacity-80 grayscale-[0.2]" />
                        </div>

                        {/* Player Name */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-[8px] sm:text-[9px] text-white text-center py-0.5 truncate px-1">
                            {player.player.name.split(' ').pop()?.substring(0, 10)}
                        </div>

                        {/* Remove Button (Corner) */}
                        <div
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow-sm hover:scale-110 z-20"
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        >
                            ✕
                        </div>
                    </>
                ) : (
                    <span className="text-white/50 font-bold text-xs font-mono">{role}</span>
                )}
            </motion.div>

            {/* Info Tag below slot (Rating/QT) */}
            {player && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-md text-[8px] px-1.5 py-px rounded-sm shadow-sm border border-slate-200 whitespace-nowrap z-20">
                    <span className="font-bold text-slate-800">{player.player.team_real.substring(0, 3).toUpperCase()}</span>
                </div>
            )}
        </div>
    );
}
