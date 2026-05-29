import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const AUTH_FILE = path.join(__dirname, 'e2e/.auth/user.json')

export default defineConfig({
  testDir: './e2e',
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
    // Auth setup — runs once, saves session to e2e/.auth/user.json
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // Main authenticated tests
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
    },

    // Mobile viewport
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
    },

    // Unauthenticated tests (auth.spec.ts — redirect checks)
    {
      name: 'unauthenticated',
      testMatch: '**/auth.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    // Accessibility
    {
      name: 'a11y',
      testMatch: '**/accessibility.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
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
