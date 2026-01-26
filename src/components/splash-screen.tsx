'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Hide splash screen after 2.5 seconds to allow animations to play out
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2200);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                >
                    {/* Main Container */}
                    <div className="flex flex-col items-center justify-center relative">

                        {/* Background Elements */}
                        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full scale-150 animate-pulse" />

                        {/* Logo Container */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{
                                duration: 0.8,
                                ease: [0, 0.71, 0.2, 1.01],
                                scale: {
                                    type: "spring",
                                    damping: 8,
                                    stiffness: 100,
                                    restDelta: 0.001
                                }
                            }}
                            className="relative z-10 mb-8"
                        >
                            {/* Requested Logo Style - Scaled Up */}
                            <div className="h-28 w-28 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-blue-500/30 shadow-2xl skew-y-0">
                                <span className="text-white font-black text-6xl tracking-tighter drop-shadow-md">F</span>
                            </div>

                            {/* Decorative Ring */}
                            <motion.div
                                className="absolute -inset-4 border-2 border-blue-500/20 rounded-[2rem]"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 1 }}
                            />
                        </motion.div>

                        {/* Text Content */}
                        <div className="text-center z-10 space-y-3">
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="text-4xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400"
                            >
                                Fantacalcio
                            </motion.h1>

                            {/*<motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                                className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em]"
                            >
                                Progressive Web App
                            </motion.p>*/}
                        </div>

                        {/* Loading Indicator */}
                        <motion.div
                            className="absolute bottom-[-80px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="flex gap-2">
                                <motion.div
                                    className="w-2.5 h-2.5 bg-blue-600 rounded-full"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                />
                                <motion.div
                                    className="w-2.5 h-2.5 bg-purple-600 rounded-full"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                />
                                <motion.div
                                    className="w-2.5 h-2.5 bg-indigo-600 rounded-full"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
