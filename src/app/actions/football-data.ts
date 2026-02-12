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
    homeLogo?: string;
    awayLogo?: string;
    inProgress?: boolean;
    error?: string;
    message?: string;
};

export async function getNextSerieAMatch(): Promise<MatchData> {
    if (!API_TOKEN) {
        return { found: false, error: 'Missing API Key' };
    }

    try {
        // 1. Get current scheduled/live matches (wide window to catch current matchday)
        // We fetch matches for the current matchday essentially.
        // First, find what the "scheduled" matchday is.
        const nextRes = await fetch(`${API_URL}?status=SCHEDULED&limit=1`, {
            headers: { 'X-Auth-Token': API_TOKEN },
            next: { revalidate: 3600 }
        });

        if (!nextRes.ok) return { found: false, error: 'API Error' };
        const nextData = await nextRes.json();

        if (!nextData.matches || nextData.matches.length === 0) {
            return { found: false, message: 'No scheduled matches found' };
        }

        const targetMatchday = nextData.matches[0].matchday;

        // 2. Fetch ALL matches for this matchday
        const mdRes = await fetch(`${API_URL}?matchday=${targetMatchday}`, {
            headers: { 'X-Auth-Token': API_TOKEN },
            next: { revalidate: 60 } // Short cache to catch live status updates
        });

        if (!mdRes.ok) return { found: false, error: 'API Error (MD)' };
        const mdData = await mdRes.json();
        const matches = mdData.matches;

        if (!matches || matches.length === 0) return { found: false };

        // 3. Logic:
        // Priority 1: Any match IN_PLAY or PAUSED (Halftime)
        // Priority 2: Any match that is SCHEDULED but the time has passed (within 2.5 hours) -> Treat as likely Live (API delay)
        // Priority 3: The closest Upcoming match (SCHEDULED)

        const now = new Date();

        const liveMatch = matches.find((m: any) => {
            const isLiveStatus = m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'HALFTIME';

            // Fallback for API delay: If Scheduled AND start time is in the past (but < 150 mins ago), treat as live
            const matchTime = new Date(m.utcDate);
            const minutesSinceStart = (now.getTime() - matchTime.getTime()) / (1000 * 60);
            const isDelayedStart = m.status === 'SCHEDULED' && minutesSinceStart > 0 && minutesSinceStart < 150;

            return isLiveStatus || isDelayedStart;
        });

        if (liveMatch) {
            return {
                found: true,
                matchday: targetMatchday,
                kickoff: liveMatch.utcDate,
                home: liveMatch.homeTeam.name,
                away: liveMatch.awayTeam.name,
                homeLogo: liveMatch.homeTeam.crest,
                awayLogo: liveMatch.awayTeam.crest,
                inProgress: true
            };
        }

        // No live match, find next scheduled
        const upcomingMatches = matches.filter((m: any) => m.status === 'SCHEDULED' || m.status === 'TIMED');

        // Sort by date ascending
        upcomingMatches.sort((a: any, b: any) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

        const nextMatch = upcomingMatches[0];

        if (nextMatch) {
            return {
                found: true,
                matchday: targetMatchday,
                kickoff: nextMatch.utcDate,
                home: nextMatch.homeTeam.name,
                away: nextMatch.awayTeam.name,
                homeLogo: nextMatch.homeTeam.crest,
                awayLogo: nextMatch.awayTeam.crest,
                inProgress: false
            };
        }

        // Fallback: Default to first match of array if weird state
        return {
            found: true,
            matchday: targetMatchday,
            kickoff: matches[0].utcDate,
            home: matches[0].homeTeam.name,
            away: matches[0].awayTeam.name,
            homeLogo: matches[0].homeTeam.crest,
            awayLogo: matches[0].awayTeam.crest,
            inProgress: false
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
        return events;

    } catch (e) {
        console.error('getMatchDetails error', e);
        return [];
    }
}

export async function getSerieACalendar(): Promise<any[]> {
    if (!API_TOKEN) return [];

    try {
        const res = await fetch(`${API_URL}?season=2024`, { // Current Season
            headers: { 'X-Auth-Token': API_TOKEN },
            next: { revalidate: 3600 } // Cache 1h
        });

        if (!res.ok) return [];
        const data = await res.json();
        return data.matches || [];

    } catch (e) {
        console.error('getSerieACalendar error', e);
        return [];
    }
}
