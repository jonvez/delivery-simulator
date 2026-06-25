import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Map } from '@/components/Map';
import type { MapMarker } from '@/components/Map';
import type { Order } from '@/types/order';
import { OrderStatus } from '@/types/order';

const ALL = 'all';

/**
 * ActiveStopsMap — the dispatcher's monitoring map: every in-flight stop (Assigned / En Route)
 * across all reps, with a rep filter to isolate a single route. Route sequencing uses createdAt
 * ascending as a proxy (there is no explicit sequence field).
 */
export function ActiveStopsMap({ orders }: { orders: Order[] }) {
  const [repFilter, setRepFilter] = useState<string>(ALL);

  const activeOrders = useMemo(
    () =>
      orders
        .filter(
          (o) => o.status === OrderStatus.ASSIGNED || o.status === OrderStatus.IN_TRANSIT
        )
        .slice()
        .sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
    [orders]
  );

  const reps = useMemo(() => {
    const byId: Record<string, string> = {};
    for (const order of activeOrders) {
      if (order.driver) byId[order.driver.id] = order.driver.name;
    }
    return Object.entries(byId)
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeOrders]);

  const filtered = repFilter === ALL
    ? activeOrders
    : activeOrders.filter((o) => o.driverId === repFilter);

  const markers: MapMarker[] = filtered
    .filter((o) => o.latitude !== null && o.longitude !== null)
    .map((o, index) => ({
      position: [o.latitude!, o.longitude!],
      label: `${o.customerName} — ${o.deliveryAddress}`,
      sequenceNumber: index + 1,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Routes</CardTitle>
        <CardDescription>
          In-flight stops across all reps — filter to a single rep to see their route sequence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium whitespace-nowrap">Rep:</span>
          <Select value={repFilter} onValueChange={setRepFilter}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All reps</SelectItem>
              {reps.map((rep) => (
                <SelectItem key={rep.id} value={rep.id}>
                  {rep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {markers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No active stops to map right now.</p>
            <p className="text-sm mt-2">(Only Assigned and En Route stops appear here.)</p>
          </div>
        ) : (
          <div>
            <div className="mb-2 text-sm text-muted-foreground">
              Showing {markers.length} active stop{markers.length === 1 ? '' : 's'}
              {repFilter !== ALL && <span className="ml-2 text-blue-600">• Route sequence shown</span>}
            </div>
            <Map markers={markers} fitBounds={true} showRoute={repFilter !== ALL} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
