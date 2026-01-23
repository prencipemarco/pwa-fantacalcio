'use client';

import { useState, useEffect } from 'react';
import { getMyRoster, getTeams } from '@/app/actions/user';
import { createTradeProposal } from '@/app/actions/market';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ArrowLeftRight, ArrowRight, Wallet, Shield, Users } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useLanguage } from '@/contexts/LanguageContext';

// --- HELPER COMPONENTS ---

const RoleSummary = ({ roster }: { roster: any[] }) => {
    const counts = { P: 0, D: 0, C: 0, A: 0 };
    roster.forEach(p => {
        const r = p.player.role as keyof typeof counts;
        if (counts[r] !== undefined) counts[r]++;
    });
    return (
        <div className="flex justify-around text-[10px] font-mono bg-black/5 p-1 border-b">
            <span>P:<span className="font-bold">{counts.P}</span></span>
            <span>D:<span className="font-bold">{counts.D}</span></span>
            <span>C:<span className="font-bold">{counts.C}</span></span>
            <span>A:<span className="font-bold">{counts.A}</span></span>
        </div>
    );
};

const PlayerList = ({
    roster,
    selectedIds,
    onToggle,
    title,
    colorClass
}: {
    roster: any[],
    selectedIds: number[],
    onToggle: (p: any) => void,
    title: string,
    colorClass: string
}) => (
    <div className="flex flex-col border rounded-md overflow-hidden bg-white h-full shadow-sm">
        <div className={`${colorClass} p-2 text-center text-xs font-bold uppercase tracking-wider`}>{title}</div>
        <RoleSummary roster={roster} />
        <div className="flex-1 overflow-y-auto p-1 space-y-1">
            {roster.map(p => {
                const isSelected = selectedIds.includes(p.player_id);
                return (
                    <div key={p.player_id}
                        onClick={() => onToggle(p)}
                        className={`p-2 rounded border text-xs cursor-pointer flex justify-between items-center transition-all
                            ${isSelected ? 'bg-slate-800 text-white border-slate-900 shadow-md' : 'bg-white hover:bg-slate-50 border-slate-100'}`}
                    >
                        <span className="font-medium">{p.player.name}</span>
                        {isSelected ? <Check className="w-3 h-3" /> : <span className="text-[10px] font-mono opacity-50">{p.player.role}</span>}
                    </div>
                );
            })}
        </div>
    </div>
);

const OfferBox = ({
    players,
    credits,
    onCreditsChange,
    title,
    creditsLabel
}: {
    players: any[],
    credits: string,
    onCreditsChange: (v: string) => void,
    title: string,
    creditsLabel: string
}) => (
    <div className="border border-dashed border-slate-300 rounded-lg p-3 flex flex-col h-full bg-slate-50/50">
        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{title} ({players.length})</div>
        <div className="flex-1 overflow-y-auto space-y-1 mb-2">
            {players.length === 0 && <div className="text-center text-slate-300 text-xs italic mt-4">No players selected</div>}
            {players.map(p => (
                <div key={p.player_id} className="text-xs font-medium bg-white px-2 py-1 rounded border shadow-sm flex justify-between">
                    {p.player.name} <span className="text-[10px] text-gray-400">{p.player.role}</span>
                </div>
            ))}
        </div>
        <div className="mt-auto pt-2 border-t">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                <Wallet className="w-3 h-3" /> {creditsLabel || 'Credits'}
            </label>
            <Input
                type="number"
                value={credits}
                onChange={e => onCreditsChange(e.target.value)}
                className="h-8 text-xs bg-white"
                placeholder="0"
                min="0"
            />
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export function NewTradeFlow({ myTeamId, onClose }: { myTeamId: string, onClose: () => void }) {
    const { t } = useLanguage();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    // State
    const [step, setStep] = useState(1);
    const [teams, setTeams] = useState<any[]>([]);
    const [opponentId, setOpponentId] = useState<string>('');

    const [myRoster, setMyRoster] = useState<any[]>([]);
    const [theirRoster, setTheirRoster] = useState<any[]>([]);

    const [myOffer, setMyOffer] = useState<any[]>([]);
    const [theirOffer, setTheirOffer] = useState<any[]>([]);

    const [myCredits, setMyCredits] = useState<string>('0');
    const [theirCredits, setTheirCredits] = useState<string>('0');

    // Load Teams
    useEffect(() => {
        getTeams().then(data => setTeams(data.filter((t: any) => t.id !== myTeamId)));
    }, [myTeamId]);

    // Load Rosters
    useEffect(() => {
        if (opponentId) {
            Promise.all([getMyRoster(myTeamId), getMyRoster(opponentId)])
                .then(([mine, theirs]) => {
                    setMyRoster(mine || []);
                    setTheirRoster(theirs || []);
                });
        }
    }, [opponentId, myTeamId]);

    const handleToggle = (player: any, side: 'mine' | 'theirs') => {
        const list = side === 'mine' ? myOffer : theirOffer;
        const setList = side === 'mine' ? setMyOffer : setTheirOffer;

        if (list.find(p => p.player_id === player.player_id)) {
            setList(list.filter(p => p.player_id !== player.player_id));
        } else {
            setList([...list, player]);
        }
    };

    const validate = () => {
        const getRoles = (list: any[]) => {
            const r = { P: 0, D: 0, C: 0, A: 0 };
            list.forEach(p => {
                const role = p.player.role as keyof typeof r;
                if (r[role] !== undefined) r[role]++;
            });
            return r;
        };

        const myRoles = getRoles(myOffer);
        const theirRoles = getRoles(theirOffer);

        if (myRoles.P !== theirRoles.P) return t('roleMismatch');
        if (myRoles.D !== theirRoles.D) return t('roleMismatch');
        if (myRoles.C !== theirRoles.C) return t('roleMismatch');
        if (myRoles.A !== theirRoles.A) return t('roleMismatch');

        if (myOffer.length === 0 && theirOffer.length === 0 && parseInt(myCredits || '0') === 0 && parseInt(theirCredits || '0') === 0) return t('emptyTrade');

        return null;
    };

    const handleSubmit = async () => {
        const error = validate();
        if (error) { alert(error); return; }

        const res = await createTradeProposal(
            myTeamId,
            opponentId,
            myOffer.map(p => p.player_id),
            theirOffer.map(p => p.player_id),
            parseInt(myCredits) || 0,
            parseInt(theirCredits) || 0
        );

        if (res.success) {
            alert(t('tradeSent'));
            onClose();
        }
        else alert(res.error);
    };

    // --- RENDER ---

    if (step === 1) {
        return (
            <div className="space-y-6 py-4">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg">{t('selectPartner')}</h3>
                    <p className="text-xs text-gray-500">{t('chooseOpponent')}</p>
                </div>

                <Select value={opponentId} onValueChange={setOpponentId}>
                    <SelectTrigger className="w-full h-12"><SelectValue placeholder={t('selectTeam')} /></SelectTrigger>
                    <SelectContent>
                        {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                </Select>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="ghost" onClick={onClose}>{t('back')}</Button>
                    <Button disabled={!opponentId} onClick={() => setStep(2)} className="w-full sm:w-auto">
                        {t('startTrade')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        );
    }

    const opponentName = teams.find(t => t.id === opponentId)?.name || 'Opponent';

    // DESKTOP LAYOUT (4 Columns)
    if (isDesktop) {
        return (
            <div className="h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <Button variant="ghost" onClick={() => setStep(1)} size="sm">{t('changePartner')}</Button>
                    <div className="font-bold text-lg">{t('tradeProposal')}</div>
                    <Button onClick={handleSubmit}>{t('sendProposal')}</Button>
                </div>

                <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
                    <PlayerList
                        title={t('myRoster')}
                        roster={myRoster}
                        selectedIds={myOffer.map(p => p.player_id)}
                        onToggle={(p) => handleToggle(p, 'mine')}
                        colorClass="bg-blue-100 text-blue-800"
                    />

                    <OfferBox
                        title={t('myOffer')}
                        players={myOffer}
                        credits={myCredits}
                        onCreditsChange={setMyCredits}
                        creditsLabel={t('offerCredits')}
                    />

                    <OfferBox
                        title={t('theirOffer')}
                        players={theirOffer}
                        credits={theirCredits}
                        onCreditsChange={setTheirCredits}
                        creditsLabel={t('requestCredits')}
                    />

                    <PlayerList
                        title={t('theirRoster')}
                        roster={theirRoster}
                        selectedIds={theirOffer.map(p => p.player_id)}
                        onToggle={(p) => handleToggle(p, 'theirs')}
                        colorClass="bg-purple-100 text-purple-800"
                    />
                </div>
            </div>
        );
    }

    // MOBILE LAYOUT (Stepper)
    const mobileStep = step;
    const setMobileStep = setStep;

    return (
        <div className="h-[80vh] flex flex-col relative">
            {/* Header Steps */}
            <div className="flex justify-between mb-4 px-1">
                {[2, 3, 4].map(s => (
                    <div key={s} className={`h-1 flex-1 mx-1 rounded-full ${s <= mobileStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                ))}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                {mobileStep === 2 && (
                    <>
                        <div className="text-center mb-2">
                            <h4 className="font-bold">{t('selectRequest')}</h4>
                            <p className="text-xs text-gray-500">{t('fromRoster')} {opponentName}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto mb-2">
                            <PlayerList
                                title={t('theirRoster')}
                                roster={theirRoster}
                                selectedIds={theirOffer.map(p => p.player_id)}
                                onToggle={(p) => handleToggle(p, 'theirs')}
                                colorClass="bg-purple-100 text-purple-800"
                            />
                        </div>
                        <div className="p-2 border rounded bg-gray-50 mb-2">
                            <div className="text-[10px] font-bold uppercase mb-1 text-gray-500">{t('requestCredits')}</div>
                            <Input
                                type="number"
                                value={theirCredits}
                                onChange={e => setTheirCredits(e.target.value)}
                                className="bg-white h-9"
                                placeholder="0"
                            />
                        </div>
                        <Button className="w-full mt-2" onClick={() => setMobileStep(3)}>{t('nextMyOffer')}</Button>
                    </>
                )}

                {mobileStep === 3 && (
                    <>
                        <div className="text-center mb-2">
                            <h4 className="font-bold">{t('selectOffer')}</h4>
                            <p className="text-xs text-gray-500">{t('myRoster')}</p>
                        </div>
                        {/* Requirement Hint */}
                        <div className="bg-yellow-50 p-2 text-xs mb-2 border border-yellow-200 rounded text-yellow-800 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>{t('matchRolesWarning').replace('X', theirOffer.length.toString())}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto mb-2">
                            <PlayerList
                                title={t('myRoster')}
                                roster={myRoster}
                                selectedIds={myOffer.map(p => p.player_id)}
                                onToggle={(p) => handleToggle(p, 'mine')}
                                colorClass="bg-blue-100 text-blue-800"
                            />
                        </div>
                        <div className="p-2 border rounded bg-gray-50 mb-2">
                            <div className="text-[10px] font-bold uppercase mb-1 text-gray-500">{t('offerCredits')}</div>
                            <Input
                                type="number"
                                value={myCredits}
                                onChange={e => setMyCredits(e.target.value)}
                                className="bg-white h-9"
                                placeholder="0"
                            />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setMobileStep(2)}>{t('back')}</Button>
                            <Button className="flex-1" onClick={() => setMobileStep(4)}>{t('reviewProposal')}</Button>
                        </div>
                    </>
                )}

                {mobileStep === 4 && (
                    <div className="flex flex-col h-full">
                        <h4 className="font-bold text-center mb-4">{t('reviewProposal')}</h4>

                        <div className="flex-1 overflow-y-auto space-y-4">
                            <OfferBox
                                title={t('youGive')}
                                players={myOffer}
                                credits={myCredits}
                                onCreditsChange={setMyCredits}
                                creditsLabel={t('offerCredits')}
                            />
                            <div className="flex justify-center"><ArrowLeftRight className="text-gray-400" /></div>
                            <OfferBox
                                title={t('youGet')}
                                players={theirOffer}
                                credits={theirCredits}
                                onCreditsChange={setTheirCredits}
                                creditsLabel={t('requestCredits')}
                            />
                        </div>

                        <div className="mt-4 pt-4 border-t flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setMobileStep(3)}>{t('back')}</Button>
                            <Button className="flex-[2]" onClick={handleSubmit}>{t('confirmSend')}</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
