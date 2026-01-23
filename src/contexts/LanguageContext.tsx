'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Translations = {
    [key: string]: string;
};

const translations: Record<string, Translations> = {
    en: {
        welcome: 'Welcome',
        myTeam: 'My Team',
        market: 'Market',
        results: 'Results',
        standings: 'Standings',
        adminAccess: 'Admin Access',
        beta: 'BETA v0.1',
        loginToManage: 'Login to manage your team',
        login: 'Login',
        logout: 'Logout',
        loading: 'Loading...',

        // Trades
        trades: 'Trades',
        tradeProposals: 'Trade Proposals',
        newTrade: 'New Trade',
        noTrades: 'No active trade proposals.',
        receivedProposals: 'Received Proposals',
        sentProposals: 'Sent Proposals',
        youGive: 'You Give',
        youGet: 'You Get',
        confirmTrade: 'Are you sure you want to accept this trade?',
        rejectTrade: 'Are you sure you want to reject this trade?',
        cancelTrade: 'Are you sure you want to cancel this proposal?',
        tradeAccepted: 'Trade accepted successfully!',
        tradeRejected: 'Trade rejected.',
        tradeCancelled: 'Trade cancelled.',
        success: 'Success',
        error: 'Error',
        back: 'Back',

        // Release
        releasePlayer: 'Release Player',
        releaseConfirm: 'Are you sure you want to release this player? You will recover',
        releasedSuccess: 'Player released successfully',

        // Matchday Reminder
        nextMatchday: 'Next Matchday',
        startsAt: 'Starts at',
        timeLeft: 'Time Left',
        setupApiKey: 'Setup FOOTBALL_DATA_API_KEY to see real match schedules.',
        matchday: 'Matchday',
        inProgress: 'In Progress',
        lineupsLocked: 'Lineups Locked',

        // Standings
        leagueTableDescription: 'Official league standings.',
        rank: '#',
        team: 'Team',
        pt: 'Pts',
        pg: 'P',
        v: 'W',
        n: 'D',
        l: 'L',
        gf: 'GF',
        gs: 'GA',
        tot: 'Tot',
        noGames: 'No games played yet.',
        scrollHint: 'Swipe horizontally to see all stats.'
    },
    it: {
        welcome: 'Benvenuto',
        myTeam: 'La Mia Rosa',
        market: 'Mercato',
        results: 'Risultati',
        standings: 'Classifica',
        adminAccess: 'Accesso Admin',
        beta: 'BETA v0.1',
        loginToManage: 'Accedi per gestire la tua squadra',
        login: 'Accedi',
        logout: 'Esci',
        loading: 'Caricamento...',

        // Trades
        trades: 'Scambi',
        tradeProposals: 'Proposte di Scambio',
        newTrade: 'Nuovo Scambio',
        noTrades: 'Nessuna proposta di scambio attiva.',
        receivedProposals: 'Proposte Ricevute',
        sentProposals: 'Proposte Inviate',
        youGive: 'Cedi',
        youGet: 'Ricevi',
        confirmTrade: 'Sei sicuro di voler accettare questo scambio?',
        rejectTrade: 'Sei sicuro di voler rifiutare questo scambio?',
        cancelTrade: 'Sei sicuro di voler cancellare questa proposta?',
        tradeAccepted: 'Scambio accettato con successo!',
        tradeRejected: 'Scambio rifiutato.',
        tradeCancelled: 'Scambio cancellato.',
        success: 'Accetta',
        error: 'Rifiuta',
        back: 'Indietro',

        // Release
        releasePlayer: 'Taglia Giocatore',
        releaseConfirm: 'Sei sicuro di voler tagliare questo giocatore? Recupererai',
        releasedSuccess: 'Giocatore tagliato con successo',

        // Matchday Reminder
        nextMatchday: 'Prossima Giornata',
        startsAt: 'Inizio',
        timeLeft: 'Mancano',
        setupApiKey: 'Configura FOOTBALL_DATA_API_KEY per vedere gli orari reali.',
        matchday: 'Giornata',
        inProgress: 'in Corso',
        lineupsLocked: 'Formazioni Chiuse',

        // Standings
        leagueTableDescription: 'La classifica ufficiale del campionato.',
        rank: '#',
        team: 'Squadra',
        pt: 'PT',
        pg: 'PG',
        v: 'V',
        n: 'N',
        l: 'P',
        gf: 'GF',
        gs: 'GS',
        tot: 'Tot',
        noGames: 'Nessuna partita giocata ancora.',
        scrollHint: 'Scorri orizzontalmente per vedere tutte le statistiche.'
    }
};

const LanguageContext = createContext<{ language: string; setLanguage: (lang: string) => void; t: (key: string) => string }>({
    language: 'it',
    setLanguage: () => { },
    t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState('it'); // Default IT

    useEffect(() => {
        const saved = localStorage.getItem('language');
        if (saved) setLanguage(saved);
    }, []);

    const updateLanguage = (lang: string) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
