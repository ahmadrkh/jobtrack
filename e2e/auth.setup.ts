// Playwright global setup — authenticates once and saves session state to disk.
// All E2E tests import this state via `storageState` so they start already
// signed in, without repeating the GitHub OAuth flow in every test.
//
// How to run the full setup:
//   npx playwright test --project=setup      (creates e2e/.auth/user.json)
//   npx playwright test                      (all tests use the saved session)

import { test as setup, expect } from '@playwright/test'
import path from 'path'

export const AUTH_FILE = path.join(__dirname, '.auth/user.json')

setup('authenticate', async ({ page }) => {
  // For E2E against a real deployment, use GitHub OAuth.
  // For local testing, use a test-user seed + credentials env vars.
  const testEmail    = process.env.TEST_USER_EMAIL    ?? 'test@example.com'
  const testPassword = process.env.TEST_USER_PASSWORD ?? ''

  // If the app uses NextAuth credentials provider for tests, sign in that way.
  // Otherwise, navigate to the login page and click GitHub (requires a test GitHub account).
  await page.goto('/login')
  await expect(page.getByText('JobTrack')).toBeVisible()

  // Skip full OAuth in CI — use a pre-seeded session cookie instead.
  // Set TEST_SESSION_TOKEN in CI env to a valid NextAuth session token.
  if (process.env.TEST_SESSION_TOKEN) {
    await page.context().addCookies([{
      name:   'next-auth.session-token',
      value:  process.env.TEST_SESSION_TOKEN,
      domain: 'localhost',
      path:   '/',
    }])
    await page.goto('/')
    await expect(page).not.toHaveURL('/login')
  }

  await page.context().storageState({ path: AUTH_FILE })
})
