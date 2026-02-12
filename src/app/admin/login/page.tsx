'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom'; // Still in react-dom for now? Or React? Next.js might alias. Let's try 'react-dom' first or 'react'. Docs say 'react-dom' for useFormStatus in 19 canary sometimes still? Actually let's try 'react' for both based on error message hints usually seen, but standard is 'react-dom' for form status in 18, moved to 'react' in 19. Let's try 'react' for useActionState and check if useFormStatus is also there.
// Actually, the error specifically designated useFormState -> useActionState.
// Let's assume useFormStatus is still in react-dom or safe to import.
// UPDATE: useActionState is in 'react'. useFormStatus is in 'react-dom' in 18, 'react' in 19. If this is 19 (which useActionState implies), likely both in 'react'.
// However, to be safe with Next.js specific builds, let's look at the error again.
// Error said: "ReactDOM.useFormState has been renamed to React.useActionState".
// It didn't mention useFormStatus.
// Let's try importing useActionState from 'react'.

import { loginAdmin } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const initialState = {
    error: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Logging in...' : 'Login'}
        </Button>
    );
}

export default function LoginPage() {
    // useActionState returns [state, action, isPending]
    const [state, formAction, isPending] = useActionState(loginAdmin, initialState);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Admin Access</CardTitle>
                    <CardDescription>
                        Enter your credentials to manage the league.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="grid gap-8">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" type="text" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
