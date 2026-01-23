'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, XCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function TradesSection({ teamId, onNewTrade }: { teamId: string, onNewTrade: () => void }) {
    const { t } = useLanguage();
    // Placeholder state for now
    const [trades, setTrades] = useState<any[]>([]);

    return (
        <Card className="cursor-pointer hover:bg-slate-50 border-purple-200 bg-purple-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{t('trades')}</CardTitle>
                <ArrowLeftRight className="h-6 w-6 text-purple-500" />
            </CardHeader>
            <CardContent>
                <CardDescription>
                    {trades.length > 0
                        ? `${trades.length} ${t('tradeProposals')}`
                        : t('noTrades')}
                </CardDescription>
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700" variant="secondary" onClick={onNewTrade}>
                    {t('newTrade')}
                </Button>
            </CardContent>
        </Card>
    );
}
