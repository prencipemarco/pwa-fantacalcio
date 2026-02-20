import { NextResponse } from 'next/server';
import {
    importPlayers, importRosters, generateCalendar,
    importVotes, calculateMatchday, resetSystem, forceImportLineupFromCSV
} from '@/app/actions/admin';
import { parsePlayerListone, parseRosterCSV, parseVotesCSV } from '@/lib/fantacalcio/parsers';
import { createClient } from '@/utils/supabase/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    try {
        console.log("Starting DB Seed...");
        const supabase = await createClient();

        // 1. Reset system (keep teams)
        console.log("Resetting system...");
        await resetSystem({ market: true, rosters: true, teams: false, calendar: true, votes: true, players: true, logs: true });

        // 2. Import Players
        console.log("Importing Listone...");
        const listonePath = path.join(process.cwd(), 'scripts/csv/listone/svincolati.csv');
        const listoneContent = fs.readFileSync(listonePath, 'utf8');
        await importPlayers(parsePlayerListone(listoneContent));

        // 3. Import Rosters
        console.log("Importing Rosters...");
        const rostersPath = path.join(process.cwd(), 'scripts/csv/squadre/rosters.csv');
        const rostersContent = fs.readFileSync(rostersPath, 'utf8');
        await importRosters(parseRosterCSV(rostersContent));

        // 4. Generate Calendar
        const { data: teams } = await supabase.from('teams').select('id, league_id, name');
        if (!teams || teams.length < 2) return NextResponse.json({ error: "Not enough teams" });

        console.log("Generating Calendar...");
        const leagueId = teams[0].league_id;
        await generateCalendar(leagueId);

        // Pre-fetch rosters for each team to build fake CSVs for lineups
        const { data: allRosters } = await supabase.from('rosters').select('team_id, player_id');
        const { data: allPlayers } = await supabase.from('players').select('id, role, name');

        const teamCSVs: Record<string, string> = {};
        for (const t of teams) {
            const teamRoster = allRosters?.filter(r => r.team_id === t.id) || [];
            let csvLines = [];
            for (const r of teamRoster) {
                const p = allPlayers?.find(pl => pl.id === r.player_id);
                if (p) {
                    csvLines.push(`${p.role};${p.name}`);
                }
            }
            teamCSVs[t.id] = csvLines.join('\n');
        }

        // 5. For 25 Matchdays
        for (let md = 1; md <= 25; md++) {
            console.log(`Processing Matchday ${md}...`);

            // a. Generate Lineups
            for (const t of teams) {
                await forceImportLineupFromCSV(t.id, md, teamCSVs[t.id]);
            }

            // b. Import Votes
            const votiPath = path.join(process.cwd(), `scripts/csv/voti/voti_${md}.csv`);
            if (fs.existsSync(votiPath)) {
                const votiContent = fs.readFileSync(votiPath, 'utf8');
                await importVotes(parseVotesCSV(votiContent), md);

                // c. Calculate Matchday
                await calculateMatchday(md);
            } else {
                console.warn(`Voti for MD ${md} missing!`);
            }
        }

        console.log("Seeding complete!");
        return NextResponse.json({ success: true, message: "25 Matchdays seeded and calculated!" });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
