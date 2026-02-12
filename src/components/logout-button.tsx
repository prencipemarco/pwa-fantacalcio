'use client';

import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="rounded-full w-9 h-9 border bg-card hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-muted-foreground transition-all shadow-sm"
        >
            <LogOut className="w-4 h-4" />
        </Button>
    );
}
