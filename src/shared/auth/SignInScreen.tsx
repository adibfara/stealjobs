import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner';

export function SignInScreen() {
  const { signIn } = useAuth();
  const [busy, setBusy] = React.useState(false);

  async function handleSignIn() {
    setBusy(true);
    try {
      await signIn();
    } catch (e) {
      toast.error('Sign-in failed', {
        description: e instanceof Error ? e.message : 'Please try again.',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Steal Jobs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Build resumes, cover letters and experiences, perfected for your next job
        </p>
      </div>
      <Button onClick={handleSignIn} disabled={busy} size="lg">
        {busy ? 'Signing in…' : 'Sign in with Google'}
      </Button>
    </div>
  );
}
