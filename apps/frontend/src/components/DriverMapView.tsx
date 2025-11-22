import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Map, MapMarker } from '@/components/Map';
import { useDrivers } from '@/hooks/useDrivers';
import { useDriverOrders } from '@/hooks/useDriverOrders';
import { OrderStatus } from '@/types/order';

/**
 * Component for displaying a driver's assigned orders on a map
 * Story 4.3: Display Driver's Assigned Orders on Map
 */
export function DriverMapView() {
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const { drivers, loading: driversLoading } = useDrivers();
  const { orders, loading: ordersLoading } = useDriverOrders(selectedDriverId || null);

  // Filter only active orders (ASSIGNED and IN_TRANSIT)
  const activeOrders = orders.filter(
    (order) => order.status === OrderStatus.ASSIGNED || order.status === OrderStatus.IN_TRANSIT
  );

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
        <CardTitle>Driver Delivery Map</CardTitle>
        <CardDescription>
          View a driver's assigned delivery locations on the map
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Driver Selection */}
        <div className="flex items-center gap-4">
          <label htmlFor="driver-select" className="text-sm font-medium whitespace-nowrap">
            Select Driver:
          </label>
          <Select
            value={selectedDriverId}
            onValueChange={setSelectedDriverId}
            disabled={driversLoading}
          >
            <SelectTrigger id="driver-select" className="w-full">
              <SelectValue placeholder="Choose a driver..." />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name} {driver.isAvailable ? '(Available)' : '(Unavailable)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {ordersLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Loading driver orders...
          </div>
        )}

        {/* Empty State - No Driver Selected */}
        {!selectedDriverId && !ordersLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Select a driver to view their delivery locations</p>
          </div>
        )}

        {/* Empty State - Driver Has No Active Orders */}
        {selectedDriverId && !ordersLoading && activeOrders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>{selectedDriver?.name} has no active deliveries</p>
            <p className="text-sm mt-2">
              (Only ASSIGNED and IN_TRANSIT orders are shown)
            </p>
          </div>
        )}

        {/* Map Display */}
        {selectedDriverId && !ordersLoading && markers.length > 0 && (
          <div>
            <div className="mb-2 text-sm text-muted-foreground">
              Showing {markers.length} active deliver{markers.length === 1 ? 'y' : 'ies'} for{' '}
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
              Note: {activeOrders.length - markers.length} order(s) could not be displayed
              because they lack geocoding coordinates.
            </div>
          )}
      </CardContent>
    </Card>
  );
}
