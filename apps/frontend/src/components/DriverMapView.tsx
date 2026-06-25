import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Map } from '@/components/Map';
import type { MapMarker } from '@/components/Map';
import { useDrivers } from '@/hooks/useDrivers';
import { useDriverOrders } from '@/hooks/useDriverOrders';
import { OrderStatus } from '@/types/order';

/**
 * Component for displaying a rep's assigned stops on a map
 * Story 4.3: Display Rep's Assigned Stops on Map
 */
/**
 * DriverMapView — a rep's active stops on the map. When `driverId` is supplied (e.g. the rep
 * view drives it from the URL) the internal rep picker is hidden and that rep is used.
 */
export function DriverMapView({ driverId }: { driverId?: string } = {}) {
  const [internalDriverId, setInternalDriverId] = useState<string>('');
  const controlled = driverId !== undefined;
  const selectedDriverId = controlled ? driverId : internalDriverId;
  const setSelectedDriverId = setInternalDriverId;
  const { drivers, loading: driversLoading } = useDrivers();
  const { orders, loading: ordersLoading } = useDriverOrders(selectedDriverId || null);

  // Active stops (ASSIGNED and IN_TRANSIT), ordered by creation so the map sequence matches
  // the rep's stop list (createdAt ascending is the proxy for route order).
  const activeOrders = orders
    .filter(
      (order) => order.status === OrderStatus.ASSIGNED || order.status === OrderStatus.IN_TRANSIT
    )
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Convert orders to map markers with sequence numbers
  // Story 4.4: Add sequence numbers for route visualization
  const markers: MapMarker[] = activeOrders
    .filter((order) => order.latitude !== null && order.longitude !== null)
    .map((order, index) => ({
      position: [order.latitude!, order.longitude!],
      label: `${order.customerName} - ${order.deliveryAddress}`,
      sequenceNumber: index + 1, // Story 4.4: Sequential numbering
    }));

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rep Route Map</CardTitle>
        <CardDescription>
          View a rep's assigned store locations on the map
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Driver Selection — hidden when a parent controls the selected rep (e.g. rep view) */}
        {!controlled && (
          <div className="flex items-center gap-4">
            <label htmlFor="driver-select" className="text-sm font-medium whitespace-nowrap">
              Select Rep:
            </label>
            <Select
              value={selectedDriverId}
              onValueChange={setSelectedDriverId}
              disabled={driversLoading}
            >
              <SelectTrigger id="driver-select" className="w-full">
                <SelectValue placeholder="Choose a rep..." />
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
        )}

        {/* Loading State */}
        {ordersLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Loading rep stops...
          </div>
        )}

        {/* Empty State - No Driver Selected */}
        {!selectedDriverId && !ordersLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Select a rep to view their store locations</p>
          </div>
        )}

        {/* Empty State - Driver Has No Active Orders */}
        {selectedDriverId && !ordersLoading && activeOrders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>{selectedDriver?.name} has no active stops</p>
            <p className="text-sm mt-2">
              (Only Assigned and En Route stops are shown)
            </p>
          </div>
        )}

        {/* Map Display */}
        {selectedDriverId && !ordersLoading && markers.length > 0 && (
          <div>
            <div className="mb-2 text-sm text-muted-foreground">
              Showing {markers.length} active stop{markers.length === 1 ? '' : 's'} for{' '}
              {selectedDriver?.name}
              {markers.length > 1 && (
                <span className="ml-2 text-blue-600">
                  • Route sequence shown
                </span>
              )}
            </div>
            <Map markers={markers} fitBounds={true} showRoute={true} />
          </div>
        )}

        {/* Warning for orders without coordinates */}
        {selectedDriverId &&
          !ordersLoading &&
          activeOrders.length > 0 &&
          markers.length < activeOrders.length && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              Note: {activeOrders.length - markers.length} stop(s) could not be displayed
              because they lack geocoding coordinates.
            </div>
          )}
      </CardContent>
    </Card>
  );
}
