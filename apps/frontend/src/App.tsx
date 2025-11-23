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
import { Map } from '@/components/Map';
import { DriverMapView } from '@/components/DriverMapView';
import { DataManagement } from '@/components/DataManagement';

function App() {
  const { data, loading, error, refetch } = useHealthCheck();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Delivery Manager</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Restaurant delivery operations dashboard
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
                <CardTitle>Orders</CardTitle>
                <CardDescription>Create and manage delivery orders</CardDescription>
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
                <CardTitle>Drivers</CardTitle>
                <CardDescription>Manage your delivery drivers</CardDescription>
              </CardHeader>
              <CardContent>
                <DriverForm onDriverCreated={() => {
                  // Driver list will auto-refresh via useDrivers hook
                }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Driver List</CardTitle>
                <CardDescription>All registered drivers</CardDescription>
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
              View driver delivery routes and sequences on interactive maps
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
          <div className="text-center space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Completed Stories
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-muted-foreground">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Epic 1: Foundation</p>
                <p>✅ 1.1: Monorepo</p>
                <p>✅ 1.2: UI Framework</p>
                <p>✅ 1.3: Database</p>
                <p>✅ 1.4: API</p>
                <p>✅ 1.5: Integration</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Epic 2: Orders</p>
                <p>✅ 2.1: Schema & API</p>
                <p>✅ 2.2: Order Form</p>
                <p>✅ 2.3: Order List</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Epic 3: Drivers</p>
                <p>✅ 3.1: Schema & API</p>
                <p>✅ 3.2: Driver UI</p>
                <p>✅ 3.3: Availability</p>
                <p>✅ 3.4: Assignment</p>
                <p>✅ 3.5-3.7: Management</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Epic 4: Maps & Dashboard</p>
                <p>✅ 4.1: Leaflet Maps</p>
                <p>✅ 4.2: Geocoding</p>
                <p>✅ 4.3: Driver Maps</p>
                <p>✅ 4.4: Route Viz</p>
                <p>✅ 4.5: Dashboard</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Epic 5: Data & QA</p>
                <p>✅ 5.1: Brooklyn Addresses</p>
                <p>✅ 5.2: Seed Generation</p>
                <p>✅ 5.3: Data Reset</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
