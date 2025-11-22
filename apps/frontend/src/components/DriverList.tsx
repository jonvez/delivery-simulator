import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useDrivers } from '@/hooks/useDrivers';
import { useUpdateDriver } from '@/hooks/useUpdateDriver';
import { useDriverOrders } from '@/hooks/useDriverOrders';
import { OrderCard } from './OrderCard';
import { OrderStatus } from '@/types/order';
import type { Driver } from '@/types/driver';

interface DriverCardProps {
  driver: Driver;
  isExpanded: boolean;
  onToggleExpansion: (driverId: string) => void;
  onToggleAvailability: (driverId: string, currentAvailability: boolean) => void;
  updating: boolean;
}

/**
 * Component for displaying a single driver with their orders
 * Story 3.7: Display Driver-Specific Order Views
 */
function DriverCard({ driver, isExpanded, onToggleExpansion, onToggleAvailability, updating }: DriverCardProps) {
  const { orders, loading: ordersLoading } = useDriverOrders(isExpanded ? driver.id : null);

  const activeOrders = orders.filter(
    (order) => order.status === OrderStatus.ASSIGNED || order.status === OrderStatus.IN_TRANSIT
  );

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{driver.name}</h4>
            {activeOrders.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Added {new Date(driver.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={driver.isAvailable ? 'default' : 'secondary'}
            className={driver.isAvailable ? 'bg-green-600' : ''}
          >
            {driver.isAvailable ? 'Available' : 'Unavailable'}
          </Badge>
          <Button
            onClick={() => onToggleAvailability(driver.id, driver.isAvailable)}
            variant="outline"
            size="sm"
            disabled={updating}
          >
            {driver.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
          </Button>
          <Button
            onClick={() => onToggleExpansion(driver.id)}
            variant="ghost"
            size="sm"
          >
            {isExpanded ? 'Hide Orders' : 'View Orders'}
          </Button>
        </div>
      </div>

      {/* Expanded view showing driver's orders */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {ordersLoading ? (
            <div className="text-center text-gray-500 py-4">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No orders assigned yet</div>
          ) : (
            <>
              <div>
                <h5 className="font-semibold text-sm mb-2">All Orders ({orders.length})</h5>
                <div className="grid gap-3 md:grid-cols-2">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

/**
 * Component for displaying list of all drivers
 * Story 3.2: Build Driver Management UI
 * Story 3.3: Implement Driver Availability Toggle
 * Story 3.7: Display Driver-Specific Order Views
 */
export function DriverList() {
  const { drivers, loading, error, refetch } = useDrivers();
  const { updateDriver, loading: updating } = useUpdateDriver();
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

  const handleToggleAvailability = async (driverId: string, currentAvailability: boolean) => {
    const updated = await updateDriver(driverId, { isAvailable: !currentAvailability });
    if (updated) {
      // Refresh the driver list to show updated availability
      refetch();
    }
  };

  const toggleDriverExpansion = (driverId: string) => {
    setExpandedDriverId(expandedDriverId === driverId ? null : driverId);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading drivers...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
          {error}
        </div>
        <Button onClick={refetch} variant="outline" className="w-full">
          Retry
        </Button>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-gray-500">No drivers yet. Add your first driver above.</p>
        <Button onClick={refetch} variant="outline">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4">
        <h3 className="text-lg font-semibold">
          Drivers
          <span className="ml-2 text-sm text-gray-500 font-normal">
            ({drivers.length} {drivers.length === 1 ? 'driver' : 'drivers'})
          </span>
        </h3>
        <Button onClick={refetch} variant="ghost" size="sm">
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {drivers.map((driver) => (
          <DriverCard
            key={driver.id}
            driver={driver}
            isExpanded={expandedDriverId === driver.id}
            onToggleExpansion={toggleDriverExpansion}
            onToggleAvailability={handleToggleAvailability}
            updating={updating}
          />
        ))}
      </div>
    </div>
  );
}
