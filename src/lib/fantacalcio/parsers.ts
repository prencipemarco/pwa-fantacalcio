export type PlayerImport = {
    id: number;
    name: string;
    role: 'P' | 'D' | 'C' | 'A';
    team_real: string;
    quotation: number;
};

export type RosterImport = {
    team_name: string;
    player_name: string;
    price: number;
};

export type VoteImport = {
    player_id: number;
    vote: number;
    goals_for: number;
    goals_against: number;
    assists: number;
    yellow_cards: number;
    red_cards: number;
    penalties_saved: number;
    penalties_missed: number;
    own_goals: number;
};

export type LineupImportRow = {
    matchday: number;
    team_name: string;
    module: string;
    player_name: string;
    is_starter: boolean;
    bench_order: number;
};

function parseCSVLine(line: string, delimiter: string = ';'): string[] {
    // Simple split, can be enhanced for quoted values if needed
    return line.split(delimiter).map(s => s.trim().replace(/^"|"$/g, ''));
}

export function parsePlayerListone(csvContent: string): PlayerImport[] {
    const lines = csvContent.split(/\r?\n/).filter(l => l.trim() !== '');
    const players: PlayerImport[] = [];

    // Try to detect header or just assume standard format if consistent
    // Format: Id, Ruolo, Nome, Squadra, Quotazione...
    // Usually Fantacalcio.it listone: Cod., Ruolo, Nome, Squadra, Quotazione

    let startIndex = 0;
    // Skip potential header
    if (lines[0].toLowerCase().includes('ruolo')) startIndex = 1;

    for (let i = startIndex; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i], ','); // Standard listone often comma or semicolon

        // Fallback if split failed (try semicolon)
        const colsSemi = parseCSVLine(lines[i], ';');
        const activeCols = cols.length > colsSemi.length ? cols : colsSemi;

        if (activeCols.length < 5) continue;

        const id = parseInt(activeCols[0]);
        const role = activeCols[1].toUpperCase() as 'P' | 'D' | 'C' | 'A'; // Ruolo
        const name = activeCols[2]; // Nome
        const team_real = activeCols[3]; // Squadra
        const quotation = parseInt(activeCols[4]); // Quotazione

        if (!isNaN(id) && ['P', 'D', 'C', 'A'].includes(role)) {
            players.push({ id, role, name, team_real, quotation });
        }
    }
    return players;
}

export function parseRosterCSV(csvContent: string): RosterImport[] {
    const lines = csvContent.split(/\r?\n/).filter(l => l.trim() !== '');
    const rosters: RosterImport[] = [];

    // Expected: Team Name, Player Name, Price

    for (const line of lines) {
        const cols = parseCSVLine(line, ',');
        const colsSemi = parseCSVLine(line, ';');
        const activeCols = cols.length > colsSemi.length ? cols : colsSemi;

        if (activeCols.length < 3) continue;

        // Heuristic: If header
        if (activeCols[0].toLowerCase().includes('team')) continue;

        rosters.push({
            team_name: activeCols[0],
            player_name: activeCols[1],
            price: parseInt(activeCols[2]) || 1
        });
    }
    return rosters;
}

export function parseVotesCSV(csvContent: string): VoteImport[] {
    const lines = csvContent.split(/\r?\n/);
    const votes: VoteImport[] = [];

    // Metadata usually in first few lines. Header usually starts with "Cod."
    let headerFound = false;

    for (const line of lines) {
        if (!line.trim()) continue;

        const cols = parseCSVLine(line, ';'); // Votes usually semicolon
        const colsComma = parseCSVLine(line, ',');
        const activeCols = cols.length > colsComma.length ? cols : colsComma;

        // Check for header
        if (!headerFound) {
            if (activeCols.some(c => c.toLowerCase() === 'cod.' || c.toLowerCase() === 'id')) {
                headerFound = true;
            }
            continue;
        }

        if (activeCols.length < 10) continue;

        // Structure usually: Cod., Ruolo, Nome, Voto, Gf, Gs, Rp, Rs, Rf, Au, Amm, Esp
        // Map carefully based on standard Fantacalcio.it export
        // 0: Cod, 1: Ruolo, 2: Nome, 3: Voto, 4: Gf, 5: Gs, 6: Rp (Rigori Parati), 7: Rs (Rigori Sbagliati), 8: Rf (Rigori Falliti?), 9: Au (Autogoal), 10: Amm, 11: Esp

        // Note: Voto can be '6', '6.5', '6,5' (comma decimal)
        const normalizeFloat = (val: string) => parseFloat(val.replace(',', '.'));

        const id = parseInt(activeCols[0]);
        const rawVoteStr = activeCols[3];

        // Handle "S.V." or "-"
        if (isNaN(id) || !rawVoteStr || rawVoteStr.toUpperCase().includes('S.V')) continue;

        const vote = normalizeFloat(rawVoteStr);

        // Gf: 4, Gs: 5
        const gf = parseInt(activeCols[4]) || 0;
        const gs = parseInt(activeCols[5]) || 0;
        const rp = parseInt(activeCols[6]) || 0; // Rigori parati
        const rs = parseInt(activeCols[7]) || 0; // Rigori sbagliati
        // autogoal usually around col 9
        const au = parseInt(activeCols[9]) || 0;
        const amm = parseInt(activeCols[10]) || 0;
        const esp = parseInt(activeCols[11]) || 0;
        const ass = parseInt(activeCols[12]) || 0; // Verify standard position of assist, often vary. Assuming 12 for now or default 0.

        votes.push({
            player_id: id,
            vote,
            goals_for: gf,
            goals_against: gs,
            assists: ass, // Might need adjustment based on specific CSV
            yellow_cards: amm,
            red_cards: esp,
            penalties_saved: rp,
            penalties_missed: rs,
            own_goals: au
        });
    }
    return votes;
}

export function parseLineupCSV(csvContent: string): LineupImportRow[] {
    const lines = csvContent.split(/\r?\n/).filter(l => l.trim() !== '');
    const rows: LineupImportRow[] = [];

    // Expected: Giornata; Squadra; Modulo; Giocatore; Titolare; PanchinaOrdine
    // Skip header if present
    let startIndex = 0;
    if (lines[0].toLowerCase().includes('giornata') || lines[0].toLowerCase().includes('squadra')) {
        startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i], ';');
        const colsComma = parseCSVLine(lines[i], ',');
        const activeCols = cols.length > colsComma.length ? cols : colsComma;

        if (activeCols.length < 6) continue;

        const matchday = parseInt(activeCols[0]);
        const team_name = activeCols[1];
        const module = activeCols[2];
        const player_name = activeCols[3];

        // Titolare can be "SI", "NO", "TRUE", "FALSE", "1", "0"
        const isStarterStr = activeCols[4].toUpperCase();
        const is_starter = isStarterStr === 'SI' || isStarterStr === 'TRUE' || isStarterStr === '1' || isStarterStr === 'YES';

        const bench_order = parseInt(activeCols[5]) || 0;

        if (!isNaN(matchday) && team_name && player_name) {
            rows.push({
                matchday,
                team_name,
                module,
                player_name,
                is_starter,
                bench_order
            });
        }
    }
    return rows;
}
