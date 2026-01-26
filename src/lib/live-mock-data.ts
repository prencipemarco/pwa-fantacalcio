export type MatchEvent = {
    playerId: string; // Fanta Player ID (or name for fuzzy match)
    playerName: string;
    type: 'GOAL' | 'ASSIST' | 'YELLOW_CARD' | 'RED_CARD' | 'OWN_GOAL';
    minute: number;
};

export type LiveMatch = {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    minute: number; // 90 = FT
    status: 'LIVE' | 'FINISHED' | 'SCHEDULED';
    events: MatchEvent[];
};

// SIMULATED DATA FOR GIORNATA 22
// We will use this to "hydrate" the live view.

export const MOCK_LIVE_MATCHES: LiveMatch[] = [
    {
        id: 'm1',
        homeTeam: 'Inter',
        awayTeam: 'Milan',
        homeScore: 2,
        awayScore: 1,
        minute: 76,
        status: 'LIVE',
        events: [
            { playerId: '320', playerName: 'Lautaro Martinez', type: 'GOAL', minute: 15 },
            { playerId: '517', playerName: 'Leao', type: 'GOAL', minute: 30 },
            { playerId: '325', playerName: 'Barella', type: 'GOAL', minute: 60 },
            { playerId: '330', playerName: 'Calhanoglu', type: 'YELLOW_CARD', minute: 45 }
        ]
    },
    {
        id: 'm2',
        homeTeam: 'Juventus',
        awayTeam: 'Napoli',
        homeScore: 0,
        awayScore: 0,
        minute: 12,
        status: 'LIVE',
        events: []
    },
    {
        id: 'm3',
        homeTeam: 'Roma',
        awayTeam: 'Lazio',
        homeScore: 0,
        awayScore: 0,
        minute: 0,
        status: 'SCHEDULED',
        events: []
    }
];

// Helper to get modifier for a player
export function getLiveModifier(playerName: string): number {
    let score = 0;
    // Search in all matches
    MOCK_LIVE_MATCHES.forEach(match => {
        match.events.forEach(event => {
            if (event.playerName.toLowerCase().includes(playerName.toLowerCase())) {
                switch (event.type) {
                    case 'GOAL': score += 3; break;
                    case 'ASSIST': score += 1; break;
                    case 'YELLOW_CARD': score -= 0.5; break;
                    case 'RED_CARD': score -= 1; break;
                    case 'OWN_GOAL': score -= 2; break;
                }
            }
        });
    });
    return score;
}
