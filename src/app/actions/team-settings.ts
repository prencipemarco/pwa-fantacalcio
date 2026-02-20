'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateTeamLogo(teamId: string, logoUrl: string | null, logoConfig: any | null) {
    const supabaseUser = await createClient();
    const { data: sessionData } = await supabaseUser.auth.getSession();

    if (!sessionData.session) {
        return { success: false, error: 'Non autorizzato' };
    }

    // Verify ownership
    const { data: teamCheck } = await supabaseUser
        .from('teams')
        .select('id')
        .eq('id', teamId)
        .eq('user_id', sessionData.session.user.id)
        .single();

    if (!teamCheck) {
        return { success: false, error: 'Azione non consentita.' };
    }

    // Bypass RLS to update
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
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
