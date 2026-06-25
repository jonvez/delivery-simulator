import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUpdateOrderStatus } from '@/hooks/useUpdateOrderStatus';
import type { Order } from '@/types/order';
import { OrderStatus } from '@/types/order';

/**
 * StopActionButtons — the rep's verbs for a stop. Start (En Route) is enabled only when the
 * stop is Assigned; Mark Delivered only when it's En Route; a Delivered stop shows a badge.
 */
export function StopActionButtons({
  order,
  onUpdated,
}: {
  order: Order;
  onUpdated?: () => void;
}) {
  const { updateStatus, loading } = useUpdateOrderStatus();

  const canStart = order.status === OrderStatus.ASSIGNED;
  const canDeliver = order.status === OrderStatus.IN_TRANSIT;
  const isDelivered = order.status === OrderStatus.DELIVERED;

  const advance = async (status: OrderStatus) => {
    const result = await updateStatus(order.id, status);
    if (result) onUpdated?.();
  };

  if (isDelivered) {
    return <Badge variant="secondary">Delivered ✓</Badge>;
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={canStart ? 'default' : 'outline'}
        disabled={!canStart || loading}
        onClick={() => advance(OrderStatus.IN_TRANSIT)}
      >
        {loading && canStart ? 'Starting…' : 'Start (En Route)'}
      </Button>
      <Button
        size="sm"
        variant={canDeliver ? 'default' : 'outline'}
        disabled={!canDeliver || loading}
        onClick={() => advance(OrderStatus.DELIVERED)}
      >
        {loading && canDeliver ? 'Saving…' : 'Mark Delivered'}
      </Button>
    </div>
  );
}
