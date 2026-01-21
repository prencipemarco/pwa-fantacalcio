'use client';

import { useEffect, useState } from 'react';
import { getAllTeams } from '@/app/actions/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { deleteTeam } from '@/app/actions/admin';

export default function AdminTeamsPage() {
    const [teams, setTeams] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        getAllTeams().then(setTeams);
    }, []);

    const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

    // Pagination logic
    const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
    const paginatedTeams = filteredTeams.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Registered Teams</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Teams Overview</CardTitle>
                    <CardDescription>View all registered teams and their status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex gap-2">
                        <Input
                            placeholder="Search team..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="max-w-sm"
                        />
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Team Name</TableHead>
                                    <TableHead>Credits</TableHead>
                                    <TableHead>Password</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead>User ID</TableHead>
                                    <TableHead className="w-[50px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedTeams.map((team) => (
                                    <TableRow key={team.id}>
                                        <TableCell className="font-bold">{team.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono text-xs">
                                                {team.credits_left}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <code className="bg-gray-100 p-1 rounded text-xs">{team.password || 'none'}</code>
                                        </TableCell>
                                        <TableCell className="text-xs text-gray-500">
                                            {team.created_at ? format(new Date(team.created_at), 'dd/MM/yyyy') : '-'}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-gray-400">
                                            {team.user_id?.split('-')[0]}...
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={async () => {
                                                    if (confirm(`Delete team "${team.name}"? This cannot be undone.`)) {
                                                        await deleteTeam(team.id);
                                                        const updated = await getAllTeams();
                                                        setTeams(updated);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {paginatedTeams.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                            No teams found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium">Page {page} of {totalPages}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
