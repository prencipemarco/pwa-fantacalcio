'use client';

import { useEffect, useState } from 'react';
import { getLogs } from '@/app/actions/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        getLogs().then(setLogs);
    }, []);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">System Logs</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Audit log of all major actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>User ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="whitespace-nowrap font-medium text-gray-500 text-xs">
                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{log.action}</Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate text-xs font-mono">
                                        {JSON.stringify(log.details)}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-400 font-mono">
                                        {log.user_id?.split('-')[0]}...
                                    </TableCell>
                                </TableRow>
                            ))}
                            {logs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No logs found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
