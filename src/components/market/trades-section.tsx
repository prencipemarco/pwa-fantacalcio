'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, List } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActiveTradesList } from './active-trades-list';

export function TradesSection({ teamId, onNewTrade }: { teamId: string, onNewTrade: () => void }) {
    const { t } = useLanguage();
    const [openList, setOpenList] = useState(false);

    return (
        <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{t('trades')}</CardTitle>
                <ArrowLeftRight className="h-6 w-6 text-purple-500" />
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Dialog open={openList} onOpenChange={setOpenList}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-100">
                                <List className="w-4 h-4 mr-2" /> Active Trades
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Active Trade Proposals</DialogTitle>
                            </DialogHeader>
                            <ActiveTradesList teamId={teamId} />
                        </DialogContent>
                    </Dialog>

                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={onNewTrade}>
                        {t('newTrade')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
