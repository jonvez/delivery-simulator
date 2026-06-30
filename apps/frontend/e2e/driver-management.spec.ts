import { test, expect } from '@playwright/test';

/**
 * E2E — rep (driver) management lives in the Dispatcher → Plan & Assign view; route maps live
 * in Monitor Routes and the rep view.
 */

const uid = () => Math.random().toString(36).slice(2, 8);

// The first-visit guided tour auto-opens a spotlight overlay that would block these flows.
// Mark it already-seen so e2e exercises the underlying role views, not the onboarding overlay.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('dsd-demo-tour-seen', '1');
    } catch {
      /* ignore storage failures */
    }
  });
});

test.describe('Rep management', () => {
  test('toggles a rep between On Route and Off Route', async ({ page }) => {
    // Rep roster lives in Plan & Assign; force it (seed data defaults the dispatcher to Monitor).
    await page.goto('/dispatch?mode=plan');

    // Create a dedicated rep so this test owns its subject and can't race other specs that
    // touch the shared seed roster (e.g. the workflow test assigning a stop to the first rep).
    const name = `E2E Toggle ${uid()}`;
    await page.getByLabel(/rep name/i).fill(name);
    await page.getByRole('button', { name: /create rep/i }).click();

    const card = page
      .getByTestId('driver-item')
      .filter({ has: page.getByTestId('driver-name').filter({ hasText: name }) });
    const toggle = card.getByRole('button', { name: /mark (on|off) route/i });

    // A new rep starts On Route, so the button reads "Mark Off Route".
    await expect(toggle).toBeEnabled();
    const before = (await toggle.textContent())?.trim() ?? '';
    const flipped = before.includes('Off') ? 'Mark On Route' : 'Mark Off Route';

    // Assert the explicit flipped label (and wait for the PATCH+refetch to settle by
    // re-enabling) rather than a loose not-equal, which could race the async update.
    await toggle.click();
    await expect(toggle).toHaveText(flipped);
    await expect(toggle).toBeEnabled();

    // Toggle back.
    await toggle.click();
    await expect(toggle).toHaveText(before);
    await expect(toggle).toBeEnabled();
  });

  test('creates a rep that appears in the roster', async ({ page }) => {
    await page.goto('/dispatch?mode=plan');

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
