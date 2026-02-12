'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
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
                setAudioUrl(settings.value);
            }

            // 3. Play Audio
            if (audioRef.current && settings?.value) {
                audioRef.current.volume = 0.5;
                audioRef.current.play().catch(e => console.log("Audio autoplay blocked", e));
            }

            // 4. Dismiss after animation
            setTimeout(() => {
                setIsVisible(false);
            }, 5000); // 5s duration
        };

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
                className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Audio Element */}
                {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

                <div className="relative w-full h-full max-w-lg mx-auto overflow-hidden flex items-center justify-center">

                    {/* Central League Logo - ROUNDED & ROTATING */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ duration: 1.2, ease: "backOut" }}
                        className="relative z-20 flex flex-col items-center justify-center"
                    >
                        <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/20 border-4 border-background">
                            <span className="text-5xl font-black text-white tracking-tighter">F</span>
                        </div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -bottom-12 text-2xl font-black tracking-tight text-foreground"
                        >
                            Fantacalcio
                        </motion.h1>
                    </motion.div>

                    {/* Orbiting Team Logos */}
                    {teams.map((team, index) => {
                        const totalTeams = teams.length;
                        const angleStep = (2 * Math.PI) / totalTeams;
                        const startAngle = index * angleStep;

                        // Radii
                        const startRadius = 350; // Off-screenish
                        const endRadius = 140; // Orbit radius

                        // Calculate keyframes for spiral effect
                        // 0% -> Start Radius
                        // 100% -> End Radius + Rotation
                        const keyframesX = [];
                        const keyframesY = [];
                        const steps = 60;
                        const rotations = 1; // Number of full spins during entry

                        for (let i = 0; i <= steps; i++) {
                            const t = i / steps; // 0 to 1
                            const currentRadius = startRadius - (t * (startRadius - endRadius)); // Linear approach
                            const currentAngle = startAngle + (t * Math.PI * 2 * rotations); // Rotate clockwise? (Increase angle)

                            // Clockwise: x = cos(angle), y = sin(angle). If angle increases, it rotates counter-clockwise.
                            // To rotate clockwise, angle should decrease OR swap cos/sin logic.
                            // Standard math: angle increases = counter-clockwise. 
                            // So let's SUBTRACT rotation to go clockwise.
                            const clockwiseAngle = startAngle - (t * Math.PI * 2 * rotations);

                            keyframesX.push(Math.cos(clockwiseAngle) * currentRadius);
                            keyframesY.push(Math.sin(clockwiseAngle) * currentRadius);
                        }

                        return (
                            <motion.div
                                key={team.id}
                                className="absolute z-10"
                                initial={{
                                    x: Math.cos(startAngle) * startRadius,
                                    y: Math.sin(startAngle) * startRadius,
                                    opacity: 0,
                                    scale: 0
                                }}
                                animate={{
                                    x: keyframesX,
                                    y: keyframesY,
                                    opacity: [0, 1, 1],
                                    scale: [0.5, 1, 1]
                                }}
                                transition={{
                                    duration: 3.5,
                                    ease: "circOut",
                                    delay: 0.2
                                }}
                            >
                                <div className="w-12 h-12 rounded-full border border-white/20 shadow-lg bg-background/80 backdrop-blur-sm overflow-hidden p-1 flex items-center justify-center">
                                    <TeamLogo
                                        teamName={team.name}
                                        logoUrl={team.logo_url}
                                        logoConfig={team.logo_config}
                                        size={40}
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
