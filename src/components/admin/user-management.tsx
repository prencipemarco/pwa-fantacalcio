'use client';

import { useState, useMemo } from 'react';
import { UserDTO, createTeamForUser, deleteUser } from '@/app/actions/admin-users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MoreVertical, Calendar, Mail, ShieldAlert, User, CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface UserManagementProps {
    initialUsers: UserDTO[];
}

export function UserManagement({ initialUsers }: UserManagementProps) {
    const router = useRouter();
    const [users, setUsers] = useState<UserDTO[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'email'>('newest');

    // Action States
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isCreatingTeam, setIsCreatingTeam] = useState<string | null>(null);
    const [newTeamName, setNewTeamName] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Derived State
    const filteredUsers = useMemo(() => {
        let result = [...users];

        // Filter
        if (searchTerm) {
            const lowerQuery = searchTerm.toLowerCase();
            result = result.filter(u =>
                u.email.toLowerCase().includes(lowerQuery) ||
                u.id.toLowerCase().includes(lowerQuery) ||
                (u.teamName && u.teamName.toLowerCase().includes(lowerQuery))
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            if (sortOrder === 'email') return a.email.localeCompare(b.email);
            return 0;
        });

        return result;
    }, [users, searchTerm, sortOrder]);

    // Handlers
    const handleDeleteUser = async (userId: string) => {
        setActionLoading(true);
        const res = await deleteUser(userId);
        if (res.success) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            setIsDeleting(null);
        } else {
            alert('Error deleting user: ' + res.error);
        }
        setActionLoading(false);
    };

    const handleCreateTeam = async (userId: string) => {
        if (!newTeamName.trim()) return;
        setActionLoading(true);
        const res = await createTeamForUser(userId, newTeamName);
        if (res.success) {
            alert(`Team "${newTeamName}" created! Default password: "123456"`);
            // Optimistic update or reload? Let's reload to be safe or just update local
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, hasTeam: true, teamName: newTeamName } : u));
            setIsCreatingTeam(null);
            setNewTeamName('');
        } else {
            alert(res.error);
        }
        setActionLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users by email, ID, or team..."
                        className="pl-9 bg-card"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                        <SelectTrigger className="w-[180px] bg-card">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest Joined</SelectItem>
                            <SelectItem value="oldest">Oldest Joined</SelectItem>
                            <SelectItem value="email">Email (A-Z)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-50/50 border-blue-100">
                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wider">Total Users</div>
                    <div className="text-2xl font-bold text-blue-900">{users.length}</div>
                </Card>
                <Card className="p-4 bg-green-50/50 border-green-100">
                    <div className="text-xs text-green-600 font-medium uppercase tracking-wider">Active Teams</div>
                    <div className="text-2xl font-bold text-green-900">{users.filter(u => u.hasTeam).length}</div>
                </Card>
            </div>

            {/* List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredUsers.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed"
                        >
                            No users found matching your search.
                        </motion.div>
                    ) : (
                        filteredUsers.map((user) => (
                            <motion.div
                                key={user.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="group hover:shadow-md transition-all duration-200 border-border/60">
                                    <div className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">

                                        {/* Avatar */}
                                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} />
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold truncate text-foreground">{user.email}</h3>
                                                {user.hasTeam ? (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-[10px] px-1.5 h-5 flex gap-1 items-center">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 h-5 border-dashed">
                                                        No Team
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1 font-mono bg-muted/50 px-1 rounded">
                                                    ID: {user.id.substring(0, 8)}...
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Joined {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                {user.hasTeam && (
                                                    <div className="flex items-center gap-1 text-primary font-medium">
                                                        <ShieldAlert className="h-3 w-3" />
                                                        Team: {user.teamName}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="w-full md:w-auto flex justify-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                        Copy ID
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                                                        Copy Email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />

                                                    {!user.hasTeam && (
                                                        <DropdownMenuItem onClick={() => setIsCreatingTeam(user.id)}>
                                                            <Plus className="mr-2 h-4 w-4" /> Create Team
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                        onClick={() => setIsDeleting(user.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Create Team Dialog */}
            <Dialog open={!!isCreatingTeam} onOpenChange={(open) => !open && setIsCreatingTeam(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Team</DialogTitle>
                        <DialogDescription>
                            Create a new fantasy team for this user. A default password will be assigned.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Enter Team Name"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreatingTeam(null)}>Cancel</Button>
                        <Button onClick={() => isCreatingTeam && handleCreateTeam(isCreatingTeam)} disabled={actionLoading}>
                            {actionLoading ? 'Creating...' : 'Create Team'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={!!isDeleting} onOpenChange={(open) => !open && setIsDeleting(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            Delete User & Data
                        </DialogTitle>
                        <DialogDescription>
                            Are you absolutely sure? This action cannot be undone. This will permanently delete the user account, their team, match logs, and remove their data from our servers.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleting(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => isDeleting && handleDeleteUser(isDeleting)}
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Deleting...' : 'Confirm Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
