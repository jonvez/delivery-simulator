# Manual Testing Checklist

## Overview
This checklist covers all MVP features of the Delivery Simulator application. Test each item to verify the application works as expected before release.

## Prerequisites
- [ ] Backend server is running (`cd apps/backend && npm run dev`)
- [ ] Frontend server is running (`cd apps/frontend && npm run dev`)
- [ ] Database is set up and migrated
- [ ] Test data is seeded (optional but recommended)

---

## 1. Order Management

### 1.1 Create Order - Happy Path
- [ ] Navigate to the application homepage
- [ ] Fill in the order form with valid data:
  - Customer Name: "John Doe"
  - Customer Phone: "+15551234567"
  - Delivery Address: "123 Main St, Brooklyn, NY 11201"
  - Order Details: "1 Large Pepperoni Pizza"
- [ ] Click "Create Order" button
- [ ] Verify success message appears
- [ ] Verify order appears in the orders list with status "PENDING"
- [ ] Verify order shows correct customer information

### 1.2 Create Order - Edge Cases
- [ ] Try to submit form with empty customer name → Should show validation error
- [ ] Try to submit form with empty phone number → Should show validation error
- [ ] Try to submit form with invalid phone format (e.g., "123") → Should show validation error
- [ ] Try to submit form with empty delivery address → Should show validation error
- [ ] Try to submit with name exceeding 255 characters → Should show validation error
- [ ] Try to submit with phone exceeding 20 characters → Should show validation error
- [ ] Try to submit with address exceeding 500 characters → Should show validation error
- [ ] Verify form resets after successful submission

### 1.3 View Orders
- [ ] Navigate to orders list
- [ ] Verify all orders are displayed with:
  - Customer name
  - Delivery address
  - Order status badge (color-coded)
  - Timestamps
- [ ] Verify orders are sorted by creation date (newest first)
- [ ] Click on an order to expand details
- [ ] Verify expanded view shows:
  - Customer phone
  - Order details
  - Driver assignment status
  - All timestamps (created, picked up, delivered)

### 1.4 Update Order Status
- [ ] Create a new order
- [ ] Assign the order to a driver
- [ ] Click "Mark as Picked Up" or similar status button
- [ ] Verify order status changes to "IN_TRANSIT"
- [ ] Verify pickup timestamp is recorded
- [ ] Click "Mark as Delivered"
- [ ] Verify order status changes to "DELIVERED"
- [ ] Verify delivery timestamp is recorded
- [ ] Verify delivered orders appear in completed section

---

## 2. Driver Management

### 2.1 Create Driver - Happy Path
- [ ] Navigate to driver management section
- [ ] Click "Add New Driver" or similar button
- [ ] Fill in driver form:
  - Name: "Jane Smith"
  - Availability: Checked
- [ ] Click "Create Driver"
- [ ] Verify success message appears
- [ ] Verify driver appears in drivers list
- [ ] Verify driver shows as "Available"

### 2.2 Create Driver - Edge Cases
- [ ] Try to submit form with empty name → Should show validation error
- [ ] Try to submit with name exceeding 255 characters → Should show validation error
- [ ] Create driver with availability unchecked → Should show as "Unavailable"
- [ ] Verify form resets after successful submission

### 2.3 Toggle Driver Availability
- [ ] Find an available driver
- [ ] Click "Mark Unavailable" button
- [ ] Verify driver status changes to "Unavailable"
- [ ] Verify status badge color changes
- [ ] Click "Mark Available" button
- [ ] Verify driver status changes back to "Available"
- [ ] Try to assign an order to an unavailable driver → Should not be possible or should show warning

### 2.4 View Driver Orders
- [ ] Assign at least one order to a driver
- [ ] Click on the driver to expand their view
- [ ] Verify "View Orders" or similar button appears
- [ ] Click to view driver's orders
- [ ] Verify all assigned orders are displayed
- [ ] Verify order count badge shows correct number
- [ ] Verify only active orders (ASSIGNED, IN_TRANSIT) are highlighted
- [ ] Verify completed orders are also shown but clearly marked

---

## 3. Order Assignment

### 3.1 Assign Order to Driver - Happy Path
- [ ] Create a new order (should be PENDING)
- [ ] Create or select an available driver
- [ ] Click "Assign Driver" button on the order
- [ ] Select driver from dropdown/list
- [ ] Click "Confirm" or similar
- [ ] Verify order status changes to "ASSIGNED"
- [ ] Verify driver name appears on the order
- [ ] Verify order appears in driver's order list

### 3.2 Assign Order - Edge Cases
- [ ] Try to assign already assigned order → Should show warning or prevent action
- [ ] Try to assign delivered order → Should not be possible
- [ ] Assign order to unavailable driver → Should show warning or prevent action
- [ ] Unassign an order → Verify status returns to PENDING
- [ ] Reassign order to different driver → Verify assignment updates correctly

---

## 4. Map Visualization

### 4.1 Map Display
- [ ] Navigate to map view
- [ ] Verify map loads and displays Brooklyn area
- [ ] Verify map is interactive (pan, zoom)
- [ ] Verify restaurant marker is visible (if configured)

### 4.2 Order Markers
- [ ] Create orders with Brooklyn addresses
- [ ] Verify delivery location markers appear on map
- [ ] Verify markers are color-coded by status:
  - PENDING (one color)
  - ASSIGNED (another color)
  - IN_TRANSIT (another color)
  - DELIVERED (another color or removed)
- [ ] Click on a marker
- [ ] Verify popup/tooltip shows order details

### 4.3 Driver Route Display
- [ ] Assign an order to a driver
- [ ] Select the driver in driver list
- [ ] Verify route line appears on map from restaurant to delivery location
- [ ] Verify route line color indicates driver status
- [ ] Verify driver marker appears (if implemented)

---

## 5. Data Management

### 5.1 Seed Data
- [ ] Clear database or reset to empty state
- [ ] Run seed command: `npm run seed:data` (from backend)
- [ ] Verify sample orders are created
- [ ] Verify sample drivers are created
- [ ] Verify addresses are valid Brooklyn locations
- [ ] Verify data appears correctly in UI

### 5.2 Reset Data
- [ ] Have some orders and drivers in the system
- [ ] Run reset command: `npm run reset:data` (or use UI button if implemented)
- [ ] Verify all orders are deleted
- [ ] Verify all drivers are deleted
- [ ] Verify UI reflects empty state
- [ ] Verify empty states show appropriate messages

---

## 6. Error Handling

### 6.1 Backend Connection Issues
- [ ] Stop the backend server
- [ ] Try to create an order
- [ ] Verify error message appears: "Failed to connect to server" or similar
- [ ] Verify UI doesn't crash
- [ ] Start backend server
- [ ] Click retry or refresh
- [ ] Verify connection restored and data loads

### 6.2 Network Errors
- [ ] Simulate slow network (use browser dev tools)
- [ ] Create an order
- [ ] Verify loading state shows during request
- [ ] Verify success/error state shows when request completes

### 6.3 Invalid Data Responses
- [ ] Check that malformed API responses don't crash the app
- [ ] Verify appropriate error messages are shown to user

---

## 7. UI/UX Quality

### 7.1 Responsive Design
- [ ] Test on desktop browser (1920x1080)
- [ ] Test on tablet size (768x1024)
- [ ] Test on mobile size (375x667)
- [ ] Verify all controls are accessible and usable
- [ ] Verify map remains functional on all sizes
- [ ] Verify forms are properly laid out

### 7.2 Loading States
- [ ] Verify loading indicators appear during:
  - Initial data fetch
  - Form submissions
  - Status updates
  - Driver assignment
- [ ] Verify buttons disable during loading
- [ ] Verify loading states don't persist indefinitely

### 7.3 Empty States
- [ ] Start with no orders
- [ ] Verify friendly "No orders yet" message appears
- [ ] Start with no drivers
- [ ] Verify "No drivers yet. Add your first driver above." message appears
- [ ] Verify empty states include helpful instructions

### 7.4 Accessibility
- [ ] Navigate entire app using only keyboard (Tab, Enter, Space)
- [ ] Verify all interactive elements are focusable
- [ ] Verify focus indicators are visible
- [ ] Use screen reader to verify labels are descriptive

---

## 8. Testing Infrastructure

### 8.1 Unit Tests
- [ ] Run unit tests: `npm run test`
- [ ] Verify all tests pass
- [ ] Check coverage report: `npm run test:coverage`
- [ ] Verify coverage is >70%

### 8.2 Integration Tests
- [ ] Run integration tests: `npm run test:integration` (in backend)
- [ ] Verify all API endpoint tests pass
- [ ] Verify test covers all CRUD operations

### 8.3 E2E Tests
- [ ] Run E2E tests: `npm run test:e2e` (in frontend)
- [ ] Verify all end-to-end workflows pass
- [ ] Verify tests run in headless mode
- [ ] Run with UI: `npm run test:e2e:ui` to debug failures

---

## 9. Cross-Browser Compatibility

- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)
- [ ] Verify map works in all browsers
- [ ] Verify forms work in all browsers

---

## 10. Performance

### 10.1 Initial Load
- [ ] Clear browser cache
- [ ] Load application
- [ ] Verify page loads in <3 seconds (on good connection)
- [ ] Verify no console errors

### 10.2 With Large Data Sets
- [ ] Seed 50+ orders
- [ ] Create 20+ drivers
- [ ] Verify UI remains responsive
- [ ] Verify map doesn't lag with many markers
- [ ] Verify scrolling in lists is smooth

---

## Sign-Off

| Feature Area | Tester Name | Date | Status | Notes |
|--------------|-------------|------|--------|-------|
| Order Management | | | | |
| Driver Management | | | | |
| Order Assignment | | | | |
| Map Visualization | | | | |
| Data Management | | | | |
| Error Handling | | | | |
| UI/UX Quality | | | | |
| Testing Infrastructure | | | | |
| Cross-Browser | | | | |
| Performance | | | | |

**Overall Status:** [ ] Pass [ ] Fail

**Notes:**

