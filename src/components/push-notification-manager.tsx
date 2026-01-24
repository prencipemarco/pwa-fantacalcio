'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

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

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // run only in browser
            navigator.serviceWorker.ready.then(reg => {
                setRegistration(reg);
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setSubscription(sub);
                        setIsSubscribed(true);
                    }
                });
            });
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

            // Send to server
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub)
            });
            alert('Notifications enabled!');
        } catch (error) {
            console.error('Failed to subscribe', error);
        }
    };

    const unsubscribe = async () => {
        if (!subscription) return;
        await subscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);
        // Ideally remove from DB too, but for now simple local unsubscribe
    };

    if (!registration) {
        return <div className="text-xs text-gray-400">Push notifications not supported</div>;
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={isSubscribed ? unsubscribe : subscribe}
            className={isSubscribed ? 'text-blue-500' : 'text-gray-400'}
            title={isSubscribed ? "Disable Notifications" : "Enable Notifications"}
        >
            {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </Button>
    );
}
