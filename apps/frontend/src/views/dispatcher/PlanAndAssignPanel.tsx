import { useState } from 'react';
import { OrderForm } from '@/components/OrderForm';
import { OrderList } from '@/components/OrderList';
import { DriverForm } from '@/components/DriverForm';
import { DriverList } from '@/components/DriverList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatus } from '@/types/order';

/**
 * PlanAndAssignPanel — the start-of-day job: turn scheduled stops into an assigned route
 * plan. Unassigned queue (with assign + create), then the rep roster + availability.
 */
export function PlanAndAssignPanel({ onChanged }: { onChanged: () => void }) {
  const [showNewStop, setShowNewStop] = useState(false);
  // Bumped after a create so the unassigned queue remounts and re-fetches.
  const [queueNonce, setQueueNonce] = useState(0);

  const handleCreated = () => {
    setQueueNonce((n) => n + 1);
    setShowNewStop(false);
    onChanged();
  };

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Unassigned stops</h2>
            <p className="text-sm text-muted-foreground">
              Assign each scheduled stop to a route rep.
            </p>
          </div>
          <Button
            onClick={() => setShowNewStop((s) => !s)}
            variant={showNewStop ? 'secondary' : 'default'}
            size="sm"
          >
            {showNewStop ? 'Close' : '+ New Stop'}
          </Button>
        </div>

        {showNewStop && <OrderForm onCreated={handleCreated} />}

        <OrderList
          key={queueNonce}
          statuses={[OrderStatus.PENDING]}
          hideHeader
          onChanged={onChanged}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Route reps</h2>
          <p className="text-sm text-muted-foreground">
            Manage your reps and their on/off-route availability.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add a rep</CardTitle>
            </CardHeader>
            <CardContent>
              <DriverForm onDriverCreated={onChanged} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reps</CardTitle>
            </CardHeader>
            <CardContent>
              <DriverList />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
