import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetManager } from '@/components/admin/reset-manager';

export default function AdminDashboard() {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Data Import</CardTitle>
                        <CardDescription>Manage Players, Rosters, and Match Votes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/import">
                            <Button className="w-full">Go to Imports</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Match Calendar</CardTitle>
                        <CardDescription>Generate season fixtures (Berger Algorithm).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/calendar">
                            <Button className="w-full" variant="secondary">Manage Calendar</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>System Logs</CardTitle>
                        <CardDescription>View system activity and audit logs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/logs">
                            <Button className="w-full" variant="outline">View Logs</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Teams</CardTitle>
                        <CardDescription>View all enrolled teams.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/teams">
                            <Button className="w-full" variant="outline">Manage Teams</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Market Settings</CardTitle>
                        <CardDescription>Configure auction duration and rules.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/settings">
                            <Button className="w-full" variant="outline">Settings</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Destructive actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResetManager />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
