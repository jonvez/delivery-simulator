import { test, expect } from '@playwright/test';

/**
 * E2E — rep (driver) management lives in the Dispatcher → Plan & Assign view; route maps live
 * in Monitor Routes and the rep view.
 */

const uid = () => Math.random().toString(36).slice(2, 8);

test.describe('Rep management', () => {
  test('toggles a rep between On Route and Off Route', async ({ page }) => {
    await page.goto('/dispatch');

    const firstRep = page.getByTestId('driver-item').first();
    const toggle = firstRep.getByRole('button', { name: /mark (on|off) route/i });

    const before = (await toggle.textContent())?.trim() ?? '';
    await toggle.click();
    await expect(toggle).not.toHaveText(before);

    // Toggle back to leave seed state unchanged.
    await toggle.click();
    await expect(toggle).toHaveText(before);
  });

  test('creates a rep that appears in the roster', async ({ page }) => {
    await page.goto('/dispatch');

    const name = `E2E Rep ${uid()}`;
    await page.getByLabel(/rep name/i).fill(name);
    await page.getByRole('button', { name: /create rep/i }).click();

    await expect(page.getByTestId('driver-name').filter({ hasText: name })).toBeVisible();
  });

  test('the monitor map shows active stops', async ({ page }) => {
    await page.goto('/dispatch?mode=monitor');

    await expect(page.getByTestId('map-container')).toBeVisible();
    // Seed data has Assigned/En Route stops, so the route map renders numbered markers.
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
  });
});
