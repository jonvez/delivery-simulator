import { useLocation } from 'react-router-dom';
import { useDrivers } from '@/hooks/useDrivers';

/**
 * ImpersonationBanner — persistent "acting as…" indicator. There's no auth, so this keeps it
 * transparent which role (and which rep) the current view represents. Derived from the URL.
 */
export function ImpersonationBanner() {
  const { pathname } = useLocation();
  const { drivers } = useDrivers();

  let role = 'Dispatcher';
  let repId: string | null = null;

  if (pathname.startsWith('/accounts')) {
    role = 'Account Manager';
  } else if (pathname.startsWith('/route')) {
    role = 'Route Sales Rep';
    const match = pathname.match(/^\/route\/([^/]+)/);
    repId = match ? match[1] : null;
  }

  const rep = repId ? drivers.find((d) => d.id === repId) : null;
  const detail = role === 'Route Sales Rep' && rep ? ` — ${rep.name}` : '';

  return (
    <p className="text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
        Acting as <span className="font-medium text-foreground">{role}{detail}</span>
      </span>
    </p>
  );
}
