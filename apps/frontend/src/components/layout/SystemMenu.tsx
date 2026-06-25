import { useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DataManagement } from '@/components/DataManagement';
import { useHealthCheck } from '@/hooks/useHealthCheck';

/**
 * SystemMenu — demoted system chrome (connection status + demo-data reset), tucked behind an
 * overflow button so it never competes with the role views. Built with a local-state popover
 * (no new dependency); closes on outside click.
 */
export function SystemMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data, error } = useHealthCheck();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="icon"
        aria-label="System menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Settings className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 z-50">
          <Card className="p-4 space-y-4 shadow-lg">
            <div className="space-y-2">
              <p className="text-sm font-semibold">Connection</p>
              <div className="flex flex-wrap gap-2">
                {data ? (
                  <>
                    <Badge className="bg-green-600">API Connected</Badge>
                    <Badge className="bg-blue-600">DB Connected</Badge>
                  </>
                ) : (
                  <Badge variant="destructive">{error ? 'System Error' : 'Checking…'}</Badge>
                )}
              </div>
            </div>
            <DataManagement />
          </Card>
        </div>
      )}
    </div>
  );
}
