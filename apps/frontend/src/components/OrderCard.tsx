import { useState } from 'react';
import type { Order } from '@/types/order';
import type { Driver } from '@/types/driver';
import { OrderStatus } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OrderCardProps {
  order: Order;
  availableDrivers?: Driver[];
  onAssignDriver?: (orderId: string, driverId: string) => void;
  assigning?: boolean;
}

const statusColors: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [OrderStatus.PENDING]: 'outline',
  [OrderStatus.ASSIGNED]: 'secondary',
  [OrderStatus.IN_TRANSIT]: 'default',
  [OrderStatus.DELIVERED]: 'default',
};

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.ASSIGNED]: 'Assigned',
  [OrderStatus.IN_TRANSIT]: 'In Transit',
  [OrderStatus.DELIVERED]: 'Delivered',
};

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderCard({ order, availableDrivers = [], onAssignDriver, assigning = false }: OrderCardProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const handleAssign = () => {
    if (selectedDriverId && onAssignDriver) {
      onAssignDriver(order.id, selectedDriverId);
      setSelectedDriverId(null);
    }
  };

  const isPending = order.status === OrderStatus.PENDING;
  const isAssignedOrInTransit = order.status === OrderStatus.ASSIGNED || order.status === OrderStatus.IN_TRANSIT;
  const canAssign = isPending && availableDrivers.length > 0 && onAssignDriver;
  const canReassign = isAssignedOrInTransit && availableDrivers.length > 0 && onAssignDriver;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              {order.customerName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
          </div>
          <Badge variant={statusColors[order.status]}>
            {statusLabels[order.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Delivery Address
          </p>
          <p className="text-sm">{order.deliveryAddress}</p>
        </div>

        {order.orderDetails && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Order Details
            </p>
            <p className="text-sm">{order.orderDetails}</p>
          </div>
        )}

        {/* Show driver info for assigned orders */}
        {order.driver && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Assigned Driver
            </p>
            <p className="text-sm font-medium">{order.driver.name}</p>
          </div>
        )}

        {/* Driver reassignment UI for ASSIGNED/IN_TRANSIT orders - Story 3.6 */}
        {canReassign && (
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Reassign to Different Driver
            </p>
            <div className="flex gap-2 flex-wrap">
              {availableDrivers
                .filter(driver => driver.id !== order.driverId)
                .map((driver) => (
                  <Button
                    key={driver.id}
                    variant={selectedDriverId === driver.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDriverId(driver.id)}
                    disabled={assigning}
                    className="text-xs"
                  >
                    {driver.name}
                  </Button>
                ))}
            </div>
            {selectedDriverId && (
              <Button
                onClick={handleAssign}
                disabled={assigning}
                size="sm"
                className="w-full"
              >
                {assigning ? 'Reassigning...' : 'Confirm Reassignment'}
              </Button>
            )}
          </div>
        )}

        {/* Driver assignment UI for PENDING orders */}
        {canAssign && (
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Assign to Driver
            </p>
            <div className="flex gap-2 flex-wrap">
              {availableDrivers.map((driver) => (
                <Button
                  key={driver.id}
                  variant={selectedDriverId === driver.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDriverId(driver.id)}
                  disabled={assigning}
                  className="text-xs"
                >
                  {driver.name}
                </Button>
              ))}
            </div>
            {selectedDriverId && (
              <Button
                onClick={handleAssign}
                disabled={assigning}
                size="sm"
                className="w-full"
              >
                {assigning ? 'Assigning...' : 'Confirm Assignment'}
              </Button>
            )}
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-medium text-muted-foreground">Created</p>
              <p>{formatDate(order.createdAt)}</p>
            </div>
            {order.assignedAt && (
              <div>
                <p className="font-medium text-muted-foreground">Assigned</p>
                <p>{formatDate(order.assignedAt)}</p>
              </div>
            )}
            {order.inTransitAt && (
              <div>
                <p className="font-medium text-muted-foreground">In Transit</p>
                <p>{formatDate(order.inTransitAt)}</p>
              </div>
            )}
            {order.deliveredAt && (
              <div>
                <p className="font-medium text-muted-foreground">Delivered</p>
                <p>{formatDate(order.deliveredAt)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-1">
          <p className="text-xs text-muted-foreground">
            Order ID: {order.id.slice(0, 8)}...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
