'use server';

import { createClient } from '@/utils/supabase/server';
import { logEvent } from './admin';

export async function createTradeProposal(
    receiverTeamId: string,
    proposerPlayerId: number,
    receiverPlayerId: number,
    creditsOffer: number // Positive: I PAY, Negative: RECEIVED (Wait, simple model: Proposer PAYS receiver)
    // Let's stick to "creditsOffer" means "I give you X credits"
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: myTeam } = await supabase.from('teams').select('id, credits_left').eq('user_id', user.id).single();
    if (!myTeam) return { success: false, error: 'Team not found' };

    if (creditsOffer > 0 && myTeam.credits_left < creditsOffer) {
        return { success: false, error: 'Not enough credits for this offer.' };
    }

    // Insert Proposal
    const { error } = await supabase.from('trade_proposals').insert({
        proposer_team_id: myTeam.id,
        receiver_team_id: receiverTeamId,
        proposer_player_id: proposerPlayerId,
        receiver_player_id: receiverPlayerId,
        credits_offer: creditsOffer,
        status: 'PENDING'
    });

    if (error) return { success: false, error: error.message };

    await logEvent('TRADE_PROPOSED', {
        from: myTeam.id,
        to: receiverTeamId,
        offer: creditsOffer
    }, user.id);

    return { success: true };
}

export async function getMyTrades() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { received: [], sent: [] };

    const { data: myTeam } = await supabase.from('teams').select('id').eq('user_id', user.id).single();
    if (!myTeam) return { received: [], sent: [] };

    // Received Proposals
    const { data: received } = await supabase
        .from('trade_proposals')
        .select(`
            *,
            proposer_team:teams!proposer_team_id(name),
            proposer_player:players!proposer_player_id(name, role),
            receiver_player:players!receiver_player_id(name, role)
        `)
        .eq('receiver_team_id', myTeam.id)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

    // Sent Proposals
    const { data: sent } = await supabase
        .from('trade_proposals')
        .select(`
            *,
            receiver_team:teams!receiver_team_id(name),
            proposer_player:players!proposer_player_id(name, role),
            receiver_player:players!receiver_player_id(name, role)
        `)
        .eq('proposer_team_id', myTeam.id)
        .order('created_at', { ascending: false });

    return { received: received || [], sent: sent || [] };
}

export async function acceptTrade(proposalId: number) {
    const supabase = await createClient();
    // Transactional logic:
    // 1. Verify proposal is PENDING
    // 2. Verify receiver credits (if offer is negative? No, assumed positive for now from proposer perspective)
    //    Actually, if offer > 0, Proposer pays Receiver. Proposer credits checked at creation. Receiver gets credits.
    //    Wait, proposer credits might have changed since creation. Need to re-check Proposer Credits.

    // FETCH PROPOSAL
    const { data: proposal } = await supabase.from('trade_proposals').select('*').eq('id', proposalId).single();
    if (!proposal || proposal.status !== 'PENDING') return { success: false, error: 'Invalid proposal' };

    // FETCH TEAMS
    const { data: proposerTeam } = await supabase.from('teams').select('credits_left').eq('id', proposal.proposer_team_id).single();
    const { data: receiverTeam } = await supabase.from('teams').select('credits_left').eq('id', proposal.receiver_team_id).single();

    if (!proposerTeam || !receiverTeam) {
        return { success: false, error: 'One of the teams involved no longer exists.' };
    }

    if (proposal.credits_offer > 0 && proposerTeam.credits_left < proposal.credits_offer) {
        return { success: false, error: 'Proposer does not have enough credits anymore.' };
    }
    // If we support negative offers (Receiver pays Proposer), check Receiver credits here.

    // EXECUTE TRADE
    // 1. Update Roster for Proposer Player -> Receiver Team
    const { error: err1 } = await supabase.from('rosters')
        .update({ team_id: proposal.receiver_team_id })
        .eq('team_id', proposal.proposer_team_id)
        .eq('player_id', proposal.proposer_player_id);

    // 2. Update Roster for Receiver Player -> Proposer Team
    const { error: err2 } = await supabase.from('rosters')
        .update({ team_id: proposal.proposer_team_id })
        .eq('team_id', proposal.receiver_team_id)
        .eq('player_id', proposal.receiver_player_id);

    if (err1 || err2) return { success: false, error: 'Error swapping players.' };

    // 3. Transfer Credits
    if (proposal.credits_offer !== 0) {
        await supabase.from('teams').update({ credits_left: proposerTeam.credits_left - proposal.credits_offer }).eq('id', proposal.proposer_team_id);
        await supabase.from('teams').update({ credits_left: receiverTeam.credits_left + proposal.credits_offer }).eq('id', proposal.receiver_team_id);
    }

    // 4. Close Proposal
    await supabase.from('trade_proposals').update({ status: 'ACCEPTED' }).eq('id', proposalId);

    // 5. Close Logs
    await logEvent('TRADE_ACCEPTED', { proposalId }, proposal.receiver_team_id);

    return { success: true };
}

export async function rejectTrade(proposalId: number) {
    const supabase = await createClient();
    await supabase.from('trade_proposals').update({ status: 'REJECTED' }).eq('id', proposalId);
    return { success: true };
}

export async function deleteTrade(proposalId: number) {
    const supabase = await createClient();
    await supabase.from('trade_proposals').delete().eq('id', proposalId);
    return { success: true };
}
