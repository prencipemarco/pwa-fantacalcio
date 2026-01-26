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

export type LiveMatch = {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    minute: string | number; // 'FT', 'HT', or minute
    status: 'SCHEDULED' | 'LIVE' | 'PAUSED' | 'FINISHED';
    events: any[]; // Likely empty for free tier
};

export async function getLiveMatches(): Promise<LiveMatch[]> {
    if (!API_TOKEN) {
        console.warn('Missing API Key for Live Matches');
        return [];
    }

    try {
        // 1. Determine Current Matchday
        const nextRes = await fetch(`${API_URL}?status=SCHEDULED&limit=1`, {
            headers: { 'X-Auth-Token': API_TOKEN },
            next: { revalidate: 600 } // Cache 10m
        });

        if (!nextRes.ok) return [];
        const nextData = await nextRes.json();

        // If no scheduled matches, maybe season ended? 
        if (!nextData.matches || nextData.matches.length === 0) {
            return [];
        }

        const targetMatchday = nextData.matches[0].matchday;

        // 2. Fetch ALL matches for this matchday
        const mdRes = await fetch(`${API_URL}?matchday=${targetMatchday}`, {
            headers: { 'X-Auth-Token': API_TOKEN },
            next: { revalidate: 60 } // Cache 60s for "Live" feel
        });

        if (!mdRes.ok) return [];
        const mdData = await mdRes.json();

        if (!mdData.matches) return [];

        // 3. Map to UI format
        return mdData.matches.map((m: any) => {
            let status: 'SCHEDULED' | 'LIVE' | 'PAUSED' | 'FINISHED' = 'SCHEDULED';
            let minute: string | number = 0;

            if (m.status === 'IN_PLAY') {
                status = 'LIVE';
                minute = "LIVE";
            } else if (m.status === 'PAUSED' || m.status === 'HALFTIME') {
                status = 'PAUSED';
                minute = 'HT';
            } else if (m.status === 'FINISHED') {
                status = 'FINISHED';
                minute = 'FT';
            } else {
                status = 'SCHEDULED';
                minute = 0;
            }

            return {
                id: m.id,
                homeTeam: m.homeTeam.name,
                awayTeam: m.awayTeam.name,
                homeScore: m.score.fullTime.home ?? m.score.halfTime.home ?? 0,
                awayScore: m.score.fullTime.away ?? m.score.halfTime.away ?? 0, // Fallback logic
                status,
                minute,
                events: [] // No events in free tier list
            };
        });

    } catch (e) {
        console.error('getLiveMatches error', e);
        return [];
    }
}

export async function getMatchDetails(matchId: number): Promise<any[]> {
    if (!API_TOKEN) return [];

    try {
        // Fetch single match details which usually includes scorers
        const res = await fetch(`${API_URL.replace(/competitions\/SA\/matches/, `matches/${matchId}`)}`, {
            headers: { 'X-Auth-Token': API_TOKEN },
            next: { revalidate: 60 }
        });

        if (!res.ok) return [];
        const data = await res.json();

        let events: any[] = [];

        // Map goals
        if (data.goals) {
            data.goals.forEach((g: any) => {
                events.push({
                    minute: g.minute,
                    type: 'GOAL',
                    playerName: g.scorer.name,
                    team: g.team.name
                });
            });
        }

        // Map bookings (if available)
        if (data.bookings) {
            data.bookings.forEach((b: any) => {
                events.push({
                    minute: b.minute,
                    type: b.card === 'RED_CARD' ? 'RED_CARD' : 'YELLOW_CARD',
                    playerName: b.player.name,
                    team: b.team.name
                });
            });
        }

        // Sort by minute
        events.sort((a, b) => a.minute - b.minute);

        return events;

    } catch (e) {
        console.error('getMatchDetails error', e);
        return [];
    }
}
