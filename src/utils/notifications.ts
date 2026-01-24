import { createClient } from '@/utils/supabase/server';
import webPush from 'web-push';

webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushNotification(userIds: string[] | null, title: string, message: string) {
    const supabase = await createClient();

    let query = supabase.from('push_subscriptions').select('subscription');

    if (userIds) {
        query = query.in('user_id', userIds);
    }

    const { data: subscriptions } = await query;

    if (!subscriptions || subscriptions.length === 0) return { success: true, count: 0 };

    const payload = JSON.stringify({ title, body: message });

    let successCount = 0;
    const promises = subscriptions.map(async (sub) => {
        try {
            await webPush.sendNotification(sub.subscription, payload);
            successCount++;
        } catch (error) {
            console.error('Error sending push', error);
            // Delete invalid?
        }
    });

    await Promise.all(promises);
    return { success: true, count: successCount };
}
