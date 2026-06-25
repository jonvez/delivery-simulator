import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDrivers } from '@/hooks/useDrivers';
import { useDriverOrders } from '@/hooks/useDriverOrders';
import { DriverMapView } from '@/components/DriverMapView';
import { RepStopCard } from '@/components/RepStopCard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * RepView — field execution. "Acting as" a rep (carried in the URL as /route/:repId), this is
 * the rep's run-the-route screen: their route map plus an ordered, actionable stop list.
 */
export function RepView() {
  const { repId } = useParams();
  const navigate = useNavigate();
  const { drivers } = useDrivers();
  // Bumped on a stop update so the map re-fetches alongside the stop list.
  const [mapNonce, setMapNonce] = useState(0);
  const { orders, loading, error, refetch } = useDriverOrders(repId ?? null);

  const pickRep = (id: string) => navigate(`/route/${id}`);
  const handleUpdated = () => {
    refetch();
    setMapNonce((n) => n + 1);
  };

  // Empty state — no rep chosen yet.
  if (!repId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pick a rep to act as</CardTitle>
          <CardDescription>
            There's no login here — choose which route rep you're running today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value="" onValueChange={pickRep}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Choose a rep…" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name} {driver.isAvailable ? '(On Route)' : '(Off Route)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    );
  }

  const rep = drivers.find((d) => d.id === repId);
  const orderedStops = orders
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">My route today</h2>
          <p className="text-sm text-muted-foreground">
            {rep ? `Acting as ${rep.name}` : 'Acting as rep'} · {orderedStops.length} stop
            {orderedStops.length === 1 ? '' : 's'}
          </p>
        </div>
        <Select value={repId} onValueChange={pickRep}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Choose a rep…" />
          </SelectTrigger>
          <SelectContent>
            {drivers.map((driver) => (
              <SelectItem key={driver.id} value={driver.id}>
                {driver.name} {driver.isAvailable ? '(On Route)' : '(Off Route)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DriverMapView key={mapNonce} driverId={repId} />

      {loading && <p className="text-sm text-muted-foreground">Loading your route…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && orderedStops.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No stops on your route yet.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {orderedStops.map((order, index) => (
          <RepStopCard
            key={order.id}
            order={order}
            sequence={index + 1}
            onUpdated={handleUpdated}
          />
        ))}
      </div>
    </div>
  );
}
