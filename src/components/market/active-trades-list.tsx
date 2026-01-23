'use client';

import { useState, useEffect } from 'react';
import { getMyTradeProposals, cancelTradeProposal, rejectTradeProposal, acceptTradeProposal } from '@/app/actions/market';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, Trash2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

export function ActiveTradesList({ teamId }: { teamId: string }) {
    const { t } = useLanguage();
    const [trades, setTrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTrades = () => {
        setLoading(true);
        getMyTradeProposals(teamId).then(data => {
            setTrades(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadTrades();
    }, [teamId]);

    const handleAccept = async (id: number) => {
        if (!confirm(t('confirmTrade'))) return;
        const res = await acceptTradeProposal(id);
        if (res.success) {
            alert(t('tradeAccepted'));
            loadTrades();
        }
        else alert(res.error);
    };

    const handleReject = async (id: number) => {
        if (!confirm(t('rejectTrade'))) return;
        const res = await rejectTradeProposal(id);
        if (res.success) {
            alert(t('tradeRejected'));
            loadTrades();
        }
        else alert(res.error);
    };

    const handleCancel = async (id: number) => {
        if (!confirm(t('cancelTrade'))) return;
        const res = await cancelTradeProposal(id);
        if (res.success) {
            alert(t('tradeCancelled'));
            loadTrades();
        }
        else alert(res.error);
    };

    const TradeCard = ({ trade }: { trade: any }) => {
        const isProposer = trade.proposer_team_id === teamId;
        const partnerName = isProposer ? trade.receiver.name : trade.proposer.name;

        // Status Colors
        let statusColor = 'bg-gray-100 text-gray-800';
        if (trade.status === 'ACCEPTED') statusColor = 'bg-green-100 text-green-800';
        if (trade.status === 'REJECTED') statusColor = 'bg-red-100 text-red-800';
        if (trade.status === 'CANCELLED') statusColor = 'bg-slate-100 text-slate-800 line-through';

        return (
            <div className="border rounded-lg p-3 bg-white shadow-sm mb-3">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{isProposer ? 'To:' : 'From:'} {partnerName}</span>
                        <Badge variant="outline" className={statusColor}>{trade.status}</Badge>
                    </div>
                    <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(trade.created_at), { addSuffix: true })}
                    </span>
                </div>

                {/* Details */}
                <div className="flex items-center text-xs gap-2 mb-3">
                    <div className="flex-1 bg-blue-50 p-2 rounded">
                        <div className="font-bold text-blue-700 mb-1">{t('youGive')}</div>
                        {isProposer ? (
                            <>
                                {trade.proposer_player_ids.length} players
                                {trade.proposer_credits > 0 && <span className="block text-[10px]">+ {trade.proposer_credits} cr</span>}
                            </>
                        ) : (
                            <>
                                {trade.receiver_player_ids.length} players
                                {trade.receiver_credits > 0 && <span className="block text-[10px]">+ {trade.receiver_credits} cr</span>}
                            </>
                        )}
                    </div>
                    <ArrowRight className="text-gray-300 w-4 h-4" />
                    <div className="flex-1 bg-purple-50 p-2 rounded">
                        <div className="font-bold text-purple-700 mb-1">{t('youGet')}</div>
                        {isProposer ? (
                            <>
                                {trade.receiver_player_ids.length} players
                                {trade.receiver_credits > 0 && <span className="block text-[10px]">+ {trade.receiver_credits} cr</span>}
                            </>
                        ) : (
                            <>
                                {trade.proposer_player_ids.length} players
                                {trade.proposer_credits > 0 && <span className="block text-[10px]">+ {trade.proposer_credits} cr</span>}
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {trade.status === 'PENDING' && (
                    <div className="flex justify-end gap-2">
                        {isProposer ? (
                            <Button size="sm" variant="outline" className="text-red-600 h-7 text-xs" onClick={() => handleCancel(trade.id)}>
                                <Trash2 className="w-3 h-3 mr-1" /> {t('back')}
                            </Button>
                        ) : (
                            <>
                                <Button size="sm" variant="outline" className="text-red-600 h-7 text-xs" onClick={() => handleReject(trade.id)}>
                                    <XCircle className="w-3 h-3 mr-1" /> {t('error')}
                                </Button>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7 text-xs" onClick={() => handleAccept(trade.id)}>
                                    <CheckCircle className="w-3 h-3 mr-1" /> {t('success')}
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div className="p-4 text-center text-xs text-gray-500">{t('loading')}</div>;

    const sent = trades.filter(t => t.proposer_team_id === teamId);
    const received = trades.filter(t => t.receiver_team_id === teamId);

    return (
        <div className="max-h-[60vh] overflow-y-auto">
            <div className="flex justify-end mb-2">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={loadTrades}><RefreshCw className="w-3 h-3" /></Button>
            </div>

            {received.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-xs font-bold text-purple-600 uppercase mb-2">{t('receivedProposals')} ({received.length})</h4>
                    {received.map(t => <TradeCard key={t.id} trade={t} />)}
                </div>
            )}

            {sent.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold text-blue-600 uppercase mb-2">{t('sentProposals')} ({sent.length})</h4>
                    {sent.map(t => <TradeCard key={t.id} trade={t} />)}
                </div>
            )}

            {sent.length === 0 && received.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">{t('noTrades')}</div>
            )}
        </div>
    );
}
