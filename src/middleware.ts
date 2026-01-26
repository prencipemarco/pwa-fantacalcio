import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
    // 1. Refresh Session & Get User
    const { user, response } = await updateSession(request);

    // 2. Define Routes
    const path = request.nextUrl.pathname;
    const isAdminRoute = path.startsWith('/admin');
    const isLoginRoute = path === '/login';
    const isAdminLoginRoute = path === '/admin/login';

    // Public Assets / API ignored (handled by matcher config usually, but good to be safe)
    if (path.startsWith('/_next') || path.startsWith('/static') || path.includes('.')) {
        return response;
    }

    // 3. User Protection (App)
    // If NOT logged in, and trying to access protected pages (/, /team/*, /standings, /results)
    // Exclude /login, /admin (handled separately)
    if (!user && !isLoginRoute && !isAdminRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If logged in and on /login, redirect to home
    if (user && isLoginRoute) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 4. Admin Protection (Existing Logic, enhanced)
    if (isAdminRoute && !isAdminLoginRoute) {
        const adminSession = request.cookies.get('admin_session');
        if (!adminSession) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
