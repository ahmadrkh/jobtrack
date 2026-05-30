'use client'

import { useState, useCallback } from 'react'
import { Search, Loader2, Frown } from 'lucide-react'
import { Input }  from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useJobs, useSaveJob, REMOTIVE_CATEGORIES } from '@/hooks/useJobs'
import { JobListingCard } from './JobListingCard'
import type { JobListing } from '@/types/jobs'
import { cn } from '@/lib/utils'

export function JobListings() {
  const [q,        setQ]        = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [category, setCategory] = useState('')
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const [savingId, setSavingId] = useState<number | null>(null)

  // Debounce the search query to avoid a request on every keystroke
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  function handleSearch(value: string) {
    setQ(value)
    if (timer) clearTimeout(timer)
    setTimer(setTimeout(() => setDebouncedQ(value), 500))
  }

  const { data: jobs = [], isLoading, isError, refetch } = useJobs({
    q:        debouncedQ,
    category,
    limit:    30,
  })

  const saveJob = useSaveJob()

  const handleSave = useCallback(async (job: JobListing) => {
    setSavingId(job.id)
    try {
      await saveJob.mutateAsync(job)
      setSavedIds(prev => new Set(prev).add(job.id))
    } finally {
      setSavingId(null)
    }
  }, [saveJob])

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search title, company, skill…"
            value={q}
            onChange={e => handleSearch(e.target.value)}
            className="ps-9"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {REMOTIVE_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                category === cat.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <Frown className="h-10 w-10 opacity-40" />
          <p className="text-sm">Failed to load jobs.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
        </div>
      )}

      {!isLoading && !isError && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
          <p className="text-sm">No jobs found for this search.</p>
        </div>
      )}

      {!isLoading && !isError && jobs.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {jobs.length} remote jobs · powered by{' '}
            <a href="https://remotive.com" target="_blank" rel="noopener noreferrer" className="underline">
              Remotive
            </a>
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map(job => (
              <JobListingCard
                key={job.id}
                job={job}
                onSave={handleSave}
                saved={savedIds.has(job.id)}
                saving={savingId === job.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
