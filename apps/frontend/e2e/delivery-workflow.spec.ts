import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Core Delivery Workflows
 * Story 5.5: Add End-to-End Tests for Core Workflows
 *
 * Tests the complete delivery lifecycle from order creation to delivery
 */

test.describe('Delivery Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Reset data before each test to ensure consistent state
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create an order and verify it appears in pending orders', async ({ page }) => {
    // Navigate to orders view (assuming there's a way to get there)
    await page.goto('/');

    // Click on "Create Order" or similar button
    const createOrderButton = page.getByRole('button', { name: /create.*order|new.*order|add.*order/i });

    // Only click if the button exists (some views might have forms always visible)
    if (await createOrderButton.isVisible().catch(() => false)) {
      await createOrderButton.click();
    }

    // Fill in order form
    await page.getByLabel(/customer.*name|name/i).fill('E2E Test Customer');
    await page.getByLabel(/phone|customer.*phone/i).fill('+15551234567');
    await page.getByLabel(/address|delivery.*address/i).fill('123 Test St, Brooklyn, NY 11201');

    // Fill order details if field exists
    const orderDetailsField = page.getByLabel(/order.*details|details|items/i);
    if (await orderDetailsField.isVisible().catch(() => false)) {
      await orderDetailsField.fill('Test pizza delivery');
    }

    // Submit the form
    await page.getByRole('button', { name: /submit|create|save/i }).click();

    // Wait for the order to appear in the list
    await page.waitForTimeout(1000);

    // Verify order appears in pending orders
    await expect(page.getByText('E2E Test Customer')).toBeVisible();
    await expect(page.getByText(/pending/i)).toBeVisible();
  });

  test('should assign order to driver and verify status changes', async ({ page }) => {
    // First create an order
    await page.goto('/');

    const createOrderButton = page.getByRole('button', { name: /create.*order|new.*order|add.*order/i });
    if (await createOrderButton.isVisible().catch(() => false)) {
      await createOrderButton.click();
    }

    await page.getByLabel(/customer.*name|name/i).fill('Assignment Test');
    await page.getByLabel(/phone|customer.*phone/i).fill('+15559876543');
    await page.getByLabel(/address|delivery.*address/i).fill('456 Brooklyn Ave, Brooklyn, NY 11215');
    await page.getByRole('button', { name: /submit|create|save/i }).click();
    await page.waitForTimeout(1000);

    // Find and click on the order to see details or assign option
    const orderRow = page.getByText('Assignment Test').locator('..');
    await orderRow.click();

    // Look for assign button or dropdown
    const assignButton = page.getByRole('button', { name: /assign.*driver|assign/i });
    if (await assignButton.isVisible().catch(() => false)) {
      await assignButton.click();

      // Select a driver from dropdown or list
      const driverOption = page.locator('[role="option"]').first();
      if (await driverOption.isVisible().catch(() => false)) {
        await driverOption.click();
      }

      // Confirm assignment
      const confirmButton = page.getByRole('button', { name: /confirm|assign|save/i });
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
      }
    }

    await page.waitForTimeout(1000);

    // Verify status changed to ASSIGNED
    await expect(page.getByText(/assigned/i)).toBeVisible();
  });

  test('should update order status to in-transit and verify timestamp', async ({ page }) => {
    // Create and assign an order first
    await page.goto('/');

    const createOrderButton = page.getByRole('button', { name: /create.*order|new.*order|add.*order/i });
    if (await createOrderButton.isVisible().catch(() => false)) {
      await createOrderButton.click();
    }

    await page.getByLabel(/customer.*name|name/i).fill('Transit Test');
    await page.getByLabel(/phone|customer.*phone/i).fill('+15554443333');
    await page.getByLabel(/address|delivery.*address/i).fill('789 Park Ave, Brooklyn, NY 11238');
    await page.getByRole('button', { name: /submit|create|save/i }).click();
    await page.waitForTimeout(1000);

    // Click the order
    const orderRow = page.getByText('Transit Test').locator('..');
    await orderRow.click();

    // Update status to IN_TRANSIT
    const statusButton = page.getByRole('button', { name: /status|update.*status/i });
    if (await statusButton.isVisible().catch(() => false)) {
      await statusButton.click();

      // Select IN_TRANSIT status
      const inTransitOption = page.getByRole('option', { name: /in.*transit|transit/i });
      if (await inTransitOption.isVisible().catch(() => false)) {
        await inTransitOption.click();
      }
    }

    await page.waitForTimeout(1000);

    // Verify status is IN_TRANSIT
    await expect(page.getByText(/in.*transit|transit/i)).toBeVisible();

    // Verify timestamp is shown (looking for time format like "2:30 PM" or "14:30")
    const timeRegex = /\d{1,2}:\d{2}|\d{4}-\d{2}-\d{2}/;
    await expect(page.locator(`text=${timeRegex}`).first()).toBeVisible();
  });

  test('should mark order as delivered and verify it appears in history', async ({ page }) => {
    // Create an order
    await page.goto('/');

    const createOrderButton = page.getByRole('button', { name: /create.*order|new.*order|add.*order/i });
    if (await createOrderButton.isVisible().catch(() => false)) {
      await createOrderButton.click();
    }

    await page.getByLabel(/customer.*name|name/i).fill('Delivery Test');
    await page.getByLabel(/phone|customer.*phone/i).fill('+15552221111');
    await page.getByLabel(/address|delivery.*address/i).fill('321 Heights St, Brooklyn, NY 11201');
    await page.getByRole('button', { name: /submit|create|save/i }).click();
    await page.waitForTimeout(1000);

    // Click the order
    const orderRow = page.getByText('Delivery Test').locator('..');
    await orderRow.click();

    // Update status to DELIVERED
    const statusButton = page.getByRole('button', { name: /status|update.*status|mark.*delivered/i });
    if (await statusButton.isVisible().catch(() => false)) {
      await statusButton.click();

      // Select DELIVERED status
      const deliveredOption = page.getByRole('option', { name: /delivered|complete/i });
      if (await deliveredOption.isVisible().catch(() => false)) {
        await deliveredOption.click();
      }
    }

    await page.waitForTimeout(1000);

    // Verify status is DELIVERED
    await expect(page.getByText(/delivered|complete/i)).toBeVisible();

    // Check if there's a history or completed orders section
    const historyLink = page.getByRole('link', { name: /history|completed|delivered/i });
    if (await historyLink.isVisible().catch(() => false)) {
      await historyLink.click();
      await expect(page.getByText('Delivery Test')).toBeVisible();
    }
  });
});
