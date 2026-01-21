'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetAllTeams } from '@/app/actions/admin';
import { Button } from '@/components/ui/button';

export function ResetTeamsButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleReset = async () => {
        if (!confirm('ARE YOU SURE? This will delete ALL teams, rosters, and lineups. This cannot be undone.')) return;

        setLoading(true);
        const res = await resetAllTeams();
        if (res.success) {
            alert('All teams reset successfully.');
            router.refresh();
        } else {
            alert('Error resetting teams: ' + res.error);
        }
        setLoading(false);
    };

    return (
        <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={handleReset}
            disabled={loading}
        >
            {loading ? 'Resetting...' : 'Reset All Teams'}
        </Button>
    );
}
