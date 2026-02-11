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
    'salernitana': 'salernitana', // normalized fallback
    'us sassuolo calcio': 'sassuolo',
    'u.s. sassuolo': 'sassuolo',
    'us cremonese': 'cremonese',
    'u.s. cremonese': 'cremonese',
    'frosinone calcio': 'frosinone',
    'fc empoli': 'empoli'
};

export type LogoConfig = {
    shape: 'circle' | 'square' | 'shield';
    icon: 'star' | 'shield' | 'trophy' | 'ball' | 'users' | 'crown';
    color1: string;
    color2: string;
};

// Icons as SVG path strings
const ICONS: Record<string, string> = {
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    shield: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
    trophy: "M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 8V7h2v3.82C7.84 10.4 7 9.3 7 8zm10 0c0 1.3-.84 2.4-2 2.82V7h2v1z",
    ball: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
    users: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    crown: "M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .66-.45 1.19-1.09 1.41L12 22l-5.91-1.59C5.45 20.19 5 19.66 5 19v-1h14v1z"
};

export function TeamLogo({
    teamName,
    logoUrl,
    logoConfig,
    size = 24,
    className
}: {
    teamName: string,
    logoUrl?: string | null, // Made nullable to match DB
    logoConfig?: LogoConfig | null, // Made nullable to match DB
    size?: number,
    className?: string
}) {
    const [error, setError] = useState(false);

    // 1. Custom Uploaded Image
    if (logoUrl) {
        return (
            <div className={`relative rounded-full overflow-hidden shrink-0 ${className}`} style={{ width: size, height: size }}>
                <Image
                    src={logoUrl}
                    alt={teamName}
                    fill
                    className="object-cover"
                    onError={() => setError(true)} // Fallback if URL fails
                    unoptimized // Allow external URLs
                />
            </div>
        );
    }

    // 2. Custom Preset Config
    if (logoConfig && !error) {
        const { shape, icon, color1, color2 } = logoConfig;

        // Shape styles
        let shapeClass = "rounded-full"; // circle default
        if (shape === 'square') shapeClass = "rounded-lg";
        if (shape === 'shield') shapeClass = "rounded-b-2xl rounded-t-sm";

        return (
            <div
                className={`flex items-center justify-center text-white shrink-0 shadow-sm ${shapeClass} ${className}`}
                style={{
                    width: size,
                    height: size,
                    background: `linear-gradient(135deg, ${color1}, ${color2})`,
                    boxShadow: `0 2px 4px ${color1}40`
                }}
            >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: size * 0.6, height: size * 0.6 }}>
                    <path d={ICONS[icon] || ICONS.shield} />
                </svg>
            </div>
        );
    }

    if (!teamName) return null;

    // 3. Official Serie A Team Logic (Existing)
    // Normalize team name: 'Milan' -> 'milan', 'Real Madrid' -> 'real-madrid'
    const lowerName = teamName.toLowerCase();
    const normalizedName = TEAM_NAME_MAPPING[lowerName] || lowerName.replace(/\s+/g, '-').trim();

    // Lookup extension
    const ext = TEAM_LOGOS[normalizedName];

    // If we don't know this team AND no custom config, show text fallback
    if (!ext || error) {
        return (
            <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 font-bold text-[10px] shrink-0 ${className}`} style={{ width: size, height: size }}>
                {teamName.substring(0, 1).toUpperCase()}
            </div>
        );
    }

    // Official Logo
    const src = `/teams/${normalizedName}.${ext}`;
    const isJuventus = normalizedName === 'juventus';
    const imageClass = isJuventus ? `object-contain p-[10%]` : `object-contain`;

    return (
        <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
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
