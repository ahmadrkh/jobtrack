// E2E tests for the Kanban board — the core user flow.
//
// These tests run against the full Next.js app (real DB calls).
// They use Page Object Model (POM) — each page gets its own class
// so selectors are defined once and reused across test files.

import { test, expect } from '@playwright/test'

// AUTH_FILE path — must match playwright.config.ts
// NOT imported from auth.setup.ts (Playwright forbids spec→setup imports)
const AUTH_FILE = 'e2e/.auth/user.json'

// ── Page Object Model ─────────────────────────────────────────────────────────
class BoardPage {
  constructor(private page: import('@playwright/test').Page) {}

  async goto() {
    await this.page.goto('/')
    // Wait for the board to fully hydrate and TanStack Query to settle
    await this.page.waitForLoadState('networkidle')
  }

  addButton()   { return this.page.getByRole('button', { name: /add job/i }) }
  searchInput() { return this.page.getByPlaceholder(/search company/i) }
  boardToggle() { return this.page.getByRole('button', { name: /board/i }) }
  listToggle()  { return this.page.getByRole('button', { name: /list/i }) }

  // Use contains-text (no exact) so "Wishlist (3)" still matches "Wishlist"
  columnHeader(name: string) {
    return this.page.getByText(name).first()
  }
  cardByCompany(name: string) { return this.page.getByText(name).first() }

  async addApplication(company: string, role: string) {
    await this.addButton().click()
    await this.page.getByLabel(/company/i).fill(company)
    await this.page.getByLabel(/role/i).fill(role)
    await this.page.getByRole('button', { name: /add application/i }).click()
    // Wait for the dialog to close and optimistic update to appear
    await this.page.waitForLoadState('networkidle')
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────
// Override storageState using the local constant (not an import from auth.setup)
test.use({ storageState: AUTH_FILE })

test.describe('Kanban Board', () => {
  test('shows all six columns', async ({ page }) => {
    const board = new BoardPage(page)
    await board.goto()

    for (const col of ['Wishlist', 'Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected']) {
      await expect(board.columnHeader(col)).toBeVisible()
    }
  })

  test('adds a new application via the dialog', async ({ page }) => {
    const board   = new BoardPage(page)
    const company = `TestCo-${Date.now()}`
    await board.goto()

    await board.addApplication(company, 'Frontend Dev')

    // Card should appear on the board
    await expect(board.cardByCompany(company)).toBeVisible()
  })

  test('filters cards by search', async ({ page }) => {
    const board = new BoardPage(page)
    await board.goto()

    // Add two unique cards
    const a = `Alpha-${Date.now()}`
    const b = `Beta-${Date.now()}`
    await board.addApplication(a, 'Dev')
    await board.addApplication(b, 'Dev')

    // Search for Alpha — Beta should disappear
    await board.searchInput().fill(a)
    await expect(board.cardByCompany(a)).toBeVisible()
    await expect(page.getByText(b)).not.toBeVisible()
  })

  test('switches to list view and back', async ({ page }) => {
    const board = new BoardPage(page)
    await board.goto()

    await board.listToggle().click()
    await page.waitForLoadState('networkidle')
    // Table header should appear
    await expect(page.getByRole('columnheader', { name: /company/i })).toBeVisible()

    await board.boardToggle().click()
    await page.waitForLoadState('networkidle')
    // Kanban columns should be back
    await expect(board.columnHeader('Applied')).toBeVisible()
  })
})
