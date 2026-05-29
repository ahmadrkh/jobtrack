'use client'

// Shown inside AddJobDialog when a likely duplicate is detected.
// The user can dismiss the warning and proceed, or cancel to go back.

import { AlertTriangle } from 'lucide-react'
import type { DuplicateMatch } from '@/lib/duplicates'
import { KANBAN_COLUMNS } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  matches:   DuplicateMatch[]
  onDismiss: () => void
}

export function DuplicateWarning({ matches, onDismiss }: Props) {
  if (matches.length === 0) return null

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30 p-3 space-y-2">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
        <div className="space-y-1 flex-1">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            Possible duplicate{matches.length > 1 ? 's' : ''} detected
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            You may have already applied to a similar position:
          </p>
        </div>
      </div>

      <div className="space-y-1.5 ms-6">
        {matches.map(({ application: a, score }) => {
          const col = KANBAN_COLUMNS.find(c => c.id === a.status)
          return (
            <div key={a.id} className="flex items-center gap-2 text-xs">
              <span className={cn('inline-block w-1.5 h-1.5 rounded-full shrink-0', col?.dotColor)} />
              <span className="font-medium">{a.company}</span>
              <span className="text-yellow-600 dark:text-yellow-500">—</span>
              <span className="text-yellow-700 dark:text-yellow-400">{a.role}</span>
              <span className="ms-auto text-yellow-500">
                {Math.round(score * 100)}% similar
              </span>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="ms-6 text-xs text-yellow-700 dark:text-yellow-400 underline hover:no-underline"
      >
        It's different — proceed anyway
      </button>
    </div>
  )
}
