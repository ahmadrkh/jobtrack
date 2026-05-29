'use client'

import Image            from 'next/image'
import { ExternalLink, MapPin, Briefcase, CheckCircle2, Loader2, DollarSign } from 'lucide-react'
import { Button }       from '@/components/ui/button'
import { Badge }        from '@/components/ui/badge'
import { cn }           from '@/lib/utils'
import type { JobListing } from '@/app/api/jobs/route'

interface Props {
  job:        JobListing
  onSave:     (job: JobListing) => void
  saved:      boolean
  saving:     boolean
}

const JOB_TYPE_COLORS: Record<string, string> = {
  'full_time':  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'part_time':  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'contract':   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'freelance':  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
}

export function JobListingCard({ job, onSave, saved, saving }: Props) {
  const published = new Date(job.publishedAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric',
  })

  return (
    <div className={cn(
      'rounded-xl border bg-card p-4 space-y-3 hover:shadow-md transition-shadow',
      saved && 'border-green-300 dark:border-green-700',
    )}>
      {/* Top row: logo + company + date */}
      <div className="flex items-start gap-3">
        {job.logo ? (
          <Image
            src={job.logo}
            alt={`${job.company} logo`}
            width={40}
            height={40}
            className="rounded-lg border object-contain shrink-0 bg-white"
            unoptimized
          />
        ) : (
          <div className="w-10 h-10 rounded-lg border bg-muted flex items-center justify-center shrink-0">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{job.company}</p>
          <p className="text-xs text-muted-foreground">{published}</p>
        </div>
      </div>

      {/* Role */}
      <p className="font-medium leading-snug">{job.title}</p>

      {/* Chips */}
      <div className="flex flex-wrap gap-1.5">
        {job.location && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
        )}
        {job.salary && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            {job.salary}
          </span>
        )}
        {job.jobType && (
          <Badge
            variant="secondary"
            className={cn('text-xs capitalize', JOB_TYPE_COLORS[job.jobType])}
          >
            {job.jobType.replace('_', ' ')}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">{job.category}</Badge>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          asChild
        >
          <a href={job.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            View
          </a>
        </Button>

        <Button
          size="sm"
          variant={saved ? 'secondary' : 'default'}
          className="ms-auto gap-1.5"
          onClick={() => !saved && onSave(job)}
          disabled={saving || saved}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Briefcase className="h-3.5 w-3.5" />
          )}
          {saved ? 'Saved to board' : 'Add to Board'}
        </Button>
      </div>
    </div>
  )
}
