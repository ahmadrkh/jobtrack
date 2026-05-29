import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { JobListing } from '@/app/api/jobs/route'
import type { Application } from '@/types'

// ── Fetch job listings ────────────────────────────────────────────────────────

interface JobFilters {
  q?:       string
  category?: string
  limit?:   number
}

async function fetchJobs(filters: JobFilters): Promise<JobListing[]> {
  const params = new URLSearchParams()
  if (filters.q)        params.set('q',        filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.limit)    params.set('limit',    String(filters.limit))

  const res  = await fetch(`/api/jobs?${params}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to fetch')
  return data.jobs
}

export function useJobs(filters: JobFilters = {}) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn:  () => fetchJobs(filters),
    staleTime: 5 * 60_000,
  })
}

// ── Save a job listing to the board (Wishlist) ────────────────────────────────

export function useSaveJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (listing: JobListing) => {
      const body: Partial<Application> = {
        company:   listing.company,
        role:      listing.title,
        status:    'WISHLIST',
        jobUrl:    listing.url,
        location:  listing.location !== 'Remote' ? listing.location : null,
        salary:    listing.salary || null,
        notes:     null,
        appliedAt: null,
      }
      const res  = await fetch('/api/applications', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      // Invalidate the applications cache so the board shows the new card
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

// ── Fetch Remotive categories ─────────────────────────────────────────────────

export const REMOTIVE_CATEGORIES = [
  { value: '',                 label: 'All categories' },
  { value: 'software-dev',    label: 'Software Development' },
  { value: 'devops',          label: 'DevOps / Sysadmin' },
  { value: 'design',          label: 'Design' },
  { value: 'product',         label: 'Product' },
  { value: 'data',            label: 'Data' },
  { value: 'marketing',       label: 'Marketing' },
  { value: 'customer-support', label: 'Customer Support' },
  { value: 'sales',           label: 'Sales' },
  { value: 'writing',         label: 'Writing' },
  { value: 'qa',              label: 'QA' },
  { value: 'management',      label: 'Management & Finance' },
  { value: 'hr',              label: 'HR' },
] as const
