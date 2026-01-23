'use client';

import { useState, useEffect } from 'react';
import { getMyRoster, getTeams } from '@/app/actions/user';
import { createTradeProposal } from '@/app/actions/market';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ArrowLeftRight } from 'lucide-react';

export function NewTradeFlow({ myTeamId, onClose }: { myTeamId: string, onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [teams, setTeams] = useState<any[]>([]);
    const [opponentId, setOpponentId] = useState<string>('');

    // Rosters
    const [myRoster, setMyRoster] = useState<any[]>([]);
    const [theirRoster, setTheirRoster] = useState<any[]>([]);

    // Selected for Trade
    const [myOffer, setMyOffer] = useState<any[]>([]); // Players I give
    const [theirOffer, setTheirOffer] = useState<any[]>([]); // Players I get

    // Credits
    const [myCredits, setMyCredits] = useState<string>('0');
    const [theirCredits, setTheirCredits] = useState<string>('0');

    // Load Teams
    useEffect(() => {
        getTeams().then(data => setTeams(data.filter((t: any) => t.id !== myTeamId)));
    }, [myTeamId]);

    // Load Rosters when Opponent Selected
    useEffect(() => {
        if (opponentId) {
            Promise.all([
                getMyRoster(myTeamId),
                getMyRoster(opponentId)
            ]).then(([mine, theirs]) => {
                setMyRoster(mine || []);
                setTheirRoster(theirs || []);
            });
        }
    }, [opponentId, myTeamId]);

    const handleStage = (player: any, side: 'mine' | 'theirs') => {
        if (side === 'mine') {
            if (myOffer.find(p => p.player_id === player.player_id)) {
                setMyOffer(myOffer.filter(p => p.player_id !== player.player_id)); // Unstage
            } else {
                setMyOffer([...myOffer, player]); // Stage
            }
        } else {
            if (theirOffer.find(p => p.player_id === player.player_id)) {
                setTheirOffer(theirOffer.filter(p => p.player_id !== player.player_id));
            } else {
                setTheirOffer([...theirOffer, player]);
            }
        }
    };

    const getRoleCounts = (roster: any[]) => {
        const counts = { P: 0, D: 0, C: 0, A: 0 };
        roster.forEach(p => {
            const r = p.player.role as keyof typeof counts;
            if (counts[r] !== undefined) counts[r]++;
        });
        return counts;
    };

    const validateTrade = () => {
        const myRoles = { P: 0, D: 0, C: 0, A: 0 };
        myOffer.forEach(p => {
            const r = p.player.role as keyof typeof myRoles;
            if (myRoles[r] !== undefined) myRoles[r]++;
        });

        const theirRoles = { P: 0, D: 0, C: 0, A: 0 };
        theirOffer.forEach(p => {
            const r = p.player.role as keyof typeof theirRoles;
            if (theirRoles[r] !== undefined) theirRoles[r]++;
        });

        if (myRoles.P !== theirRoles.P) return "Must exchange same number of Goalkeepers.";
        if (myRoles.D !== theirRoles.D) return "Must exchange same number of Defenders.";
        if (myRoles.C !== theirRoles.C) return "Must exchange same number of Midfielders.";
        if (myRoles.A !== theirRoles.A) return "Must exchange same number of Forwards.";

        const mCred = parseInt(myCredits) || 0;
        const tCred = parseInt(theirCredits) || 0;

        if (myOffer.length === 0 && theirOffer.length === 0 && mCred === 0 && tCred === 0) return "Empty trade.";

        return null;
    };

    const handleSubmit = async () => {
        const error = validateTrade();
        if (error) {
            alert(error);
            return;
        }

        if (!opponentId) return;

        const res = await createTradeProposal(
            myTeamId,
            opponentId,
            myOffer.map(p => p.player_id),
            theirOffer.map(p => p.player_id),
            parseInt(myCredits) || 0,
            parseInt(theirCredits) || 0
        );

        if (res.success) {
            onClose();
        } else {
            alert(res.error);
        }
    };

    const RoleSummary = ({ roster }: { roster: any[] }) => {
        const counts = getRoleCounts(roster);
        return (
            <div className="flex justify-around text-[10px] font-mono bg-black/5 p-1 border-b">
                <span>P: <span className="font-bold">{counts.P}</span></span>
                <span>D: <span className="font-bold">{counts.D}</span></span>
                <span>C: <span className="font-bold">{counts.C}</span></span>
                <span>A: <span className="font-bold">{counts.A}</span></span>
            </div>
        );
    };

    if (step === 1) {
        return (
            <div className="space-y-4">
                <h3 className="font-bold">Select Trading Partner</h3>
                <Select value={opponentId} onValueChange={setOpponentId}>
                    <SelectTrigger><SelectValue placeholder="Select Team" /></SelectTrigger>
                    <SelectContent>
                        {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button disabled={!opponentId} onClick={() => setStep(2)}>Next</Button>
                </div>
            </div>
        );
    }

    // Step 2: Trade Board
    return (
        <div className="h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-2 border-b pb-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>change partner</Button>
                <span className="font-bold font-mono text-xs">TRADE PROPOSAL</span>
                <Button size="sm" onClick={handleSubmit}>Send</Button>
            </div>

            {/* Split View */}
            <div className="flex-1 grid grid-cols-2 gap-2 overflow-hidden min-h-0">
                {/* MY SIDE */}
                <div className="flex flex-col border rounded-md overflow-hidden bg-slate-50">
                    <div className="bg-blue-100 p-2 text-center text-xs font-bold text-blue-800">My Setup</div>
                    <RoleSummary roster={myRoster} />
                    <div className="flex-1 overflow-y-auto p-1 space-y-1">
                        {myRoster.map(p => {
                            const isSelected = myOffer.find(o => o.player_id === p.player_id);
                            return (
                                <div key={p.player_id}
                                    onClick={() => handleStage(p, 'mine')}
                                    className={`p-2 rounded border text-xs cursor-pointer flex justify-between items-center
                                        ${isSelected ? 'bg-blue-600 text-white border-blue-700' : 'bg-white hover:bg-white/50'}`}>
                                    <span>{p.player.name}</span>
                                    {isSelected && <Check className="w-3 h-3" />}
                                    {!isSelected && <span className="text-[10px] opacity-50">{p.player.role}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* THEIR SIDE */}
                <div className="flex flex-col border rounded-md overflow-hidden bg-slate-50">
                    <div className="bg-purple-100 p-2 text-center text-xs font-bold text-purple-800">Opponent Setup</div>
                    <RoleSummary roster={theirRoster} />
                    <div className="flex-1 overflow-y-auto p-1 space-y-1">
                        {theirRoster.map(p => {
                            const isSelected = theirOffer.find(o => o.player_id === p.player_id);
                            return (
                                <div key={p.player_id}
                                    onClick={() => handleStage(p, 'theirs')}
                                    className={`p-2 rounded border text-xs cursor-pointer flex justify-between items-center
                                        ${isSelected ? 'bg-purple-600 text-white border-purple-700' : 'bg-white hover:bg-white/50'}`}>
                                    <span>{p.player.name}</span>
                                    {isSelected && <Check className="w-3 h-3" />}
                                    {!isSelected && <span className="text-[10px] opacity-50">{p.player.role}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* SUMMARY & CREDITS AREA */}
            <div className="border-t mt-2 flex flex-col gap-2 pt-2 bg-gray-50 flex-shrink-0">
                {/* Players Staged */}
                <div className="flex gap-2 h-24">
                    <div className="flex-1 border border-dashed border-blue-300 rounded p-2 overflow-y-auto relative">
                        <div className="text-[10px] text-blue-500 font-bold mb-1 sticky top-0 bg-gray-50">OFFERING ({myOffer.length})</div>
                        {myOffer.map(p => <div key={p.player_id} className="text-xs truncate">{p.player.name}</div>)}
                    </div>

                    <div className="flex items-center justify-center text-gray-400">
                        <ArrowLeftRight />
                    </div>

                    <div className="flex-1 border border-dashed border-purple-300 rounded p-2 overflow-y-auto relative">
                        <div className="text-[10px] text-purple-500 font-bold mb-1 sticky top-0 bg-gray-50">REQUESTING ({theirOffer.length})</div>
                        {theirOffer.map(p => <div key={p.player_id} className="text-xs truncate">{p.player.name}</div>)}
                    </div>
                </div>

                {/* Credits Input */}
                <div className="grid grid-cols-2 gap-2 pb-2 px-1">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Credits to Include</label>
                        <Input
                            type="number"
                            value={myCredits}
                            onChange={e => setMyCredits(e.target.value)}
                            className="h-8 text-xs bg-white"
                            placeholder="0"
                            min="0"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Credits to Request</label>
                        <Input
                            type="number"
                            value={theirCredits}
                            onChange={e => setTheirCredits(e.target.value)}
                            className="h-8 text-xs bg-white"
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
