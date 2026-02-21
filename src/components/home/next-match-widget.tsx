'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronDown, Clock } from 'lucide-react';
import { TeamLogo } from '@/components/team-logo';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface NextMatchWidgetProps {
    nextMatch?: {
        matchday?: number;
        kickoff?: string;
        home?: string;
        away?: string;
        homeLogo?: string;
        awayLogo?: string;
        found: boolean;
    };
}

export function NextMatchWidget({ nextMatch }: NextMatchWidgetProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!nextMatch?.kickoff) return;

        const calculateTimeLeft = () => {
            const difference = +new Date(nextMatch.kickoff!) - +new Date();
            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);

                if (days > 0) {
                    return `Mancano ${days}g ${hours}h`;
                }
                return `Mancano ${hours}h ${minutes}m`;
            }
            return 'In corso / Conclusa';
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000);

        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [nextMatch]);

    if (!nextMatch) {
        return (
            <Card className="p-4 flex flex-col items-center justify-center text-center gap-2 border-dashed bg-muted/30 min-h-[100px]">
                <Calendar className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Calendario in aggiornamento</p>
            </Card>
        );
    }

    const nextMatchDate = nextMatch.kickoff ? new Date(nextMatch.kickoff) : new Date();
    const formattedDate = format(nextMatchDate, 'EEE d MMM, HH:mm', { locale: it });

    return (
        <div className="relative">
            {/* Collapsed View / Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-md p-4 flex items-center justify-between hover:brightness-110 transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm uppercase tracking-wide opacity-90">Giornata {nextMatch.matchday}</span>
                        <span className="text-xs font-medium text-blue-100">{timeLeft}</span>
                    </div>
                </div>

                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <Card className="mt-2 overflow-hidden border-none shadow-lg bg-gradient-to-br from-primary/90 to-blue-600 text-white relative group p-0 gap-0">
                            {/* Content from original card... */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
                            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-black/10 blur-2xl" />

                            <Link href="/calendar" className="block p-6 relative z-10 hover:bg-white/5 transition-colors">
                                <div className="flex justify-center mb-4">
                                    <Badge variant="outline" className="border-white/20 text-white bg-white/10 backdrop-blur-sm">
                                        PROSSIMO TURNO
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex flex-col items-center gap-2 flex-1">
                                        <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-sm p-2 flex items-center justify-center border border-white/20">
                                            <TeamLogo teamName={nextMatch.home || ''} logoUrl={nextMatch.homeLogo} size={48} />
                                        </div>
                                        <span className="text-xs font-bold text-center leading-tight line-clamp-2">{nextMatch.home}</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xl font-black italic opacity-90">VS</span>
                                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap">{formattedDate}</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 flex-1">
                                        <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-sm p-2 flex items-center justify-center border border-white/20">
                                            <TeamLogo teamName={nextMatch.away || ''} logoUrl={nextMatch.awayLogo} size={48} />
                                        </div>
                                        <span className="text-xs font-bold text-center leading-tight line-clamp-2">{nextMatch.away}</span>
                                    </div>
                                </div>
                                <div className="text-center mt-4 text-[10px] text-blue-200">
                                    Clicca per vedere il calendario completo
                                </div>
                            </Link>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
