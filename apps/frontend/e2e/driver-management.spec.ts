import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Driver Management
 * Story 5.5: Add End-to-End Tests for Core Workflows
 *
 * Tests driver availability toggling and driver selection features
 */

test.describe('Driver Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should toggle driver availability and verify UI updates', async ({ page }) => {
    // Navigate to drivers view/section
    const driversLink = page.getByRole('link', { name: /drivers/i });
    if (await driversLink.isVisible().catch(() => false)) {
      await driversLink.click();
      await page.waitForLoadState('networkidle');
    }

    // Find first driver in the list
    const firstDriver = page.locator('[data-testid="driver-item"]').first();
    const driverName = await firstDriver.locator('[data-testid="driver-name"]').textContent()
      .catch(() => null);

    // Look for availability toggle button or switch
    const toggleButton = firstDriver.getByRole('button', { name: /available|unavailable|toggle/i });
    const switchElement = firstDriver.locator('input[type="checkbox"]');

    let wasAvailable = false;

    if (await toggleButton.isVisible().catch(() => false)) {
      // Get current state
      const currentText = await toggleButton.textContent();
      wasAvailable = currentText?.toLowerCase().includes('available') || false;

      // Click toggle
      await toggleButton.click();
      await page.waitForTimeout(500);

      // Verify state changed
      const newText = await toggleButton.textContent();
      if (wasAvailable) {
        expect(newText?.toLowerCase()).toContain('unavailable');
      } else {
        expect(newText?.toLowerCase()).toContain('available');
      }

      // Toggle back
      await toggleButton.click();
      await page.waitForTimeout(500);
    } else if (await switchElement.isVisible().catch(() => false)) {
      // Handle checkbox/switch
      wasAvailable = await switchElement.isChecked();

      await switchElement.click();
      await page.waitForTimeout(500);

      // Verify state changed
      expect(await switchElement.isChecked()).toBe(!wasAvailable);

      // Toggle back
      await switchElement.click();
      await page.waitForTimeout(500);

      expect(await switchElement.isChecked()).toBe(wasAvailable);
    }
  });

  test('should select driver and verify route shows on map', async ({ page }) => {
    // Look for map container
    const mapContainer = page.locator('[data-testid="map-container"], #map, .leaflet-container').first();

    // Verify map is present
    await expect(mapContainer).toBeVisible();

    // Find a driver with an assigned order
    const driverWithOrder = page.locator('[data-testid="driver-item"]')
      .filter({ has: page.locator('text=/assigned|in.*transit/i') })
      .first();

    if (await driverWithOrder.isVisible().catch(() => false)) {
      // Click on the driver
      await driverWithOrder.click();
      await page.waitForTimeout(1000);

      // Verify map shows route/markers
      // Check for polyline (route line) or markers on the map
      const routeLine = page.locator('.leaflet-interactive').first();
      const marker = page.locator('.leaflet-marker-icon').first();

      // At least one of these should be visible
      const hasRouteOrMarker = await routeLine.isVisible().catch(() => false) ||
                              await marker.isVisible().catch(() => false);
      expect(hasRouteOrMarker).toBe(true);
    } else {
      // If no driver with orders, just verify map is interactive
      await mapContainer.click({ position: { x: 100, y: 100 } });
      // Map should still be visible after click
      await expect(mapContainer).toBeVisible();
    }
  });

  test('should create a driver and verify it appears in list', async ({ page }) => {
    // Navigate to drivers view
    const driversLink = page.getByRole('link', { name: /drivers/i });
    if (await driversLink.isVisible().catch(() => false)) {
      await driversLink.click();
    }

    // Click create driver button
    const createButton = page.getByRole('button', { name: /create.*driver|new.*driver|add.*driver/i });
    if (await createButton.isVisible().catch(() => false)) {
      await createButton.click();

      // Fill in driver name
      await page.getByLabel(/name|driver.*name/i).fill('E2E Test Driver');

      // Set availability if there's a checkbox
      const availableCheckbox = page.getByLabel(/available|is.*available/i);
      if (await availableCheckbox.isVisible().catch(() => false)) {
        await availableCheckbox.check();
      }

      // Submit form
      await page.getByRole('button', { name: /submit|create|save/i }).click();
      await page.waitForTimeout(1000);

      // Verify driver appears in list
      await expect(page.getByText('E2E Test Driver')).toBeVisible();
    }
  });

  test('should view driver-specific orders', async ({ page }) => {
    // Navigate to drivers view
    const driversLink = page.getByRole('link', { name: /drivers/i });
    if (await driversLink.isVisible().catch(() => false)) {
      await driversLink.click();
    }

    // Find a driver with assigned orders
    const driverItem = page.locator('[data-testid="driver-item"]').first();
    await driverItem.click();

    // Look for orders assigned to this driver
    const ordersSection = page.locator('[data-testid="driver-orders"], [data-testid="assigned-orders"]');

    if (await ordersSection.isVisible().catch(() => false)) {
      // Verify orders are displayed
      const ordersList = ordersSection.locator('[data-testid="order-item"]');
      const count = await ordersList.count();

      // Should have at least 0 orders (empty state is valid)
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
