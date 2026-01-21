'use server';

import { createClient } from '@/utils/supabase/server';
import { logEvent } from './admin';
import { addMinutes, isAfter, isBefore, addSeconds, setHours, startOfDay, endOfDay } from 'date-fns';

// --- SETTINGS HELPERS ---
async function getSettings() {
    const supabase = await createClient();
    const { data } = await supabase.from('settings').select('*');
    const settings: any = {};
    data?.forEach(s => settings[s.key] = s.value);
    return settings;
}

export async function updateSetting(key: string, value: string) {
    const supabase = await createClient();
    await supabase.from('settings').upsert({ key, value });
    return { success: true };
}

// --- AUCTION ACTIONS ---

export async function createAuction(playerId: number, startPrice: number) {
    const supabase = await createClient();
    const settings = await getSettings();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    // 1. Check Time Window
    const now = new Date();
    const openHour = parseInt(settings.market_open_hour || '8');
    const closeHour = parseInt(settings.market_close_hour || '22');
    const currentHour = now.getHours();

    if (currentHour < openHour || currentHour >= closeHour) {
        return { success: false, error: `Market is closed. Open from ${openHour}:00 to ${closeHour}:00.` };
    }

    // 2. Check Player Availability (Not in Roster, Not in Active Auction)
    const { data: existingRoster } = await supabase.from('rosters').select('id').eq('player_id', playerId).single();
    if (existingRoster) return { success: false, error: 'Player already owned.' };

    const { data: activeAuction } = await supabase.from('auctions').select('id').eq('player_id', playerId).eq('status', 'OPEN').single();
    if (activeAuction) return { success: false, error: 'Auction already active for this player.' };

    // 3. Create Auction
    const durationHours = parseInt(settings.auction_duration_hours || '24');
    const endTime = addMinutes(now, durationHours * 60);

    const { error } = await supabase.from('auctions').insert({
        player_id: playerId,
        current_price: startPrice,
        end_time: endTime.toISOString(),
        status: 'OPEN'
    });

    if (error) return { success: false, error: error.message };

    await logEvent('AUCTION_STARTED', { playerId, startPrice }, user.id);
    return { success: true };
}

export async function placeBid(auctionId: number, bidAmount: number) {
    const supabase = await createClient();
    const settings = await getSettings();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // 1. Fetch Auction & Team
    const { data: auction } = await supabase.from('auctions').select('*').eq('id', auctionId).single();
    if (!auction || auction.status !== 'OPEN') return { success: false, error: 'Auction unavailable.' };

    const { data: myTeam } = await supabase.from('teams').select('id, credits_left').eq('user_id', user.id).single();
    if (!myTeam) return { success: false, error: 'Team not found.' };

    if (new Date() > new Date(auction.end_time)) {
        await resolveAuction(auctionId); // Lazy close
        return { success: false, error: 'Auction ended.' };
    }

    // 2. Validate Bid
    if (bidAmount <= auction.current_price) return { success: false, error: 'Bid must be higher than current price.' };
    if (myTeam.credits_left < bidAmount) return { success: false, error: 'Not enough credits.' };

    // 3. Update Auction (Snippet Logic)
    let newEndTime = new Date(auction.end_time);
    const snippetThreshold = parseInt(settings.snippet_threshold_seconds || '30');
    const snippetExtension = parseInt(settings.snippet_extension_minutes || '2');

    const secondsLeft = (newEndTime.getTime() - new Date().getTime()) / 1000;
    if (secondsLeft < snippetThreshold) {
        newEndTime = addMinutes(newEndTime, snippetExtension);
    }

    // 4. Refund Previous Winner (Logic: Credits were deducted? Let's assume we DEDUCT on bid)
    // If we deduct on bid, we must refund the previous winner.
    if (auction.current_winner_team_id) {
        const { data: prevWinner } = await supabase.from('teams').select('credits_left').eq('id', auction.current_winner_team_id).single();
        if (prevWinner) {
            await supabase.from('teams').update({ credits_left: prevWinner.credits_left + auction.current_price }).eq('id', auction.current_winner_team_id);
        }
    }

    // 5. Deduct Filters from Current Bidder
    await supabase.from('teams').update({ credits_left: myTeam.credits_left - bidAmount }).eq('id', myTeam.id);

    // 6. Update Auction Record
    const { error } = await supabase.from('auctions').update({
        current_price: bidAmount,
        current_winner_team_id: myTeam.id,
        end_time: newEndTime.toISOString()
    }).eq('id', auctionId);

    if (error) return { success: false, error: error.message };

    return { success: true };
}

export async function resolveAuction(auctionId: number) {
    const supabase = await createClient();
    const { data: auction } = await supabase.from('auctions').select('*').eq('id', auctionId).single();

    if (!auction || auction.status !== 'OPEN') return { success: false };

    // Check if time passed
    if (new Date() < new Date(auction.end_time)) return { success: false, error: 'Auction still open.' };

    // Assign Player if winner exists
    if (auction.current_winner_team_id) {
        await supabase.from('rosters').insert({
            team_id: auction.current_winner_team_id,
            player_id: auction.player_id,
            purchase_price: auction.current_price
        });
        await logEvent('AUCTION_WON', { auctionId, teamId: auction.current_winner_team_id, price: auction.current_price });
    } else {
        // No bids? Auction expires.
        await logEvent('AUCTION_EXPIRED', { auctionId });
    }

    await supabase.from('auctions').update({ status: 'CLOSED' }).eq('id', auctionId);
    return { success: true };
}

export async function getActiveAuctions() {
    const supabase = await createClient();
    const { data } = await supabase.from('auctions')
        .select('*, player:players(*), winner:teams!current_winner_team_id(name)')
        .eq('status', 'OPEN')
        .order('end_time', { ascending: true });

    return data || [];
}
