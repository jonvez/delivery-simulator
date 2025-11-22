import { useMemo } from 'react';
import { useOrders } from '../hooks/useOrders';
import { OrderCard } from './OrderCard';
import type { Order } from '../types/order';
import { OrderStatus } from '../types/order';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const statusSections = [
  {
    status: OrderStatus.PENDING,
    title: 'Pending Orders',
    description: 'Orders waiting to be assigned to a driver',
  },
  {
    status: OrderStatus.ASSIGNED,
    title: 'Assigned Orders',
    description: 'Orders assigned to a driver but not yet in transit',
  },
  {
    status: OrderStatus.IN_TRANSIT,
    title: 'In Transit',
    description: 'Orders currently being delivered',
  },
  {
    status: OrderStatus.DELIVERED,
    title: 'Delivered',
    description: 'Recently completed deliveries',
  },
];

export function OrderList() {
  const { orders, loading, error, refetch } = useOrders();

  // Group orders by status
  const groupedOrders = useMemo(() => {
    const groups: Record<OrderStatus, Order[]> = {
      [OrderStatus.PENDING]: [],
      [OrderStatus.ASSIGNED]: [],
      [OrderStatus.IN_TRANSIT]: [],
      [OrderStatus.DELIVERED]: [],
    };

    orders.forEach((order) => {
      groups[order.status].push(order);
    });

    return groups;
  }, [orders]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading orders...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
            <Button onClick={refetch} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>No orders yet. Create your first order above.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refetch} variant="outline" size="sm">
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-muted-foreground">
            Total: {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {statusSections.map(({ status, title, description }) => {
        const statusOrders = groupedOrders[status];

        if (statusOrders.length === 0) {
          return null;
        }

        return (
          <div key={status} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              <p className="text-sm font-medium mt-1">
                {statusOrders.length} order{statusOrders.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {statusOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
