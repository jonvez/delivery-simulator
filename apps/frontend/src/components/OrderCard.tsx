import { Order, OrderStatus } from '../types/order';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface OrderCardProps {
  order: Order;
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

export function OrderCard({ order }: OrderCardProps) {
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
