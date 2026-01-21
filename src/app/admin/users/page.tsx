'use client';

import { useState, useEffect } from 'react';
import { getUsers, deleteUser } from '@/app/actions/user-mgmt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UsersPage() {
    const { t } = useLanguage();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This deletes the user profile (but not Auth account unless via Supabase Dashboard).')) return;

        const res = await deleteUser(id);
        if (res.success) {
            loadUsers();
        } else {
            alert('Failed to delete: ' + res.error);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">{t('userManagement')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">{t('created')}</th>
                                    <th className="px-4 py-3">{t('teams')}</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b hover:bg-gray-50 border-gray-100">
                                        <td className="px-4 py-3 font-medium">{u.email}</td>
                                        <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            {u.teams && u.teams.length > 0 ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                                    {u.teams[0].name}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-400">No Team</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(u.id)}
                                                className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500">No users found (Check database sync).</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
