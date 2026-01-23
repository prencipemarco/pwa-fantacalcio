'use client';

import { useState, useEffect } from 'react';
import { getNextSerieAMatch } from '@/app/actions/football-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, AlertCircle, Info, PlayCircle } from 'lucide-react';
import { format, differenceInHours, differenceInMinutes, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export function MatchdayReminder() {
    const { t } = useLanguage();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNextSerieAMatch().then(res => {
            setData(res);
            setLoading(false);
        });
    }, []);

    if (loading) return null;

    if (!data || !data.found) {
        if (data?.error === 'Missing API Key') {
            return (
                <Card className="mb-6 bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4 flex items-center gap-3 text-yellow-800 text-sm justify-center">
                        <Info className="w-5 h-5" />
                        <span>{t('setupApiKey')}</span>
                    </CardContent>
                </Card>
            );
        }
        return null;
    }

    // -- In Progress State --
    if (data.inProgress) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 w-full"
            >
                <Card className="border-l-4 border-l-blue-500 bg-blue-50 shadow-md">
                    <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                            <div className="p-3 rounded-full shrink-0 bg-blue-200 text-blue-700 animate-pulse">
                                <PlayCircle className="w-8 h-8 md:w-6 md:h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg md:text-xl">
                                    {t('matchday')} {data.matchday} {t('inProgress') || 'in Corso'}
                                </h3>
                                <p className="text-sm text-blue-700 font-medium">
                                    {t('lineupsLocked') || 'Formazioni Chiuse'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/60 p-2 rounded px-4 border border-blue-200">
                            <span className="font-black text-blue-800 tracking-widest">LIVE</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    // -- Countdown State --
    const kickoffDate = parseISO(data.kickoff);
    const now = new Date();
    const diffHours = differenceInHours(kickoffDate, now);
    const diffMinutes = differenceInMinutes(kickoffDate, now);

    const isUrgent = diffHours < 24;
    const isCritical = diffHours < 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 w-full"
        >
            <Card className={`border-l-4 shadow-md overflow-hidden transition-colors ${isCritical ? 'border-l-red-500 bg-red-50' : isUrgent ? 'border-l-orange-500 bg-orange-50' : 'border-l-green-500 bg-white'}`}>
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">

                    {/* Left Content */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:flex-1 min-w-0">
                        <div className={`p-3 rounded-full shrink-0 ${isCritical ? 'bg-red-200 text-red-700' : isUrgent ? 'bg-orange-200 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {isCritical ? <AlertCircle className="w-8 h-8 md:w-6 md:h-6 animate-pulse" /> : <CalendarClock className="w-8 h-8 md:w-6 md:h-6" />}
                        </div>

                        <div className="flex flex-col items-center md:items-start min-w-0 w-full">
                            <h3 className="font-bold text-gray-900 text-lg md:text-xl flex flex-wrap justify-center md:justify-start items-center gap-2 leading-tight">
                                {t('nextMatchday')} {data.matchday}
                            </h3>
                            <Badge variant="secondary" className="mt-2 md:mt-1 text-xs md:text-sm font-normal py-1 px-2 whitespace-normal h-auto text-center md:text-left">
                                {data.home} vs {data.away}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-2 md:mt-1 flex flex-col md:flex-row gap-1 items-center">
                                <span>{t('startsAt')}</span>
                                <span className="font-mono font-bold bg-black/5 px-2 rounded">{format(kickoffDate, "EEE d MMM, HH:mm", { locale: it })}</span>
                            </p>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="flex flex-col items-center md:items-end justify-center shrink-0 min-w-[140px] bg-white/60 p-3 rounded-lg border border-black/5 w-full md:w-auto mt-2 md:mt-0 shadow-sm">
                        <div className={`text-4xl md:text-3xl font-black font-mono tracking-tighter ${isCritical ? 'text-red-600' : 'text-gray-800'}`}>
                            {diffHours > 0 ? `${diffHours}h ` : ''}{diffMinutes % 60}m
                        </div>
                        <div className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">{t('timeLeft')}</div>
                    </div>

                </CardContent>
            </Card>
        </motion.div>
    );
}
