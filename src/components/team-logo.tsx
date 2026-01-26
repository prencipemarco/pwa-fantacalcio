'use client';

import Image from 'next/image';
import { useState } from 'react';

// Map of known team logos to their file extensions.
// Updated for Serie A 2024/25ish
const TEAM_LOGOS: Record<string, string> = {
    'atalanta': 'svg',
    'bologna': 'svg',
    'cagliari': 'svg',
    'como': 'png',
    'empoli': 'svg',
    'fiorentina': 'svg',
    'genoa': 'svg',
    'inter': 'svg',
    'juventus': 'svg',
    'lazio': 'svg',
    'lecce': 'png',
    'milan': 'svg',
    'monza': 'png',
    'napoli': 'png',
    'parma': 'svg',
    'roma': 'svg',
    'torino': 'svg',
    'udinese': 'svg',
    'venezia': 'png',
    'verona': 'svg',
    'hellas-verona': 'svg',
};

// Map Official API Names -> Key
const TEAM_NAME_MAPPING: Record<string, string> = {
    'fc internazionale milano': 'inter',
    'ac milan': 'milan',
    'juventus fc': 'juventus',
    'as roma': 'roma',
    'ss lazio': 'lazio',
    'ssc napoli': 'napoli',
    'atalanta bc': 'atalanta',
    'acf fiorentina': 'fiorentina',
    'torino fc': 'torino',
    'bologna fc 1909': 'bologna',
    'udinese calcio': 'udinese',
    'hellas verona fc': 'verona',
    'us lecce': 'lecce',
    'cagliari calcio': 'cagliari',
    'empoli fc': 'empoli',
    'genoa cfc': 'genoa',
    'ac monza': 'monza',
    'venezia fc': 'venezia',
    'parma calcio 1913': 'parma',
    'como 1907': 'como',
    'ac pisa 1909': 'pisa',
    'us salernitana 1919': 'salernitana',
    'us sassuolo calcio': 'sassuolo',
    'us cremonese': 'cremonese',
    'frosinone calcio': 'frosinone',
    'fc empoli': 'empoli'
};

export function TeamLogo({ teamName, size = 24, className }: { teamName: string, size?: number, className?: string }) {
    const [error, setError] = useState(false);

    if (!teamName) return null;

    // Normalize team name: 'Milan' -> 'milan', 'Real Madrid' -> 'real-madrid'
    // First check explicit mapping, then fallback to slug
    const lowerName = teamName.toLowerCase();
    const normalizedName = TEAM_NAME_MAPPING[lowerName] || lowerName.replace(/\s+/g, '-').trim();

    // Lookup extension
    const ext = TEAM_LOGOS[normalizedName];

    // If we don't know this team OR if we previously errored loading it, show text
    if (!ext || error) {
        // Render a basic shield placeholder or just text
        return (
            <div className={`flex items-center justify-center bg-gray-200 rounded-full text-gray-500 font-bold text-[10px] ${className}`} style={{ width: size, height: size }}>
                {teamName.substring(0, 1).toUpperCase()}
            </div>
        );
    }

    const src = `/teams/${normalizedName}.${ext}`;

    // Custom sizing/padding logic for specific logos that overflow or look too big
    const isJuventus = normalizedName === 'juventus';
    const imageClass = isJuventus ? `object-contain p-1` : `object-contain`; // Add padding to shrink Juventus

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <Image
                src={src}
                alt={teamName}
                fill
                className={imageClass}
                onError={() => setError(true)}
                unoptimized
            />
        </div>
    );
}
