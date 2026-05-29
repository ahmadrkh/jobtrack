// E2E tests for authentication flows — unauthenticated redirects
// and login page rendering. These tests do NOT use storageState
// so they run as a fresh, unauthenticated browser.

import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page shows GitHub sign-in button', async ({ page }) => {
    // Works whether login is at /login or /en/login (middleware may redirect)
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('JobTrack')).toBeVisible()
    // Button text is "Sign in with GitHub" (not "Continue with GitHub")
    await expect(
      page.getByRole('button', { name: /sign in with github/i })
    ).toBeVisible()
  })

  test('login page has the JobTrack title', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    // Title is "JobTrack" or "JobTrack · JobTrack" depending on metadata config
    await expect(page).toHaveTitle(/jobtrack/i)
  })

  test('navigating to /stats while unauthenticated redirects to /login', async ({ page }) => {
    await page.goto('/stats')
    await expect(page).toHaveURL(/\/login/)
  })
})
