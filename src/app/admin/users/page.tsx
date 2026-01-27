import { getUsersList } from '@/app/actions/admin-users';
import { UserManagement } from '@/components/admin/user-management';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

// Force dynamic rendering to ensure fresh data on load
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const { success, users, error } = await getUsersList();

    if (!success || !users) {
        return (
            <div className="container mx-auto p-8 max-w-5xl">
                <Alert variant="destructive">
                    <ShieldX className="h-4 w-4" />
                    <AlertTitle>Error Loading Users</AlertTitle>
                    <AlertDescription>
                        {error || 'Failed to fetch user list from Supabase.'}
                        <br />
                        Please check your Service Role Key configuration.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
                <p className="text-muted-foreground mt-1">
                    Manage active users, monitor team status, and handle account administration.
                </p>
            </div>

            <UserManagement initialUsers={users} />
        </div>
    );
}
