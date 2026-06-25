import { useSearchParams } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { getStatusCounts, deriveDayState } from '@/lib/dayState';
import type { DayMode } from '@/lib/dayState';
import { StatusCountsStrip } from '@/components/StatusCountsStrip';
import { PlanAndAssignPanel } from '@/views/dispatcher/PlanAndAssignPanel';
import { MonitorRoutesPanel } from '@/views/dispatcher/MonitorRoutesPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const MODES: { value: DayMode; label: string }[] = [
  { value: 'plan', label: 'Plan & Assign' },
  { value: 'monitor', label: 'Monitor Routes' },
];

/**
 * DispatcherView — back-office planning & control. State-responsive: with no explicit ?mode,
 * the view defaults to Plan & Assign while stops are unassigned, and Monitor Routes once the
 * day is dispatched. The mode toggle (and the Re-plan affordance) pin the choice via ?mode.
 */
export function DispatcherView() {
  const { orders, loading, error, refetch } = useOrders();
  const [searchParams, setSearchParams] = useSearchParams();

  const counts = getStatusCounts(orders);
  const paramMode = searchParams.get('mode');
  const mode: DayMode =
    paramMode === 'plan' || paramMode === 'monitor' ? paramMode : deriveDayState(orders);

  const setMode = (next: DayMode) => {
    setSearchParams(
      (prev) => {
        prev.set('mode', next);
        return prev;
      },
      { replace: true }
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading the day…
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8 space-y-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={refetch} variant="outline" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <StatusCountsStrip counts={counts} />

      <div className="flex items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Dispatcher mode"
          className="inline-flex items-center gap-1 rounded-lg border bg-muted/40 p-1"
        >
          {MODES.map((m) => {
            const active = mode === m.value;
            return (
              <Button
                key={m.value}
                role="tab"
                aria-selected={active}
                variant={active ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode(m.value)}
                className={cn(!active && 'text-muted-foreground')}
              >
                {m.label}
              </Button>
            );
          })}
        </div>

        {mode === 'monitor' && (
          <Button variant="outline" size="sm" onClick={() => setMode('plan')}>
            {counts.pending > 0 ? `${counts.pending} unassigned — Re-plan` : 'Re-plan'}
          </Button>
        )}
      </div>

      {mode === 'plan' ? (
        <PlanAndAssignPanel onChanged={refetch} />
      ) : (
        <MonitorRoutesPanel orders={orders} />
      )}
    </div>
  );
}
