'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export function PushNotificationManager() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // iOS Check
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(iOS);
        const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(standalone);

        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Explicitly try to register to ensure scope and existence
            // We use /sw.js which next-pwa generates (and imports push-worker.js)
            navigator.serviceWorker.register('/sw.js')
                .then(reg => {
                    setRegistration(reg);
                    reg.pushManager.getSubscription().then(sub => {
                        if (sub) {
                            setSubscription(sub);
                            setIsSubscribed(true);
                        }
                    });
                })
                .catch(err => {
                    console.error('SW Registration Failed:', err);
                    setErrorMessage('SW Error');
                });
        } else {
            setErrorMessage('Not Supported');
        }
    }, []);

    const subscribe = async () => {
        if (!registration) return;
        try {
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
            });
            setSubscription(sub);
            setIsSubscribed(true);

            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub)
            });
            alert('Notifications enabled!');
        } catch (error: any) {
            console.error('Failed to subscribe', error);
            alert('Error subscribing: ' + error.message);
        }
    };

    const unsubscribe = async () => {
        if (!subscription) return;
        await subscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);
    };

    if (errorMessage) {
        return <div className="text-xs text-red-400">{errorMessage}</div>;
    }

    if (isIOS && !isStandalone) {
        return <div className="text-xs text-orange-500 font-medium">Add to Home Screen to enable notifications.</div>;
    }

    if (!registration) {
        return <div className="text-xs text-gray-400">Loading...</div>;
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={isSubscribed ? unsubscribe : subscribe}
                className={isSubscribed ? 'text-blue-500 bg-blue-50' : 'text-gray-400'}
                title={isSubscribed ? "Disable Notifications" : "Enable Notifications"}
            >
                {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </Button>
            {isSubscribed && <span className="text-[10px] text-green-600 font-medium">Active</span>}
        </div>
    );
}
