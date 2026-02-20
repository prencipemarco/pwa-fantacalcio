import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('Checking fixtures...');
    const { data: fixtures } = await supabase.from('fixtures').select('matchday, home_team_id, away_team_id');
    const matchdays = [...new Set(fixtures.map(f => f.matchday))].sort((a, b) => a - b);
    console.log('Matchdays in DB:', matchdays);

    const { data: teams } = await supabase.from('teams').select('id, name');
    console.log('Teams in DB:', teams.map(t => t.name));

    const { data: players } = await supabase.from('players').select('name');
    const dbPlayers = new Set(players.map(p => p.name.toLowerCase().trim()));

    const fs = await import('fs');
    const text = fs.readFileSync('scripts/csv/formazioni/formazioni.csv', 'utf-8');
    const lines = text.split('\n').filter(l => l.trim() !== '');

    const groups = {};
    lines.slice(1).forEach(l => {
        const parts = l.split(';');
        const key = parts[0] + '_' + parts[1].toLowerCase().trim();
        if (!groups[key]) groups[key] = [];
        groups[key].push({
            matchday: parseInt(parts[0]),
            team_name: parts[1].toLowerCase().trim(),
            player: parts[3].toLowerCase().trim()
        });
    });

    const rows = [];
    lines.slice(1).forEach(l => {
        const p = l.split(';');
        rows.push({
            matchday: parseInt(p[0]),
            team_name: p[1].toLowerCase().trim(),
            module: p[2],
            player_name: p[3].toLowerCase().trim(),
            is_starter: p[4] === '1',
            bench_order: parseInt(p[5]) || 0
        })
    });

    const { data: teamsList } = await supabase.from('teams').select('id, name');
    const { data: playersList } = await supabase.from('players').select('id, name');
    const { data: fixturesList } = await supabase.from('fixtures').select('id, matchday, home_team_id, away_team_id');

    const insertGroups = {};
    for (const r of rows) {
        const key = r.matchday + '_' + r.team_name;
        if (!insertGroups[key]) insertGroups[key] = [];
        insertGroups[key].push(r);
    }

    let importedCount = 0;
    let errorsList = [];

    for (const [key, groupRows] of Object.entries(insertGroups)) {
        try {
            const tName = groupRows[0].team_name;
            const matchday = groupRows[0].matchday;
            const module = groupRows[0].module;

            const team = teamsList.find(t => t.name.toLowerCase().trim() === tName);
            const fixture = fixturesList.find(f => f.matchday === matchday && (f.home_team_id === team.id || f.away_team_id === team.id));

            let lineupId;
            const { data: newLineup, error: lErr } = await supabase.from('lineups').insert({ team_id: team.id, fixture_id: fixture.id, module }).select('id').single();
            if (lErr) throw lErr;
            lineupId = newLineup.id;

            const playersToInsert = [];
            for (const r of groupRows) {
                const p = playersList.find(pl => pl.name.toLowerCase().trim() === r.player_name);
                playersToInsert.push({ lineup_id: lineupId, player_id: p.id, is_starter: r.is_starter, bench_order: r.bench_order });
            }

            if (playersToInsert.length > 0) {
                const { error: insErr } = await supabase.from('lineup_players').insert(playersToInsert);
                if (insErr) throw insErr;
                importedCount++;
            }
        } catch (e) {
            errorsList.push('Error on ' + key + ': ' + (e.message || e.toString()));
        }
    }

    console.log('Imported count:', importedCount);
    console.log('Errors:', errorsList.length);
    if (errorsList.length > 0) {
        console.log('First 10 errors:', errorsList.slice(0, 10));
    }
}
check();
