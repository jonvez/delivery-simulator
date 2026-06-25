import { Outlet } from 'react-router-dom';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';

/**
 * AppShell — persistent chrome shared by every role view. Header carries the product title
 * and the role switcher; the active view renders through <Outlet/>. The system menu,
 * impersonation banner, and connection status move in during the chrome-demotion step.
 */
export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-[1800px] mx-auto px-8 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DSD Route Manager</h1>
            <p className="text-sm text-muted-foreground">
              Direct Store Delivery for convenience-store distribution
            </p>
          </div>
          <RoleSwitcher />
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-8">
        <Outlet />
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
