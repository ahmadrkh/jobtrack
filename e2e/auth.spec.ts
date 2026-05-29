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
    await page.goto('/login')
    await expect(page.getByText('JobTrack')).toBeVisible()
    await expect(page.getByRole('button', { name: /continue with github/i })).toBeVisible()
  })

  test('login page has correct meta title', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/sign in/i)
  })

  test('navigating to /stats while unauthenticated redirects to /login', async ({ page }) => {
    await page.goto('/stats')
    await expect(page).toHaveURL(/\/login/)
  })
})
