import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * DispatcherView — back-office planning & control. State-responsive: defaults to Plan &
 * Assign when work is unassigned, Monitor Routes once the day is rolling. Filled in step 3.
 */
export function DispatcherView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dispatcher</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Plan &amp; Assign / Monitor Routes — coming next.
      </CardContent>
    </Card>
  );
}
