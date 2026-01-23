'use client';

import { useState, useEffect } from 'react';
import { getUsersList, createTeamForUser, UserDTO } from '@/app/actions/admin-users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminUsersPage() {
    const { t } = useLanguage();
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [teamName, setTeamName] = useState('');
    const [creating, setCreating] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        const res = await getUsersList();
        if (res.success && res.users) {
            setUsers(res.users);
        } else {
            setError(res.error || 'Failed to load users');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleCreateTeam = async (userId: string) => {
        if (!teamName) return;
        setCreating(true);
        const res = await createTeamForUser(userId, teamName);
        if (res.success) {
            alert('Team created! Password: "123456"');
            setTeamName('');
            setSelectedUser(null);
            loadUsers();
        } else {
            alert(res.error);
        }
        setCreating(false);
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">User Management</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
                    <strong>Error:</strong> {error}
                    <p className="text-sm mt-1">Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env</p>
                </div>
            )}

            {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}

            <div className="space-y-4">
                {!loading && users.map(user => (
                    <Card key={user.id} className="flex justify-between items-center p-4">
                        <div>
                            <div className="font-bold">{user.email}</div>
                            <div className="text-xs text-gray-500 font-mono">{user.id}</div>
                            <div className="text-xs text-gray-400">Joined: {new Date(user.created_at).toLocaleDateString()}</div>
                        </div>

                        <div>
                            {user.hasTeam ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Team: {user.teamName}
                                </Badge>
                            ) : (
                                <div>
                                    {selectedUser === user.id ? (
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                placeholder="Team Name"
                                                value={teamName}
                                                onChange={e => setTeamName(e.target.value)}
                                                className="w-40 h-8"
                                            />
                                            <Button size="sm" onClick={() => handleCreateTeam(user.id)} disabled={creating}>
                                                Save
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => setSelectedUser(null)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button size="sm" onClick={() => { setSelectedUser(user.id); setTeamName(''); }}>
                                            Create Team
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
