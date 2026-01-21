export type PlayerPerformance = {
    role: 'P' | 'D' | 'C' | 'A';
    vote: number;
    goalsFor: number;
    goalsAgainst: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    penaltiesSaved: number;
    penaltiesMissed: number;
    ownGoals: number;
};

export type MatchResult = {
    fantaPoints: number;
    goals: number;
    defenseModifier: number;
    breakdown: {
        rawVotes: number;
        bonusMalus: number;
    };
};

export const SCORING_RULES = {
    GOAL_SCORED: 3,
    PENALTY_SAVED: 3,
    ASSIST: 1,
    YELLOW_CARD: -0.5,
    RED_CARD: -1,
    OWN_GOAL: -2,
    PENALTY_MISSED: -3,
    GOAL_CONCEDED: -1,
};

export function calculateMagicPoints(player: PlayerPerformance): number {
    let points = player.vote;

    points += player.goalsFor * SCORING_RULES.GOAL_SCORED;
    points += player.penaltiesSaved * SCORING_RULES.PENALTY_SAVED;
    points += player.assists * SCORING_RULES.ASSIST;
    points += player.yellowCards * SCORING_RULES.YELLOW_CARD;
    points += player.redCards * SCORING_RULES.RED_CARD;
    points += player.ownGoals * SCORING_RULES.OWN_GOAL;
    points += player.penaltiesMissed * SCORING_RULES.PENALTY_MISSED;
    points += player.goalsAgainst * SCORING_RULES.GOAL_CONCEDED;

    return points;
}

export function calculateDefenseModifier(starters: PlayerPerformance[]): number {
    const goalkeeper = starters.find((p) => p.role === 'P');
    const defenders = starters.filter((p) => p.role === 'D' && p.vote > 0); // Only voted defenders count

    // Condition: Minimum 4 Defenders deployed
    // Note: The rule usually applies to the number of defenders *playing*, not just in lineup.
    // Assuming 'starters' passed here are those who actually played (got a vote).
    if (!goalkeeper || defenders.length < 4 || goalkeeper.vote === 0) {
        return 0;
    }

    // Top 3 Defenders
    const top3Defenders = defenders.sort((a, b) => b.vote - a.vote).slice(0, 3);

    // If we have less than 3 valid defenders (even if we started with 4+, e.g. 2 got S.V.), mod is usually 0 or restricted.
    // Standard rule: average of GK + 3 best defenders. usage requires at least 4 playing defenders to activate?
    // User prompt: "Condition: Minimum 4 Defenders deployed (Starters with vote)."
    if (defenders.length < 4) return 0;

    const sumVotes = goalkeeper.vote + top3Defenders.reduce((sum, p) => sum + p.vote, 0);
    const average = sumVotes / (1 + top3Defenders.length); // Should be 4 usually

    if (average >= 7.00) return 6;
    if (average >= 6.50) return 3;
    if (average >= 6.00) return 1;
    return 0;
}

export function calculateTeamTotal(teamPlayers: PlayerPerformance[]): MatchResult {
    // 1. Calculate base points (Votes + Bonus/Malus) for all players
    let rawVotes = 0;
    let bonusMalus = 0;

    teamPlayers.forEach((p) => {
        rawVotes += p.vote;
        const mp = calculateMagicPoints(p);
        bonusMalus += (mp - p.vote);
    });

    // 2. Defense Modifier
    const defenseModifier = calculateDefenseModifier(teamPlayers);

    const fantaPoints = rawVotes + bonusMalus + defenseModifier;

    // 3. Convert to Goals
    let goals = 0;
    if (fantaPoints < 66) {
        goals = 0;
    } else {
        // 66 -> 1 goal
        // 72 -> 2 goals (every 6 or 4 points? Prompt says "1 Goal for every 4 points interval after 66")
        // 66 to 69.5: 1 Goal
        // 70 is start of next band? No, 66 + 4 is 70.
        // 66 <= p < 70 : 1 goal
        // 70 <= p < 74 : 2 goals
        // etc.
        // Formula: floor((points - 66) / 4) + 1

        const excess = fantaPoints - 66;
        goals = Math.floor(excess / 4) + 1;
    }

    return {
        fantaPoints,
        goals,
        defenseModifier,
        breakdown: {
            rawVotes,
            bonusMalus,
        },
    };
}
