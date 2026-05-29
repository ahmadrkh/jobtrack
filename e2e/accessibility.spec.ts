// Accessibility E2E tests using axe-core via @axe-core/playwright.
// Catches WCAG 2.1 violations automatically — colour contrast, missing
// ARIA labels, keyboard traps, etc.
//
// This directly satisfies the "Web Accessibility (A11y / WCAG)" job requirement.

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { AUTH_FILE } from './auth.setup'

test.use({ storageState: AUTH_FILE })

test.describe('Accessibility (WCAG 2.1 AA)', () => {
  test('board page has no critical violations', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // Log violations for debugging; fail test only for serious+ severity
    const serious = results.violations.filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    )

    if (serious.length > 0) {
      console.error('A11y violations:\n', JSON.stringify(serious, null, 2))
    }

    expect(serious).toHaveLength(0)
  })

  test('login page has no critical violations', async ({ page }) => {
    await page.goto('/login')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const serious = results.violations.filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    )
    expect(serious).toHaveLength(0)
  })

  test('board is keyboard-navigable — Tab reaches the Add Job button', async ({ page }) => {
    await page.goto('/')
    // Tab through the page until we reach the Add Job button
    let found = false
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => document.activeElement?.textContent ?? '')
      if (/add job/i.test(focused)) { found = true; break }
    }
    expect(found).toBe(true)
  })
})
