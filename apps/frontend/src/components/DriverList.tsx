import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { useDrivers } from '../hooks/useDrivers';
import { useUpdateDriver } from '../hooks/useUpdateDriver';

/**
 * Component for displaying list of all drivers
 * Story 3.2: Build Driver Management UI
 * Story 3.3: Implement Driver Availability Toggle
 */
export function DriverList() {
  const { drivers, loading, error, refetch } = useDrivers();
  const { updateDriver, loading: updating } = useUpdateDriver();

  const handleToggleAvailability = async (driverId: string, currentAvailability: boolean) => {
    const updated = await updateDriver(driverId, { isAvailable: !currentAvailability });
    if (updated) {
      // Refresh the driver list to show updated availability
      refetch();
    }
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
          <Card key={driver.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium">{driver.name}</h4>
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
                  onClick={() => handleToggleAvailability(driver.id, driver.isAvailable)}
                  variant="outline"
                  size="sm"
                  disabled={updating}
                >
                  {driver.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
