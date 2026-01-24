import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/utils/notifications';
import { getNextSerieAMatch } from '@/app/actions/football-data';
import { differenceInMinutes, parseISO } from 'date-fns';

// Check every 10-15 mins (Cron)
export async function GET() {
    try {
        const matchData = await getNextSerieAMatch();

        if (!matchData.found || !matchData.kickoff) {
            return NextResponse.json({ success: false, message: 'No match found' });
        }

        const kickoffDate = parseISO(matchData.kickoff);
        const now = new Date();
        const diffMinutes = differenceInMinutes(kickoffDate, now);

        // Logic: Notify if ~1 hour before kickoff (e.g., between 55 and 65 mins)
        // Cron runs every 10 mins, so this window is safe.
        if (diffMinutes >= 55 && diffMinutes <= 65) {
            const title = `Matchday ${matchData.matchday} Starts Soon!`;
            const body = `Create your lineup! ${matchData.home} vs ${matchData.away} starts in 1 hour.`;

            const result = await sendPushNotification(null, title, body);
            return NextResponse.json({ success: true, sent: true, count: result.count });
        }

        return NextResponse.json({
            success: true,
            sent: false,
            message: `Too early/late. Starts in ${diffMinutes} mins.`
        });

    } catch (error: any) {
        console.error('Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
