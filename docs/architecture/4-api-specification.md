# 4. API Specification

## API Design Principles

- **RESTful conventions**: Resources mapped to HTTP methods (GET, POST, PUT, PATCH, DELETE)
- **JSON payloads**: All request/response bodies use JSON
- **Standard status codes**: 200 (success), 201 (created), 400 (validation error), 404 (not found), 500 (server error)
- **Error format**: Consistent error response structure
- **No authentication for MVP**: Auth deferred to post-MVP

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.delivery-manager.com/api` (post-MVP)

## API Endpoints

### Orders

**GET /api/orders**
- **Description**: Retrieve all orders with optional status filtering
- **Query Params**:
  - `status` (optional): Filter by OrderStatus (e.g., `PENDING`, `ASSIGNED`)
- **Response**: `200 OK`
  ```typescript
  {
    orders: Order[]
  }
  ```

**GET /api/orders/:id**
- **Description**: Retrieve single order by ID
- **Path Params**: `id` (UUID)
- **Response**: `200 OK`
  ```typescript
  {
    order: Order
  }
  ```
- **Error**: `404 Not Found` if order doesn't exist

**POST /api/orders**
- **Description**: Create new order
- **Request Body**:
  ```typescript
  {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    orderDetails: string;
  }
  ```
- **Response**: `201 Created`
  ```typescript
  {
    order: Order  // Includes auto-assigned id, status=PENDING, createdAt
  }
  ```
- **Error**: `400 Bad Request` if validation fails

**PATCH /api/orders/:id/assign**
- **Description**: Assign order to driver
- **Path Params**: `id` (UUID)
- **Request Body**:
  ```typescript
  {
    driverId: string;  // UUID of driver
  }
  ```
- **Response**: `200 OK`
  ```typescript
  {
    order: Order  // Updated with driverId, status=ASSIGNED, assignedAt
  }
  ```
- **Error**:
  - `400 Bad Request` if driver unavailable or order already assigned
  - `404 Not Found` if order or driver doesn't exist

**PATCH /api/orders/:id/status**
- **Description**: Update order status (for status transitions)
- **Path Params**: `id` (UUID)
- **Request Body**:
  ```typescript
  {
    status: OrderStatus;  // New status
  }
  ```
- **Response**: `200 OK`
  ```typescript
  {
    order: Order  // Updated with new status and relevant timestamp
  }
  ```
- **Error**:
  - `400 Bad Request` if invalid status transition
  - `404 Not Found` if order doesn't exist

### Drivers

**GET /api/drivers**
- **Description**: Retrieve all drivers
- **Query Params**:
  - `availableOnly` (optional): If `true`, return only available drivers
- **Response**: `200 OK`
  ```typescript
  {
    drivers: Driver[]
  }
  ```

**GET /api/drivers/:id**
- **Description**: Retrieve single driver by ID with assigned orders
- **Path Params**: `id` (UUID)
- **Response**: `200 OK`
  ```typescript
  {
    driver: Driver & { orders: Order[] }
  }
  ```
- **Error**: `404 Not Found` if driver doesn't exist

**POST /api/drivers**
- **Description**: Create new driver
- **Request Body**:
  ```typescript
  {
    name: string;
    isAvailable?: boolean;  // Optional, defaults to true
  }
  ```
- **Response**: `201 Created`
  ```typescript
  {
    driver: Driver
  }
  ```
- **Error**: `400 Bad Request` if validation fails

**PATCH /api/drivers/:id/availability**
- **Description**: Update driver availability
- **Path Params**: `id` (UUID)
- **Request Body**:
  ```typescript
  {
    isAvailable: boolean;
  }
  ```
- **Response**: `200 OK`
  ```typescript
  {
    driver: Driver
  }
  ```
- **Error**: `404 Not Found` if driver doesn't exist

**GET /api/drivers/:id/route**
- **Description**: Get suggested delivery route for driver's assigned orders
- **Path Params**: `id` (UUID)
- **Response**: `200 OK`
  ```typescript
  {
    driverId: string;
    orders: Order[];  // Assigned orders in suggested sequence
    coordinates: Array<{ lat: number; lng: number }>;  // Route waypoints
  }
  ```
- **Error**: `404 Not Found` if driver doesn't exist

### Seed Data

**POST /api/seed/reset**
- **Description**: Reset database and populate with sample data
- **Request Body**: None
- **Response**: `200 OK`
  ```typescript
  {
    message: string;
    data: {
      driversCreated: number;
      ordersCreated: number;
      addressesCreated: number;
    }
  }
  ```

## Error Response Format

All error responses follow this structure:

```typescript
{
  error: {
    code: string;           // Machine-readable error code (e.g., "VALIDATION_ERROR")
    message: string;        // Human-readable error message
    details?: any;          // Optional additional error details (e.g., Zod errors)
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Request body failed validation
- `NOT_FOUND`: Resource not found
- `INVALID_TRANSITION`: Invalid state transition (e.g., bad status change)
- `DRIVER_UNAVAILABLE`: Attempted to assign unavailable driver
- `INTERNAL_ERROR`: Server error

## OpenAPI Specification

The complete API will be documented using OpenAPI 3.0. The spec file will be maintained at:

```
apps/backend/src/api/openapi.yaml
```

This allows:
- Auto-generated API documentation (via Swagger UI)
- Client SDK generation
- Request/response validation
- Contract testing

---
