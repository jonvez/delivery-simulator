import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * AccountManagerView — relationship & growth. At-risk account summary + per-store service
 * history. Filled in step 5.
 */
export function AccountManagerView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Manager</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Store account health — coming next.
      </CardContent>
    </Card>
  );
}
