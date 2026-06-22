import { useStoreHistory } from '@/hooks/useStoreHistory';
import type { StoreAccountAggregate } from '@/types/storeHistory';
import { OrderStatus } from '@/types/order';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Per-Account view (Issue #3) — the DSD account-management lens.
 * For each store account: delivery/stop history, total drops, and last visit.
 */

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Scheduled',
  [OrderStatus.ASSIGNED]: 'Assigned',
  [OrderStatus.IN_TRANSIT]: 'En Route',
  [OrderStatus.DELIVERED]: 'Delivered',
};

function formatVisit(dateString: string | null): string {
  if (!dateString) return 'No visits yet';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatStopDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StoreAccountCard({ account }: { account: StoreAccountAggregate }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{account.storeAccount}</CardTitle>
        <CardDescription>{account.storeAddress}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-muted p-3">
            <div className="text-2xl font-bold">{account.totalDrops}</div>
            <div className="text-xs text-muted-foreground">Drops</div>
          </div>
          <div className="rounded-md bg-muted p-3">
            <div className="text-2xl font-bold">{account.totalStops}</div>
            <div className="text-xs text-muted-foreground">Total stops</div>
          </div>
          <div className="rounded-md bg-muted p-3">
            <div className="text-sm font-semibold">{formatVisit(account.lastVisit)}</div>
            <div className="text-xs text-muted-foreground">Last visit</div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Stop history</p>
          <ul className="space-y-1">
            {account.history.map((stop) => (
              <li
                key={stop.id}
                className="flex items-center justify-between text-sm border-b last:border-b-0 py-1"
              >
                <span className="text-muted-foreground">
                  {stop.deliveredAt
                    ? formatStopDate(stop.deliveredAt)
                    : formatStopDate(stop.createdAt)}
                </span>
                <Badge variant="outline">{statusLabels[stop.status]}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export function StoreHistory() {
  const { accounts, loading, error, refetch } = useStoreHistory();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading store accounts...</div>
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

  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Store Accounts</CardTitle>
          <CardDescription>
            No store accounts yet. Create stops to build account history.
          </CardDescription>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {accounts.length} store account{accounts.length !== 1 ? 's' : ''}
        </p>
        <Button onClick={refetch} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <StoreAccountCard key={account.storeAccount} account={account} />
        ))}
      </div>
    </div>
  );
}
