'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateTeamLogo(teamId: string, logoUrl: string | null, logoConfig: any | null) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('teams')
        .update({
            logo_url: logoUrl,
            logo_config: logoConfig
        })
        .eq('id', teamId);

    if (error) {
        console.error('Error updating team logo:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/team/results');
    return { success: true };
}
