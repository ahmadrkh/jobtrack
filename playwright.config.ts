import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E configuration.
 *
 * Runs against the production-like Next.js build (`next start`) to test
 * the full stack including server-side rendering and API routes.
 *
 * CI note: the GitHub Actions workflow starts the server with
 * `npm run build && npm run start` before running `npx playwright test`.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace:   'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],

  // Starts the dev server automatically when running locally.
  // In CI, the server is started by the workflow before playwright runs.
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url:     'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
