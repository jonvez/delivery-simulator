import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * RepView — field execution. Acting as a chosen rep, "my route today": scoped map + ordered
 * stop list with Start / Mark Delivered + planogram review. Filled in step 4.
 */
export function RepView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Sales Rep</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        My route today — coming next.
      </CardContent>
    </Card>
  );
}
