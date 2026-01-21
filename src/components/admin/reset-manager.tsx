'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { resetSystem, ResetOptions } from '@/app/actions/admin';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';

export function ResetManager() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [options, setOptions] = useState<ResetOptions>({
        market: false,
        rosters: false,
        teams: false,
        calendar: false,
        votes: false,
        players: false,
    });

    const handleCheck = (key: keyof ResetOptions, checked: boolean) => {
        let newOptions = { ...options, [key]: checked };

        // Hierarchy Logic
        if (key === 'teams' && checked) {
            // If Teams selected, Market and Rosters must be cleared usually? 
            // Actually, we can just clear them. 
            // In the backend logic, selecting 'teams' automatically clears dependent tables (trades, rosters).
            // But let's check them visually for clarity.
            newOptions.market = true;
            newOptions.rosters = true;
        }

        if (key === 'players' && checked) {
            // Players implies everything basically
            newOptions.market = true;
            newOptions.rosters = true;
            newOptions.votes = true;
            // Does it imply Teams? No, teams can exist without players, but rosters must go.
            // Does it imply Lineups? Yes (LineupPlayer refs Player).
            // Let's just select everything that strictly depends on it properly.
            // But usually "Reset Listone" implies a full reboot.
        }

        if (key === 'players' && !checked) {
            // Unchecking players
        }

        setOptions(newOptions);
    };

    const handleReset = async () => {
        if (!confirm("Are you sure? This action is irreversible.")) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await resetSystem(options);
            if (res.success) {
                setSuccess("Selected data has been reset.");
                setOptions({
                    market: false,
                    rosters: false,
                    teams: false,
                    calendar: false,
                    votes: false,
                    players: false,
                });
                setTimeout(() => setOpen(false), 2000);
            } else {
                setError(res.error || "Failed");
            }
        } catch (e) {
            setError("Unexpected error");
        }
        setLoading(false);
    };

    const isAnySelected = Object.values(options).some(Boolean);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset Data...
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Reset Data Manager
                    </DialogTitle>
                    <DialogDescription>
                        Select the data categories you want to permanently delete.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="opt-market"
                            checked={options.market}
                            onCheckedChange={(c) => handleCheck('market', c as boolean)}
                            disabled={options.teams || options.players}
                        />
                        <Label htmlFor="opt-market">Market (Auctions & Trades)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="opt-rosters"
                            checked={options.rosters}
                            onCheckedChange={(c) => handleCheck('rosters', c as boolean)}
                            disabled={options.teams || options.players}
                        />
                        <Label htmlFor="opt-rosters">Rosters (Player Ownership)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="opt-teams"
                            checked={options.teams}
                            onCheckedChange={(c) => handleCheck('teams', c as boolean)}
                        />
                        <Label htmlFor="opt-teams" className="font-bold text-red-700">Teams (Users & Credits)</Label>
                    </div>
                    <p className="text-xs text-gray-400 pl-6 -mt-3">Also clears Rosters and Market.</p>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="opt-calendar"
                            checked={options.calendar}
                            onCheckedChange={(c) => handleCheck('calendar', c as boolean)}
                        />
                        <Label htmlFor="opt-calendar">Calendar (Fixtures)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="opt-votes"
                            checked={options.votes}
                            onCheckedChange={(c) => handleCheck('votes', c as boolean)}
                            disabled={options.players}
                        />
                        <Label htmlFor="opt-votes">Match Stats (Votes)</Label>
                    </div>

                    <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                        <Checkbox
                            id="opt-players"
                            checked={options.players}
                            onCheckedChange={(c) => handleCheck('players', c as boolean)}
                        />
                        <Label htmlFor="opt-players" className="font-bold text-red-900">Listone (Players)</Label>
                    </div>
                </div>

                {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                {success && <Alert className="bg-green-50 text-green-900 border-green-200"><AlertTitle>Success</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleReset} disabled={loading || !isAnySelected}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Execute Reset
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
