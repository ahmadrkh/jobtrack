// Hook integration tests using TanStack Query's test utilities.
//
// Pattern: wrap hooks in a QueryClientProvider with a fresh client per test
// so query cache never leaks between tests.

import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useApplications,
  useCreateApplication,
  useDeleteApplication,
} from '@/hooks/useApplications'
import type { Application } from '@/types'

// ── Fixtures ──────────────────────────────────────────────────────────────────
const mockApp: Application = {
  id: 'app-1', company: 'Acme', role: 'Engineer', status: 'APPLIED',
  jobUrl: null, location: null, salary: null, notes: null,
  appliedAt: null, followUpAt: null,
  createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('useApplications', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [mockApp],
    })
  })
  afterEach(() => jest.restoreAllMocks())

  it('fetches and returns applications', async () => {
    const { result } = renderHook(() => useApplications(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockApp])
    expect(fetch).toHaveBeenCalledWith('/api/applications')
  })

  it('sets isError when the request fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) })
    const { result } = renderHook(() => useApplications(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreateApplication', () => {
  it('sends POST and returns the created application', async () => {
    global.fetch = jest.fn()
      // First call: POST → returns new app
      .mockResolvedValueOnce({ ok: true, json: async () => mockApp })
      // Second call: GET after invalidation
      .mockResolvedValue({ ok: true, json: async () => [mockApp] })

    const { result } = renderHook(() => useCreateApplication(), { wrapper: wrapper() })

    await act(async () => {
      await result.current.mutateAsync({
        company: 'Acme', role: 'Engineer', status: 'APPLIED',
        jobUrl: null, location: null, salary: null, notes: null, appliedAt: null, followUpAt: null,
      })
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/applications',
      expect.objectContaining({ method: 'POST' })
    )
  })
})

describe('useDeleteApplication', () => {
  it('sends DELETE with the correct id', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValue({ ok: true, json: async () => [] })

    const { result } = renderHook(() => useDeleteApplication(), { wrapper: wrapper() })

    await act(async () => {
      result.current.mutate('app-1')
    })

    await waitFor(() => expect(result.current.isIdle).toBe(true))

    expect(fetch).toHaveBeenCalledWith(
      '/api/applications/app-1',
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})
