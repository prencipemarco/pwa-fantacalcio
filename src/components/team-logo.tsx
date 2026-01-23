'use client';

import Image from 'next/image';
import { useState } from 'react';

// Map of known team logos to their file extensions.
// This prevents 404 errors by only requesting images we know exist.
const TEAM_LOGOS: Record<string, string> = {
    'atalanta': 'svg',
    'bologna': 'svg',
    'cagliari': 'svg',
    'como': 'png',
    'cremonese': 'svg',
    'fiorentina': 'svg',
    'genoa': 'svg',
    'inter': 'svg',
    'juventus': 'svg',
    'lazio': 'svg',
    'lecce': 'png',
    'milan': 'svg',
    'napoli': 'png',
    'parma': 'svg',
    'pisa': 'svg',
    'roma': 'svg',
    'sassuolo': 'svg',
    'torino': 'svg',
    'udinese': 'svg',
    'verona': 'svg',
    'hellas-verona': 'svg',
    // Add others as they are added to public/teams
};

export function TeamLogo({ teamName, size = 24, className }: { teamName: string, size?: number, className?: string }) {
    const [error, setError] = useState(false);

    // Normalize team name: 'Milan' -> 'milan', 'Real Madrid' -> 'real-madrid'
    // Also remove extra spaces
    const normalizedName = teamName.toLowerCase().replace(/\s+/g, '-').trim();

    // Lookup extension
    const ext = TEAM_LOGOS[normalizedName];

    // If we don't know this team OR if we previously errored loading it, show text
    if (!ext || error) {
        return <span className={`font-bold text-xs uppercase ${className}`}>{teamName.substring(0, 3)}</span>;
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
            unoptimized // Optional: sometimes needed specifically for SVGs depending on next.config
        />
    );
}
