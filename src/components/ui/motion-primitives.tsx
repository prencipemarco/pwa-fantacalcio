'use client';

import { motion, AnimatePresence } from 'framer-motion';

// --- Page Transition ---
export const PageTransition = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: 'linear', duration: 0.2 }}
        className={className}
    >
        {children}
    </motion.div>
);

// --- Staggered List Wrapper ---
export const StaggerList = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <motion.div
        initial="hidden"
        animate="show"
        variants={{
            hidden: { opacity: 0 },
            show: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.1
                }
            }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

// --- Staggered Item ---
export const StaggerItem = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, scale: 0.95, y: 10 },
            show: { opacity: 1, scale: 1, y: 0 }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

// --- Tap Animation Button Wrapper ---
export const TapScale = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
    <motion.div
        whileTap={{ scale: 0.95 }}
        className={className}
        onClick={onClick}
    >
        {children}
    </motion.div>
);
