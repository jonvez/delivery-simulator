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

function App() {
  const { data, loading, error, refetch } = useHealthCheck();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Delivery Manager</h1>
          <p className="text-muted-foreground">
            Restaurant delivery operations management system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Health Check</CardTitle>
            <CardDescription>
              Full-stack connectivity status - frontend to backend to database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading health status...</div>
              </div>
            )}

            {error && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Error</Badge>
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
            )}

            {data && !loading && !error && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">API Status</p>
                      <p className="text-xs text-muted-foreground">
                        Backend server connectivity
                      </p>
                    </div>
                    <Badge variant={data.status === 'ok' ? 'default' : 'destructive'}>
                      {data.status === 'ok' ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Database Status</p>
                      <p className="text-xs text-muted-foreground">
                        PostgreSQL connection via Prisma
                      </p>
                    </div>
                    <Badge
                      variant={
                        data.database === 'connected' ? 'default' : 'destructive'
                      }
                    >
                      {data.database === 'connected' ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Last Checked</p>
                      <p className="text-xs text-muted-foreground">
                        Server timestamp
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(data.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={refetch} variant="outline" size="sm">
                    Refresh Status
                  </Button>
                </div>

                <div className="p-4 bg-primary/10 rounded-md">
                  <p className="text-sm font-semibold text-primary mb-1">
                    ✓ Full-stack connectivity verified
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Frontend (React) → Backend (Express) → Database (PostgreSQL)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Static Map</h2>
              <p className="text-muted-foreground">
                Interactive map showing delivery locations in Brooklyn, NY
              </p>
            </div>
            <Map
              markers={[
                { position: [40.6782, -73.9442], label: 'Brooklyn Center', sequenceNumber: 1 },
                { position: [40.7128, -73.9458], label: 'Williamsburg', sequenceNumber: 2 },
                { position: [40.6501, -73.9496], label: 'Park Slope', sequenceNumber: 3 },
              ]}
              showRoute={true}
            />
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Driver Deliveries</h2>
              <p className="text-muted-foreground">
                View assigned orders for each driver
              </p>
            </div>
            <DriverMapView />
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>✅ Story 1.1: Monorepo initialized</p>
          <p>✅ Story 1.2: shadcn/ui and Tailwind CSS configured</p>
          <p>✅ Story 1.3: PostgreSQL and Prisma ORM set up</p>
          <p>✅ Story 1.4: Express API with health check endpoint</p>
          <p>✅ Story 1.5: Frontend connected to backend</p>
          <p>✅ Story 2.1: Order database schema and API endpoints</p>
          <p>✅ Story 2.2: Create order form UI</p>
          <p>✅ Story 2.3: Order list with status grouping</p>
          <p>✅ Story 3.1: Driver database schema and API endpoints</p>
          <p>✅ Story 3.2: Driver management UI</p>
          <p>✅ Story 3.3: Driver availability toggle</p>
          <p>✅ Story 3.4: Order-driver assignment relationship</p>
          <p>✅ Story 3.5: Order assignment to drivers</p>
          <p>✅ Story 3.6: Order reassignment</p>
          <p>✅ Story 3.7: Driver-specific order views</p>
          <p>✅ Story 4.1: Leaflet map integration</p>
          <p>✅ Story 4.2: Geocoding support for addresses</p>
          <p>✅ Story 4.3: Driver-specific order map views</p>
          <p>✅ Story 4.4: Route sequence visualization</p>
        </div>
      </div>
    </div>
  );
}

export default App;
