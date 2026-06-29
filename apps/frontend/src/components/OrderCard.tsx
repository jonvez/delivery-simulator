import { useState } from 'react';
import type { Order, ReviewPlanogramInput } from '@/types/order';
import type { Driver } from '@/types/driver';
import { OrderStatus } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const PLANOGRAM_NOTES_MAX = 1000;

interface OrderCardProps {
  order: Order;
  availableDrivers?: Driver[];
  onAssignDriver?: (orderId: string, driverId: string) => void;
  assigning?: boolean;
  onReviewPlanogram?: (orderId: string, input: ReviewPlanogramInput) => Promise<void> | void;
  reviewingPlanogram?: boolean;
}

const statusColors: Record<OrderStatus, 'scheduled' | 'assigned' | 'enroute' | 'delivered'> = {
  [OrderStatus.PENDING]: 'scheduled',
  [OrderStatus.ASSIGNED]: 'assigned',
  [OrderStatus.IN_TRANSIT]: 'enroute',
  [OrderStatus.DELIVERED]: 'delivered',
};

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Scheduled',
  [OrderStatus.ASSIGNED]: 'Assigned',
  [OrderStatus.IN_TRANSIT]: 'En Route',
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

export function OrderCard({
  order,
  availableDrivers = [],
  onAssignDriver,
  assigning = false,
  onReviewPlanogram,
  reviewingPlanogram = false,
}: OrderCardProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  // Local, controlled state for the planogram-compliance review. Seeded from the
  // order so a previously-saved review is reflected on (re)load.
  const [planogramReviewed, setPlanogramReviewed] = useState<boolean>(order.planogramReviewed);
  const [planogramNotes, setPlanogramNotes] = useState<string>(order.planogramNotes ?? '');

  const handleAssign = () => {
    if (selectedDriverId && onAssignDriver) {
      onAssignDriver(order.id, selectedDriverId);
      setSelectedDriverId(null);
    }
  };

  const planogramNotesId = `planogram-notes-${order.id}`;
  const planogramToggleId = `planogram-reviewed-${order.id}`;

  const handleSavePlanogram = () => {
    if (!onReviewPlanogram) return;
    const trimmed = planogramNotes.trim();
    void onReviewPlanogram(order.id, {
      planogramReviewed,
      planogramNotes: trimmed === '' ? null : trimmed,
    });
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
            Store Address
          </p>
          <p className="text-sm">{order.deliveryAddress}</p>
        </div>

        {order.orderDetails && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Case List
            </p>
            <p className="text-sm">{order.orderDetails}</p>
          </div>
        )}

        {/* Show driver info for assigned orders */}
        {order.driver && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Assigned Rep
            </p>
            <p className="text-sm font-medium">{order.driver.name}</p>
          </div>
        )}

        {/* Driver reassignment UI for ASSIGNED/IN_TRANSIT orders - Story 3.6 */}
        {canReassign && (
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Reassign to Different Rep
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
              Assign to Rep
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

        {/* Planogram-compliance review - Issue #4 */}
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id={planogramToggleId}
                checked={planogramReviewed}
                onCheckedChange={(checked) => setPlanogramReviewed(checked === true)}
                disabled={reviewingPlanogram}
              />
              <Label htmlFor={planogramToggleId} className="text-sm font-medium cursor-pointer">
                Planogram reviewed
              </Label>
            </div>
            {planogramReviewed && (
              <Badge variant="secondary">Reviewed</Badge>
            )}
          </div>

          <div className="space-y-1">
            <Label
              htmlFor={planogramNotesId}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Compliance Notes
            </Label>
            <Textarea
              id={planogramNotesId}
              value={planogramNotes}
              maxLength={PLANOGRAM_NOTES_MAX}
              onChange={(e) => setPlanogramNotes(e.target.value)}
              placeholder="Endcap reset, facings squared, out-of-stocks flagged…"
              disabled={reviewingPlanogram}
              className="text-sm"
            />
          </div>

          {onReviewPlanogram && (
            <Button
              onClick={handleSavePlanogram}
              disabled={reviewingPlanogram}
              size="sm"
              variant="outline"
              className="w-full"
            >
              {reviewingPlanogram ? 'Saving…' : 'Save Planogram Review'}
            </Button>
          )}
        </div>

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
                <p className="font-medium text-muted-foreground">En Route</p>
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
            Stop ID: {order.id.slice(0, 8)}...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
