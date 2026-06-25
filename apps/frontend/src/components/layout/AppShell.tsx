import { Outlet } from 'react-router-dom';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { SystemMenu } from '@/components/layout/SystemMenu';
import { ImpersonationBanner } from '@/components/layout/ImpersonationBanner';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * AppShell — persistent chrome shared by every role view: title + a compact health dot, the
 * role switcher, the demoted system menu, and the "acting as…" banner. The active view renders
 * through <Outlet/>; if the backend is unreachable, a single error card replaces it.
 */
export function AppShell() {
  const { data, error, refetch } = useHealthCheck();
  const connected = !!data && !error;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="max-w-[1800px] mx-auto px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full shrink-0',
                connected ? 'bg-green-500' : error ? 'bg-red-500' : 'bg-muted-foreground'
              )}
              title={connected ? 'Connected' : error ? 'Disconnected' : 'Checking…'}
              aria-label={connected ? 'Backend connected' : error ? 'Backend disconnected' : 'Checking connection'}
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">DSD Route Manager</h1>
              <p className="text-sm text-muted-foreground">
                Direct Store Delivery for convenience-store distribution
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RoleSwitcher />
            <SystemMenu />
          </div>
        </div>
        <div className="max-w-[1800px] mx-auto px-8 pb-3">
          <ImpersonationBanner />
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-8 w-full flex-1">
        {error ? (
          <Card className="border-destructive">
            <CardContent className="py-6 space-y-4">
              <p className="text-sm font-semibold text-destructive">Unable to connect to the backend</p>
              <p className="text-sm text-muted-foreground">
                {error} — make sure the backend server is running on port 3001.
              </p>
              <Button onClick={refetch} variant="outline" size="sm">
                Retry connection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Outlet />
        )}
      </main>

      <footer className="border-t mt-8">
        <div className="max-w-3xl mx-auto text-center space-y-2 px-8 py-10">
          <h2 className="text-sm font-semibold text-foreground">About this demo</h2>
          <p className="text-sm text-muted-foreground">
            DSD Route Manager is a Direct Store Delivery operations demo for convenience-store
            distribution: dispatchers schedule store stops and assign route reps, reps run their
            routes stop-by-stop (Scheduled → Assigned → En Route → Delivered), and account
            managers track per-store service health.
          </p>
          <p className="text-xs text-muted-foreground">
            Built solo with Claude Code — an AI-assisted build, reframed from a generic delivery
            app into the DSD / convenience-store domain.
          </p>
        </div>
      </footer>
    </div>
  );
}
