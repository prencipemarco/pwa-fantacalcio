'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { seedTeams } from '@/app/actions/seed';
import { createClient } from '@/utils/supabase/client';
import { Loader2, TestTube2 } from 'lucide-react';

export function DevTools() {
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        if (!confirm("Generate 10 Test Teams linked to your account? (Requires empty teams table)")) return;
        setLoading(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            alert("Must be logged in.");
            setLoading(false);
            return;
        }

        const res = await seedTeams(session.user.id);
        if (res.success) {
            alert("Created 10 teams! Go to 'Manage Teams' or 'Calendar'.");
        } else {
            alert("Error: " + res.error);
        }
        setLoading(false);
    };

    return (
        <div className="mt-4">
            <Button
                onClick={handleSeed}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading}
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube2 className="mr-2 h-4 w-4" />}
                Seed 10 Test Teams
            </Button>
        </div>
    );
}
