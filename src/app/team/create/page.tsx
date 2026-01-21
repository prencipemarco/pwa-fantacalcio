'use client';

import { useState } from 'react';
import { createTeam } from '@/app/actions/user';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function CreateTeamPage() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await createTeam(name, password);
            if (res.success) {
                // Redirect to market to buy players
                router.push('/team/market');
            } else {
                setError(res.error || 'Failed to create team');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-md mt-10">
            <Card>
                <CardHeader>
                    <CardTitle>Create Your Team</CardTitle>
                    <CardDescription>Start your Fantacalcio journey.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Team Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Real Madrid"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Team Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Security for your team"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Team'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
