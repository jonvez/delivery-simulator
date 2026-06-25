import { test, expect } from '@playwright/test';

/**
 * E2E — the delivery workflow across the DSD role views.
 * Dispatcher creates/assigns stops; the rep advances them Scheduled → … → Delivered.
 */

const API = 'http://localhost:3001';
const uid = () => Math.random().toString(36).slice(2, 8);

test.describe('Delivery workflow', () => {
  test('dispatcher creates a stop that appears as Scheduled', async ({ page }) => {
    await page.goto('/dispatch');

    await page.getByRole('button', { name: /new stop/i }).click();

    const name = `E2E Store ${uid()}`;
    await page.getByLabel(/store account/i).fill(name);
    await page.getByLabel(/customer phone/i).fill('+15551234567');
    await page.getByLabel(/store address/i).fill('123 Test St, Brooklyn, NY 11201');
    await page.getByRole('button', { name: /create stop/i }).click();

    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText('Scheduled', { exact: true }).first()).toBeVisible();
  });

  test('a rep advances an assigned stop to En Route then Delivered', async ({ page, request }) => {
    // Deterministic setup via the API: create a stop and assign it to an available rep.
    const drivers = await (await request.get(`${API}/api/drivers`)).json();
    const rep = drivers.find((d: { isAvailable: boolean }) => d.isAvailable);
    expect(rep, 'expected at least one available rep in seed data').toBeTruthy();

    const name = `E2E Advance ${uid()}`;
    const created = await (
      await request.post(`${API}/api/orders`, {
        data: {
          customerName: name,
          customerPhone: '+15559876543',
          deliveryAddress: '456 Brooklyn Ave, Brooklyn, NY 11215',
        },
      })
    ).json();
    await request.patch(`${API}/api/orders/${created.id}/assign`, {
      data: { driverId: rep.id },
    });

    // Act as that rep and walk the stop through the workflow.
    await page.goto(`/route/${rep.id}`);

    const stop = page
      .locator('div.space-y-2')
      .filter({ has: page.getByRole('heading', { name }) })
      .first();

    await stop.getByRole('button', { name: /start \(en route\)/i }).click();

    const deliver = stop.getByRole('button', { name: /mark delivered/i });
    await expect(deliver).toBeEnabled();
    await deliver.click();

    await expect(stop.getByText('Delivered ✓')).toBeVisible();
  });
});
