'use client';

import { useState, useEffect } from 'react';

type CountdownProps = {
    targetDate: Date;
};

export function Countdown({ targetDate }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference <= 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    if (!timeLeft) return <div>Loading countdown...</div>;

    return (
        <div className="flex gap-4 text-center">
            <div className="flex flex-col">
                <span className="text-4xl font-bold font-mono">{timeLeft.days}</span>
                <span className="text-xs uppercase">Days</span>
            </div>
            <div className="flex flex-col">
                <span className="text-4xl font-bold font-mono">{timeLeft.hours}</span>
                <span className="text-xs uppercase">Hours</span>
            </div>
            <div className="flex flex-col">
                <span className="text-4xl font-bold font-mono">{timeLeft.minutes}</span>
                <span className="text-xs uppercase">Minutes</span>
            </div>
            <div className="flex flex-col">
                <span className="text-4xl font-bold font-mono">{timeLeft.seconds}</span>
                <span className="text-xs uppercase">Seconds</span>
            </div>
        </div>
    );
}
