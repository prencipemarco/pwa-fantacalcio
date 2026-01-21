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
            size="sm"
            onClick={handleLogout}
            className="rounded-full border bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-500 px-4 transition-all"
        >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
        </Button>
    );
}
