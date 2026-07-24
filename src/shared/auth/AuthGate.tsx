import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { SignInScreen } from './SignInScreen';
import { migrateLocalToFirestore } from '@/lib/migrateLocalToFirestore';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [migrating, setMigrating] = React.useState(false);
  const migratedFor = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    if (migratedFor.current === user.uid) return;
    migratedFor.current = user.uid;
    setMigrating(true);
    migrateLocalToFirestore()
      .catch(() => {
        // Non-fatal: app still works, migration can retry next load.
        migratedFor.current = null;
      })
      .finally(() => setMigrating(false));
  }, [user]);

  if (loading || (user && migrating)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <SignInScreen />;

  return <>{children}</>;
}
