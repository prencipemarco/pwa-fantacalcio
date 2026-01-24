'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

export function TestNotificationButton() {
    const [loading, setLoading] = useState(false);

    const sendTest = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Test Notification 🔔',
                    message: 'If you see this, push notifications are working correctly!',
                    // No userId means broadcast to all
                })
            });
            const data = await res.json();
            alert(`Sent to ${data.count} devices.`);
        } catch (error) {
            console.error(error);
            alert('Error sending test.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
            onClick={sendTest}
            disabled={loading}
        >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Sending...' : 'Send Test Notification'}
        </Button>
    );
}
