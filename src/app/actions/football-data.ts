'use server';

// Fetch next Serie A match to determine deadline
// API: football-data.org
// Competition Code: SA (Serie A)

const API_TOKEN = process.env.FOOTBALL_DATA_API_KEY;
const API_URL = 'https://api.football-data.org/v4/competitions/SA/matches';

type MatchData = {
    found: boolean;
    matchday?: number;
    kickoff?: string; // ISO of the *first* match of the week
    home?: string;
    away?: string;
    inProgress?: boolean;
    error?: string;
    message?: string;
};

export async function getNextSerieAMatch(): Promise<MatchData> {
    if (!API_TOKEN) {
        // Fallback for dev/demo without key
        return { found: false, error: 'Missing API Key' };
    }

    try {
        // 1. Find the next scheduled match (to identify the current/next matchday)
        const nextRes = await fetch(`${API_URL}?status=SCHEDULED&limit=1`, {
            headers: { 'X-Auth-Token': API_TOKEN },
            next: { revalidate: 3600 } // Cache 1h
        });

        if (!nextRes.ok) {
            console.error('Football Data API Error:', nextRes.statusText);
            return { found: false, error: 'API Error' };
        }
        const nextData = await nextRes.json();

        if (!nextData.matches || nextData.matches.length === 0) {
            return { found: false, message: 'No scheduled matches found' };
        }

        const targetMatchday = nextData.matches[0].matchday;

        // 2. Fetch ALL matches for this matchday to find the *true* start time
        // (The 'next' match might be the Sunday game, but MD started Friday)
        const mdRes = await fetch(`${API_URL}?matchday=${targetMatchday}`, {
            headers: { 'X-Auth-Token': API_TOKEN },
            next: { revalidate: 3600 }
        });

        if (!mdRes.ok) return { found: false, error: 'API Error (MD)' };
        const mdData = await mdRes.json();

        const matches = mdData.matches;
        if (!matches || matches.length === 0) return { found: false };

        // Sort by date to find the very first match of the round
        matches.sort((a: any, b: any) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

        const firstMatch = matches[0];
        const earliestKickoff = new Date(firstMatch.utcDate);
        const now = new Date();

        // Check if the matchday has ALREADY started
        // (If first match is in the past, or if any match is LIVE/FINISHED)
        // Usually 'now > earliestKickoff' is enough.
        const isStarted = now > earliestKickoff;

        return {
            found: true,
            matchday: targetMatchday,
            kickoff: firstMatch.utcDate, // The TRUE start of the MD
            home: firstMatch.homeTeam.name,
            away: firstMatch.awayTeam.name,
            inProgress: isStarted
        };

    } catch (error) {
        console.error('Error fetching match data:', error);
        return { found: false, error: 'Fetch failed' };
    }
}
