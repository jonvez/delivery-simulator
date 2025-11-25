# 7. Frontend Architecture Details

## State Management

**Approach**: React Context API + Hooks for MVP

**Contexts:**

1. **OrdersContext** (`apps/frontend/src/contexts/OrdersContext.tsx`)
   - **State**: `orders: Order[]`, `loading: boolean`, `error: string | null`
   - **Actions**: `fetchOrders()`, `createOrder()`, `assignOrder()`, `updateOrderStatus()`
   - **Polling**: Fetches orders every 30 seconds using `useEffect` + `setInterval`

2. **DriversContext** (`apps/frontend/src/contexts/DriversContext.tsx`)
   - **State**: `drivers: Driver[]`, `loading: boolean`, `error: string | null`
   - **Actions**: `fetchDrivers()`, `createDriver()`, `toggleAvailability()`, `fetchDriverRoute(driverId)`
   - **Polling**: Fetches drivers every 30 seconds

**Why Context for MVP:**
- Simple, built-in solution (no additional dependencies)
- Sufficient for moderate state complexity
- Easy to migrate to Redux or Zustand later if needed

**Future State Management:**
- Consider Redux Toolkit or Zustand if state complexity grows
- Add optimistic updates for better UX
- Implement request deduplication and caching

## Routing

**Library**: React Router v6

**Routes**:
```typescript
// apps/frontend/src/App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="drivers" element={<DriversPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

## API Client Service

**File**: `apps/frontend/src/services/api/client.ts`

```typescript
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error?.message || 'Request failed', response.status, error.error?.code);
    }

    return response.json();
  }

  // Orders
  async getOrders(status?: string): Promise<{ orders: Order[] }> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/orders${query}`);
  }

  async createOrder(data: CreateOrderRequest): Promise<{ order: Order }> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignOrder(orderId: string, driverId: string): Promise<{ order: Order }> {
    return this.request(`/orders/${orderId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ driverId }),
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ order: Order }> {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Drivers
  async getDrivers(availableOnly?: boolean): Promise<{ drivers: Driver[] }> {
    const query = availableOnly ? '?availableOnly=true' : '';
    return this.request(`/drivers${query}`);
  }

  async getDriver(driverId: string): Promise<{ driver: Driver & { orders: Order[] } }> {
    return this.request(`/drivers/${driverId}`);
  }

  async toggleDriverAvailability(driverId: string, isAvailable: boolean): Promise<{ driver: Driver }> {
    return this.request(`/drivers/${driverId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    });
  }

  async getDriverRoute(driverId: string): Promise<DriverRoute> {
    return this.request(`/drivers/${driverId}/route`);
  }
}

export const apiClient = new ApiClient();
```

## Styling Approach

- **Tailwind CSS**: Utility-first styling for rapid development
- **shadcn/ui**: Pre-built accessible components (built on Radix UI primitives)
- **Custom Theme**: Configure Tailwind theme in `tailwind.config.js` for brand colors
- **Responsive Design**: Mobile-first approach with responsive breakpoints

**shadcn/ui Components Used:**
- `Button`, `Card`, `Badge`, `Input`, `Textarea`, `Select`, `Tabs`, `Switch`, `ScrollArea`, `Form`, `NavigationMenu`

## Polling Implementation

**Pattern**: Use `useEffect` + `setInterval` in context providers

```typescript
// Example from OrdersContext
useEffect(() => {
  fetchOrders(); // Initial fetch

  const interval = setInterval(() => {
    fetchOrders(); // Poll every 30 seconds
  }, 30000);

  return () => clearInterval(interval); // Cleanup on unmount
}, []);
```

**Considerations:**
- Clear intervals on component unmount to prevent memory leaks
- Consider pausing polling when tab is not visible (`document.visibilityState`)
- Show last updated timestamp to user

---
