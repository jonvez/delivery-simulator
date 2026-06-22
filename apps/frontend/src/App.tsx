import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { OrderForm } from '@/components/OrderForm';
import { OrderList } from '@/components/OrderList';
import { DriverForm } from '@/components/DriverForm';
import { DriverList } from '@/components/DriverList';
import { DriverMapView } from '@/components/DriverMapView';
import { DataManagement } from '@/components/DataManagement';

function App() {
  const { data, error, refetch } = useHealthCheck();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">DSD Route Manager</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Direct Store Delivery for convenience-store distribution
              </p>
            </div>
            <div className="flex items-center gap-2">
              {data && (
                <>
                  <Badge variant="default" className="bg-green-600">
                    API Connected
                  </Badge>
                  <Badge variant="default" className="bg-blue-600">
                    DB Connected
                  </Badge>
                </>
              )}
              {error && (
                <Badge variant="destructive">
                  System Error
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto p-8 space-y-8">{/* Main Dashboard Content */}

        {/* System Error Alert */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">System Error</Badge>
                  <span className="text-sm text-destructive">{error}</span>
                </div>
                <div className="p-4 bg-destructive/10 rounded-md text-sm">
                  <p className="font-semibold mb-2">Unable to connect to backend</p>
                  <p className="text-muted-foreground">
                    Make sure the backend server is running on port 3001
                  </p>
                  <pre className="mt-2 text-xs">npm run dev</pre>
                </div>
                <Button onClick={refetch} variant="outline" size="sm">
                  Retry Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stops</CardTitle>
                <CardDescription>Create and manage delivery stops</CardDescription>
              </CardHeader>
              <CardContent>
                <OrderForm />
              </CardContent>
            </Card>

            <OrderList />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reps</CardTitle>
                <CardDescription>Manage your route reps</CardDescription>
              </CardHeader>
              <CardContent>
                <DriverForm onDriverCreated={() => {
                  // Rep list will auto-refresh via useDrivers hook
                }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rep List</CardTitle>
                <CardDescription>All registered reps</CardDescription>
              </CardHeader>
              <CardContent>
                <DriverList />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Route Visualization Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Route Visualization</h2>
            <p className="text-sm text-muted-foreground">
              View rep delivery routes and stop sequences on interactive maps
            </p>
          </div>
          <DriverMapView />
        </div>

        {/* Data Management Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Data Management</h2>
            <p className="text-sm text-muted-foreground">
              Reset and regenerate demo data for testing
            </p>
          </div>
          <DataManagement />
        </div>

        {/* Footer */}
        <footer className="border-t pt-8 mt-16">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              About this demo
            </h3>
            <p className="text-sm text-muted-foreground">
              DSD Route Manager is a Direct Store Delivery operations demo for
              convenience-store distribution: dispatchers schedule store stops, assign
              route reps, and track each stop through Scheduled → Assigned → En Route →
              Delivered, with live route maps and per-rep stop sequences.
            </p>
            <p className="text-xs text-muted-foreground">
              Built solo with Claude Code — an AI-assisted build, reframed from a generic
              delivery app into the DSD / convenience-store domain.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
