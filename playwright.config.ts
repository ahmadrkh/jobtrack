import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const AUTH_FILE = path.join(__dirname, 'e2e/.auth/user.json')

export default defineConfig({
  testDir: './e2e',

  // ← KEY FIX: globally ignore *.setup.ts so regular projects don't pick it up.
  // Only the 'setup' project below overrides this with its own testMatch.
  testIgnore: ['**/*.setup.ts'],

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    // Runs auth.setup.ts once — saves session to e2e/.auth/user.json
    {
      name: 'setup',
      testMatch: ['**/*.setup.ts'],   // explicitly opt-in to setup files
    },

    // Authenticated desktop tests
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },

    // Authenticated mobile tests
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },

    // Unauthenticated redirect tests (auth.spec.ts only — no storageState)
    {
      name: 'unauthenticated',
      testMatch: ['**/auth.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },

    // Accessibility (axe-core) — authenticated
    {
      name: 'a11y',
      testMatch: ['**/accessibility.spec.ts'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
