import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * The three DSD operator roles, each mapped to a base route. There is no auth — this is a
 * loose, client-side "acting as…" switcher. The URL is the source of truth for the active
 * role, so the control is purely presentational.
 */
export const ROLES = [
  { label: 'Dispatcher', path: '/dispatch' },
  { label: 'Route Sales Rep', path: '/route' },
  { label: 'Account Manager', path: '/accounts' },
] as const;

export function isRoleActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(path + '/');
}

export function RoleSwitcher() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div
      role="tablist"
      aria-label="Active role"
      data-tour="role-switcher"
      data-testid="role-switcher"
      className="inline-flex items-center gap-1 rounded-lg border bg-muted/40 p-1"
    >
      {ROLES.map((role) => {
        const active = isRoleActive(pathname, role.path);
        return (
          <Button
            key={role.path}
            type="button"
            role="tab"
            aria-selected={active}
            variant={active ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate(role.path)}
            className={cn(!active && 'text-muted-foreground')}
          >
            {role.label}
          </Button>
        );
      })}
    </div>
  );
}
