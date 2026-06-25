import { useMemo } from 'react';
import { ActiveStopsMap } from '@/components/ActiveStopsMap';
import { OrderList } from '@/components/OrderList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/types/order';
import { OrderStatus } from '@/types/order';

/**
 * MonitorRoutesPanel — the during-the-day job: is the day on track? An exceptions strip,
 * the live route map, and the full status board.
 */
export function MonitorRoutesPanel({ orders }: { orders: Order[] }) {
  const exceptions = useMemo(() => {
    const items: { id: string; label: string; reason: string }[] = [];
    for (const order of orders) {
      if (order.status === OrderStatus.PENDING) {
        items.push({ id: order.id, label: order.customerName, reason: 'Still unassigned' });
      } else if (order.status === OrderStatus.IN_TRANSIT && !order.planogramReviewed) {
        items.push({
          id: order.id,
          label: order.customerName,
          reason: 'En route — planogram not yet reviewed',
        });
      }
    }
    return items;
  }, [orders]);

  return (
    <div className="space-y-8">
      {exceptions.length > 0 && (
        <Card className="border-amber-300">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Needs attention
              <Badge variant="secondary">{exceptions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {exceptions.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-4 text-sm border-b last:border-0 pb-2 last:pb-0"
              >
                <span className="font-medium">{e.label}</span>
                <span className="text-muted-foreground">{e.reason}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ActiveStopsMap orders={orders} />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Status board</h2>
          <p className="text-sm text-muted-foreground">
            Every stop, grouped by where it is in the day.
          </p>
        </div>
        <OrderList hideHeader />
      </section>
    </div>
  );
}
