import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import webPush from 'web-push';

webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
    const { title, message, userId } = await request.json(); // userId optional, if null send to all? Or specific array.

    // Auth check: Only admin or internal calls (pseudo-check here, better use a shared secret for Cron)
    // For now, assume this endpoint is protected or called internally
    const supabase = await createClient();

    let query = supabase.from('push_subscriptions').select('subscription');

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data: subscriptions } = await query;

    if (!subscriptions) return NextResponse.json({ success: true, count: 0 });

    const payload = JSON.stringify({ title, body: message });

    let successCount = 0;
    for (const sub of subscriptions) {
        try {
            await webPush.sendNotification(sub.subscription, payload);
            successCount++;
        } catch (error) {
            console.error('Error sending push', error);
            // Optionally delete invalid subscription
        }
    }

    return NextResponse.json({ success: true, count: successCount });
}
