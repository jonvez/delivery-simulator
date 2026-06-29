import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Story 5.5: Add End-to-End Tests for Core Workflows
 */
export default defineConfig({
  testDir: './e2e',
  // These specs mutate shared backend/DB state (drivers, stops), so they must run serially —
  // full parallelism caused cross-test interference (e.g. one test toggling a rep another reads).
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    // The app's ORIGIN stays on localhost (so the backend's CORS allowlist accepts it), but it
    // fetches the API at the IPv4 loopback — headless Chromium resolves `localhost` to IPv6 (::1)
    // while the backend binds IPv4, so a bare `localhost:3001` API base would fail to connect.
    command: 'VITE_API_BASE_URL=http://127.0.0.1:3001 npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
