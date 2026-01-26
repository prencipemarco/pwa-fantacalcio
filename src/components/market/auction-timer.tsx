'use client';

import { useState, useEffect } from 'react';

export function AuctionTimer({ endTime, className }: { endTime: string, className?: string }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            const end = new Date(endTime).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('Ended');
                setIsUrgent(false);
                return;
            }

            // < 5 minutes
            if (diff < 300000) setIsUrgent(true);

            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <span className={`font-mono font-bold ${isUrgent ? 'animate-pulse' : ''} ${className}`}>
            {timeLeft}
        </span>
    );
}
