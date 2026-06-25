import { OrderCard } from '@/components/OrderCard';
import { StopActionButtons } from '@/components/StopActionButtons';
import { useReviewPlanogram } from '@/hooks/useReviewPlanogram';
import type { Order, ReviewPlanogramInput } from '@/types/order';

/**
 * RepStopCard — a single stop on the rep's route: the sequence number + action verbs
 * (Start / Mark Delivered), wrapping the shared OrderCard for stop details + planogram
 * review. OrderCard stays untouched; rep-only mutations live here.
 */
export function RepStopCard({
  order,
  sequence,
  onUpdated,
}: {
  order: Order;
  sequence: number;
  onUpdated?: () => void;
}) {
  const { reviewPlanogram, loading: reviewingPlanogram } = useReviewPlanogram();

  const handleReviewPlanogram = async (orderId: string, input: ReviewPlanogramInput) => {
    const result = await reviewPlanogram(orderId, input);
    if (result) onUpdated?.();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-semibold">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
            {sequence}
          </span>
          Stop {sequence}
        </span>
        <StopActionButtons order={order} onUpdated={onUpdated} />
      </div>
      <OrderCard
        order={order}
        onReviewPlanogram={handleReviewPlanogram}
        reviewingPlanogram={reviewingPlanogram}
      />
    </div>
  );
}
