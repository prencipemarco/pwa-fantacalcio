'use client';

import { useEffect, useState } from 'react';
import { getAllTeams, deleteTeam, forceCloneLineup, forceImportLineupFromCSV } from '@/app/actions/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Trash2, Gavel } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

function ForceLineupDialog({ team, onUpdate }: { team: any, onUpdate: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Clone State
    const [targetMD, setTargetMD] = useState('');
    const [sourceMD, setSourceMD] = useState('');

    // CSV State
    const [csvMD, setCsvMD] = useState('');
    const [csvContent, setCsvContent] = useState('');

    const handleForceClone = async () => {
        if (!targetMD || !sourceMD) return alert('Please fill in both matchdays');

        setLoading(true);
        const res = await forceCloneLineup(team.id, parseInt(targetMD), parseInt(sourceMD));
        setLoading(false);

        if (res.success) {
            alert('Lineup cloned successfully!');
            setOpen(false);
            onUpdate();
        } else {
            alert('Error: ' + res.error);
        }
    };

    const handleForceCSV = async () => {
        if (!csvMD || !csvContent) return alert('Please fill in matchday and CSV');

        setLoading(true);
        const res = await forceImportLineupFromCSV(team.id, parseInt(csvMD), csvContent);
        setLoading(false);

        if (res.success) {
            alert('Lineup imported successfully from CSV!');
            setOpen(false);
            onUpdate();
        } else {
            alert('Error: ' + res.error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-orange-200 bg-orange-50 hover:bg-orange-100 hover:text-orange-600 dark:bg-orange-950/30 dark:border-orange-900 dark:hover:bg-orange-900">
                    <Gavel className="h-4 w-4 text-orange-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Force Lineup: {team.name}</DialogTitle>
                    <DialogDescription>
                        Manually insert a lineup for a specific matchday, bypassing the deadline.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="clone" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="clone">Clone from Old</TabsTrigger>
                        <TabsTrigger value="csv">Import CSV</TabsTrigger>
                    </TabsList>

                    <TabsContent value="clone" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Target Matchday (Where to insert)</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 22"
                                value={targetMD}
                                onChange={(e) => setTargetMD(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Source Matchday (Copy from)</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 21"
                                value={sourceMD}
                                onChange={(e) => setSourceMD(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleForceClone} disabled={loading} className="w-full">
                            {loading ? 'Cloning...' : 'Force Clone Lineup'}
                        </Button>
                    </TabsContent>

                    <TabsContent value="csv" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Target Matchday</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 22"
                                value={csvMD}
                                onChange={(e) => setCsvMD(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>CSV Content (Role;Name)</Label>
                            <Textarea
                                placeholder={`P;Sommer\nD;Acerbi\n...`}
                                value={csvContent}
                                onChange={(e) => setCsvContent(e.target.value)}
                                className="h-40 font-mono text-xs"
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: <code>Role;PlayerName</code> (One per line).<br />
                                First 11 lines will be Starters.
                            </p>
                        </div>
                        <Button onClick={handleForceCSV} disabled={loading} className="w-full">
                            {loading ? 'Importing...' : 'Import from CSV'}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminTeamsPage() {
    const [teams, setTeams] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const refresh = () => getAllTeams().then(setTeams);

    useEffect(() => {
        refresh();
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
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                                        <TableCell className="text-right flex items-center justify-end gap-2">
                                            <ForceLineupDialog team={team} onUpdate={refresh} />

                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={async () => {
                                                    if (confirm(`Delete team "${team.name}"? This cannot be undone.`)) {
                                                        await deleteTeam(team.id);
                                                        refresh();
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
                                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
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
