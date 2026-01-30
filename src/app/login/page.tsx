'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UserLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Log successful login
            const { data: { user } } = await supabase.auth.getUser();
            try {
                // Dynamic import to avoid potential circular/server issues during build if direct import is tricky, 
                // but direct import of server action is standard.
                const { logEvent } = await import('@/app/actions/admin');
                if (user) {
                    await logEvent('USER_LOGIN', { email }, user.id);
                }
            } catch (e) {
                console.error('Failed to log login event:', e);
            }

            router.refresh();
            router.push('/'); // Go home
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            }
        });

        if (error) {
            setError(error.message);
        } else {
            setError('Check your email for confirmation link (if verification enabled) or try logging in.');
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Fantacalcio Login</CardTitle>
                    <CardDescription>Manage your team and compete.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login">
                        <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted rounded-full">
                            <TabsTrigger value="login" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Login</TabsTrigger>
                            <TabsTrigger value="signup" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <Button type="submit" className="w-full" disabled={loading}>{loading ? '...' : 'Login'}</Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                                {error && <p className="text-green-600 text-sm">{error}</p>}
                                <Button type="submit" className="w-full" variant="outline" disabled={loading}>{loading ? '...' : 'Sign Up'}</Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
