import { useMemo } from 'react';
import { useStoreHistory } from '@/hooks/useStoreHistory';
import { StoreHistory } from '@/components/StoreHistory';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysSince(date: string | null): number | null {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / MS_PER_DAY);
}

/**
 * AccountManagerView — relationship & growth. Leads with the accounts most at risk (longest
 * since a delivery / never visited), then the full per-store service history.
 */
export function AccountManagerView() {
  const { accounts } = useStoreHistory();

  const atRisk = useMemo(
    () =>
      accounts
        .slice()
        .sort((a, b) => {
          // Never-visited accounts first, then oldest last-visit first.
          if (a.lastVisit === null && b.lastVisit === null) return 0;
          if (a.lastVisit === null) return -1;
          if (b.lastVisit === null) return 1;
          return new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime();
        })
        .slice(0, 4),
    [accounts]
  );

  return (
    <div className="space-y-8">
      {atRisk.length > 0 && (
        <Card className="border-amber-300">
          <CardHeader>
            <CardTitle className="text-base">Needs attention</CardTitle>
            <CardDescription>
              Accounts with the longest time since a delivery — protect these relationships first.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {atRisk.map((account) => {
              const days = daysSince(account.lastVisit);
              return (
                <div key={account.storeAccount} className="rounded-lg bg-muted p-3 space-y-1">
                  <div className="font-medium text-sm">{account.storeAccount}</div>
                  <Badge variant={days === null ? 'destructive' : 'secondary'}>
                    {days === null ? 'Never visited' : `${days}d since last drop`}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">All store accounts</h2>
          <p className="text-sm text-muted-foreground">
            Per-store service history — drops, total stops, and last visit.
          </p>
        </div>
        <StoreHistory />
      </section>
    </div>
  );
}
