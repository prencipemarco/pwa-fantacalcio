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
    'empoli': 'svg', // Added
    'fiorentina': 'svg',
    'genoa': 'svg',
    'inter': 'svg',
    'juventus': 'svg',
    'lazio': 'svg',
    'lecce': 'png', // or svg? usually png in my assets
    'milan': 'svg',
    'monza': 'png', // Added
    'napoli': 'png',
    'parma': 'svg',
    'roma': 'svg', // removed Pisa/Cremonese if not in Serie A, but keeping doesn't hurt.
    'torino': 'svg',
    'udinese': 'svg',
    'venezia': 'png', // Added
    'verona': 'svg',
    'hellas-verona': 'svg',
};

export function TeamLogo({ teamName, size = 24, className }: { teamName: string, size?: number, className?: string }) {
    const [error, setError] = useState(false);

    if (!teamName) return null;

    // Normalize team name: 'Milan' -> 'milan', 'Real Madrid' -> 'real-madrid'
    const normalizedName = teamName.toLowerCase().replace(/\s+/g, '-').trim();

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

    return (
        <Image
            src={src}
            alt={teamName}
            width={size}
            height={size}
            className={`object-contain ${className}`}
            onError={() => setError(true)}
            unoptimized
        />
    );
}
