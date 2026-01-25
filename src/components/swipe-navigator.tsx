'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const ROUTES = [
    '/',
    '/team/lineup',
    '/team/market',
    '/team/results',
    '/standings'
];

export function SwipeNavigator({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const touchStart = useRef<{ x: number, y: number } | null>(null);

    // Don't enable on Admin pages
    if (pathname.startsWith('/admin')) {
        return <>{children}</>;
    }

    // Prefetch adjacent routes for instant swipe transition
    useEffect(() => {
        const currentIndex = ROUTES.indexOf(pathname);
        if (currentIndex !== -1) {
            // Prefetch Next
            if (currentIndex < ROUTES.length - 1) {
                router.prefetch(ROUTES[currentIndex + 1]);
            }
            // Prefetch Prev
            if (currentIndex > 0) {
                router.prefetch(ROUTES[currentIndex - 1]);
            }
        }
    }, [pathname, router]);

    const onTouchStart = (e: React.TouchEvent) => {
        touchStart.current = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        };
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (!touchStart.current) return;

        const touchEnd = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
        };

        const diffX = touchStart.current.x - touchEnd.x;
        const diffY = touchStart.current.y - touchEnd.y;

        // Reset
        touchStart.current = null;

        // Logic:
        // 1. Min swipe distance: 50px
        // 2. Must be horizontal: abs(diffX) > abs(diffY) * 1.5 (bias horizontal)

        if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
            const currentIndex = ROUTES.indexOf(pathname);
            if (currentIndex === -1) return; // Not a nav route

            if (diffX > 0) {
                // Swiped Left -> Next Tab
                if (currentIndex < ROUTES.length - 1) {
                    router.push(ROUTES[currentIndex + 1]);
                }
            } else {
                // Swiped Right -> Prev Tab
                if (currentIndex > 0) {
                    router.push(ROUTES[currentIndex - 1]);
                }
            }
        }
    };

    return (
        <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="min-h-screen" // Ensure it captures taps even on short pages
        >
            {children}
        </div>
    );
}
