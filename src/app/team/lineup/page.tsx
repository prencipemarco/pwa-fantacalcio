'use client';

// ... imports
import { useState, useEffect } from 'react';
import { getMyTeam, getMyRoster, verifyTeamPassword, checkTeamUnlocked } from '@/app/actions/user';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MODULES = ['3-4-3', '3-5-2', '4-4-2', '4-5-1', '5-3-2', '5-4-1'];

// Helper to get positions coordinates based on module
// 0-100% Top-Bottom, 0-100% Left-Right
const getFormationCoords = (module: string) => {
    const [def, mid, fwd] = module.split('-').map(Number);
    const coords: { role: string; x: number; y: number }[] = [];

    // GK
    coords.push({ role: 'P', x: 50, y: 90 });

    // Defenders
    for (let i = 0; i < def; i++) {
        coords.push({ role: 'D', x: (100 / (def + 1)) * (i + 1), y: 70 });
    }

    // Midfielders
    for (let i = 0; i < mid; i++) {
        coords.push({ role: 'C', x: (100 / (mid + 1)) * (i + 1), y: 45 });
    }

    // Forwards
    for (let i = 0; i < fwd; i++) {
        coords.push({ role: 'A', x: (100 / (fwd + 1)) * (i + 1), y: 15 });
    }

    return coords;
};

export default function LineupPage() {
    const [team, setTeam] = useState<any>(null);
    const [roster, setRoster] = useState<any[]>([]);
    const [module, setModule] = useState('3-4-3');
    const [lineup, setLineup] = useState<Record<number, any>>({}); // index -> player
    const [bench, setBench] = useState<any[]>([]);
    const [openSelector, setOpenSelector] = useState<{ index: number; role: string } | null>(null);

    // Security
    const [unlocked, setUnlocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [unlockError, setUnlockError] = useState('');

    const supabase = createClient();

    useEffect(() => {
        // Determine User Team
        const fetchTeam = async () => {
            // Mock User ID or get from session
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) return; // Handle redirect

            const teamData = await getMyTeam(sessionData.session.user.id);
            if (teamData) {
                setTeam(teamData);
                // Check unlock status
                const isUnlocked = await checkTeamUnlocked(teamData.id);
                setUnlocked(isUnlocked);

                const rosterData = await getMyRoster(teamData.id);
                if (rosterData) setRoster(rosterData);
            } else {
                // Redirect to create team
                window.location.href = '/team/create';
            }
        };
        fetchTeam();
    }, []);

    const handleUnlock = async () => {
        if (!team) return;
        const res = await verifyTeamPassword(team.id, passwordInput);
        if (res.success) {
            setUnlocked(true);
            setUnlockError('');
        } else {
            setUnlockError(res.error || 'Invalid password');
        }
    };

    if (team && !unlocked) {
        return (
            <Dialog open={true} onOpenChange={() => window.location.href = '/'}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Team Locked</DialogTitle>
                        <DialogDescription>
                            Please enter your team password to access the lineup.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            type="password"
                            placeholder="Password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                        />
                        {unlockError && <p className="text-red-500 text-sm mt-2">{unlockError}</p>}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => window.location.href = '/'}>Cancel</Button>
                        <Button onClick={handleUnlock}>Unlock</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    const formation = getFormationCoords(module);

    const handleSelectPlayer = (player: any) => {
        if (!openSelector) return;

        // Add to lineup
        setLineup(prev => ({ ...prev, [openSelector.index]: player }));
        setOpenSelector(null);
    };

    const getAvailablePlayers = (role: string) => {
        // Filter by role and exclude already selected in lineup
        const selectedIds = Object.values(lineup).map((p: any) => p.player.id);
        return roster.filter(r => r.player.role === role && !selectedIds.includes(r.player.id));
    };

    return (
        <div className="container mx-auto p-4 max-w-lg pb-20">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Set Lineup</h1>
                <Select value={module} onValueChange={setModule}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Module" />
                    </SelectTrigger>
                    <SelectContent>
                        {MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* PITCH VISUALIZATION */}
            <div className="relative w-full aspect-[3/4] bg-green-600 rounded-xl shadow-inner border-2 border-green-800 overflow-hidden mb-6">
                {/* Pitch Lines (Simple) */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/30 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-0 left-1/4 w-1/2 h-16 border-b-2 border-l-2 border-r-2 border-white/30 bg-transparent"></div>
                <div className="absolute bottom-0 left-1/4 w-1/2 h-16 border-t-2 border-l-2 border-r-2 border-white/30 bg-transparent"></div>

                {formation.map((pos: { role: string, x: number, y: number }, index: number) => {
                    const selected = lineup[index];
                    return (
                        <div
                            key={index}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        >
                            <Dialog open={openSelector?.index === index} onOpenChange={(open) => !open && setOpenSelector(null)}>
                                <DialogTrigger asChild>
                                    <button
                                        onClick={() => setOpenSelector({ index, role: pos.role })}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-all ${selected ? 'bg-white text-black' : 'bg-black/40 text-white hover:bg-black/60'}`}
                                    >
                                        {selected ? (
                                            <span className="font-bold text-xs overflow-hidden truncate px-1">{selected.player.name.substring(0, 8)}</span>
                                        ) : (
                                            <span className="text-xl font-bold">+</span>
                                        )}
                                    </button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Select {pos.role === 'P' ? 'Goalkeeper' : pos.role === 'D' ? 'Defender' : pos.role === 'C' ? 'Midfielder' : 'Forward'}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-2 overflow-y-auto max-h-[60vh]">
                                        {getAvailablePlayers(pos.role).map((item) => (
                                            <div key={item.id} onClick={() => handleSelectPlayer(item)} className="p-3 border rounded hover:bg-gray-100 cursor-pointer flex justify-between">
                                                <span className="font-bold">{item.player.name}</span>
                                                <span className="text-gray-500">{item.player.team_real}</span>
                                            </div>
                                        ))}
                                        {getAvailablePlayers(pos.role).length === 0 && <p className="text-center text-gray-500">No players available.</p>}
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {selected && (
                                <div className="mt-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded shadow">
                                    {selected.player.team_real.substring(0, 3)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* BENCH SECTION */}
            <h3 className="font-bold mb-2">Bench</h3>
            <Card>
                <CardContent className="p-4 space-y-2 text-center text-gray-500 text-sm">
                    Bench selection not implemented in this MVP demo.
                    <br /> Logic would be similar to starters.
                </CardContent>
            </Card>

            <Button className="w-full mt-6 size-lg font-bold">Submit Lineup</Button>
        </div>
    );
}
