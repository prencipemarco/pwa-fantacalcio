'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Shirt } from 'lucide-react';
import { TeamLogo } from './team-logo';

export function IntroSplash() {
    const [isVisible, setIsVisible] = useState(true);
    const [teams, setTeams] = useState<any[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);
    const supabase = createClient();
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            // 1. Fetch Teams for logos
            const { data: teamsData } = await supabase.from('teams').select('id, name, logo_url, logo_config');
            if (teamsData) setTeams(teamsData);

            // 2. Fetch Audio URL
            const { data: settings } = await supabase.from('app_settings').select('value').eq('key', 'intro_audio_url').single();
            if (settings?.value) {
                setAudioUrl(settings.value); // Assuming value is simply the string URL or { url: ... }
            }

            // 3. Play Audio (try/catch for browser policies)
            if (audioRef.current && settings?.value) {
                audioRef.current.volume = 0.5;
                audioRef.current.play().catch(e => console.log("Audio autoplay blocked", e));
            }

            // 4. Dismiss after animation
            setTimeout(() => {
                setIsVisible(false);
            }, 4500); // 4.5s total duration
        };

        // Check if intro has already been shown this session? 
        // For now, show every time or maybe session storage.
        const hasShown = sessionStorage.getItem('intro-shown');
        if (!hasShown) {
            init();
            sessionStorage.setItem('intro-shown', 'true');
        } else {
            setIsVisible(false);
        }

    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-background"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Audio Element */}
                {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

                <div className="relative w-full h-full max-w-md mx-auto overflow-hidden flex items-center justify-center">

                    {/* Central League Logo */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: "backOut", delay: 0.5 }}
                        className="relative z-20 flex flex-col items-center"
                    >
                        <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-2xl mb-4">
                            <span className="text-4xl font-black text-white">F</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Fantacalcio
                        </h1>
                    </motion.div>

                    {/* Orbiting Team Logos */}
                    {teams.map((team, index) => {
                        const angle = (index / teams.length) * 2 * Math.PI;
                        const radius = 140; // distance from center
                        // Randomize start delays slightly
                        const delay = 1 + (index * 0.1);

                        return (
                            <motion.div
                                key={team.id}
                                className="absolute z-10"
                                initial={{
                                    x: Math.cos(angle) * 400,
                                    y: Math.sin(angle) * 400,
                                    opacity: 0,
                                    scale: 0.5
                                }}
                                animate={{
                                    x: [Math.cos(angle) * 400, Math.cos(angle) * radius, 0], // Move in, then to center
                                    y: [Math.sin(angle) * 400, Math.sin(angle) * radius, 0],
                                    opacity: [0, 1, 0], // Fade in then out as they hit center
                                    scale: [0.5, 1, 0] // Shrink at end
                                }}
                                transition={{
                                    duration: 3,
                                    times: [0, 0.6, 1],
                                    delay: 0.2, // Start shortly after load
                                    ease: "easeInOut"
                                }}
                            >
                                <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg bg-background overflow-hidden relative">
                                    <TeamLogo
                                        teamName={team.name}
                                        logoUrl={team.logo_url}
                                        logoConfig={team.logo_config}
                                        size={48}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}

                </div>
            </motion.div>
        </AnimatePresence>
    );
}
