'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // Hardcoded check as requested
    if (username === 'admin' && password === '1234') {
        // Set cookie
        // In production, use a signed token (JWT)
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        });

        redirect('/admin');
    } else {
        return { error: 'Invalid credentials' };
    }
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/admin/login');
}
