'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
            // 1. Kick off registration explicitly (next-pwa handling is disabled)
            navigator.serviceWorker.register('/sw.js')
                .catch(err => {
                    console.error('SW Register Error:', err);
                    setErrorMessage(`SW Register Error: ${err.message}`);
                });

            // 2. Wait for the Service Worker to be ACTIVE (Ready)
            // This promise resolves only when the SW is active and controlling the page.
            navigator.serviceWorker.ready.then(reg => {
                console.log('SW Ready:', reg);
                setRegistration(reg);

                // check existing subscription
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setSubscription(sub);
                        setIsSubscribed(true);

                        // RESYNC: Ensure server has this subscription
                        fetch('/api/push/subscribe', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(sub)
                        }).catch(e => console.error('Sync failed', e));
                    }
                });
            }).catch(err => {
                console.error('SW Ready Error:', err);
                setErrorMessage(`SW Ready Error: ${err.message}`);
            });
        } else {
            setErrorMessage('Not Supported');
        }
    }, []);

    const subscribe = async () => {
        if (!registration) {
            alert('Service Worker not ready yet. Please wait or reload.');
            return;
        }
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

    const handleCheckedChange = async (checked: boolean) => {
        if (checked) {
            await subscribe();
        } else {
            await unsubscribe();
        }
    };

    if (errorMessage) {
        return <div className="text-xs text-red-400">{errorMessage}</div>;
    }

    if (isIOS && !isStandalone) {
        return <div className="text-xs text-orange-500 font-medium">Add to Home Screen</div>;
    }

    if (!registration) {
        return <div className="text-xs text-gray-400">Loading...</div>;
    }

    return (
        <div className="flex items-center gap-2">
            <Switch
                checked={isSubscribed}
                onCheckedChange={handleCheckedChange}
                aria-label="Toggle notifications"
            />
            <span className={`text-[10px] font-medium ${isSubscribed ? 'text-green-600' : 'text-gray-400'}`}>
                {isSubscribed ? 'Active' : 'Inactive'}
            </span>
        </div>
    );
}
