// TanStack Table column definitions.
//
// Keeping columns in a separate file (the "column definition" pattern) means:
// - The table component stays lean — it only handles rendering
// - Columns are independently testable
// - You can add/remove/reorder columns without touching the table component
// This maps to the "Atomic Design" requirement: columns are atoms that
// compose into the table organism.

'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, ExternalLink, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, cn } from '@/lib/utils'
import type { Application } from '@/types'

// Status badge colour map — mirrors the Kanban column colours
const STATUS_STYLE: Record<Application['status'], string> = {
  WISHLIST:     'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  APPLIED:      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  PHONE_SCREEN: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  INTERVIEW:    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  OFFER:        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  REJECTED:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

const STATUS_LABEL: Record<Application['status'], string> = {
  WISHLIST: 'Wishlist', APPLIED: 'Applied', PHONE_SCREEN: 'Phone Screen',
  INTERVIEW: 'Interview', OFFER: 'Offer', REJECTED: 'Rejected',
}

// Sortable header — renders an ArrowUpDown button; clicking toggles sort direction
function SortableHeader({ column, label }: { column: any; label: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-medium text-muted-foreground hover:text-foreground"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
    </Button>
  )
}

export const columns: ColumnDef<Application>[] = [
  // ── Company ──────────────────────────────────────────────────────────────
  {
    accessorKey: 'company',
    header: ({ column }) => <SortableHeader column={column} label="Company" />,
    cell: ({ row }) => {
      const app = row.original
      return (
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium text-sm leading-tight">{app.company}</p>
            {app.location && (
              <p className="text-xs text-muted-foreground">{app.location}</p>
            )}
          </div>
          {app.jobUrl && (
            <a
              href={app.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={e => e.stopPropagation()}
              aria-label="Open job posting"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )
    },
  },

  // ── Role ─────────────────────────────────────────────────────────────────
  {
    accessorKey: 'role',
    header: ({ column }) => <SortableHeader column={column} label="Role" />,
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },

  // ── Status ───────────────────────────────────────────────────────────────
  {
    accessorKey: 'status',
    header: ({ column }) => <SortableHeader column={column} label="Status" />,
    cell: ({ getValue }) => {
      const status = getValue() as Application['status']
      return (
        <span className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
          STATUS_STYLE[status]
        )}>
          {STATUS_LABEL[status]}
        </span>
      )
    },
    // Custom sort order — follows pipeline progression, not alphabetical
    sortingFn: (rowA, rowB) => {
      const order = ['WISHLIST','APPLIED','PHONE_SCREEN','INTERVIEW','OFFER','REJECTED']
      return order.indexOf(rowA.original.status) - order.indexOf(rowB.original.status)
    },
    filterFn: (row, _id, value: string[]) =>
      value.length === 0 || value.includes(row.original.status),
  },

  // ── Salary ───────────────────────────────────────────────────────────────
  {
    accessorKey: 'salary',
    header: 'Salary',
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {(getValue() as string | null) ?? '—'}
      </span>
    ),
  },

  // ── Applied At ───────────────────────────────────────────────────────────
  {
    accessorKey: 'appliedAt',
    header: ({ column }) => <SortableHeader column={column} label="Applied" />,
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(getValue() as string | null)}
      </span>
    ),
  },

  // ── Follow-up ────────────────────────────────────────────────────────────
  {
    accessorKey: 'followUpAt',
    header: 'Follow-up',
    cell: ({ getValue }) => {
      const val = getValue() as string | null
      if (!val) return <span className="text-muted-foreground text-sm">—</span>
      const days = Math.ceil(
        (new Date(val).setHours(0,0,0,0) - new Date().setHours(0,0,0,0))
        / (1000 * 60 * 60 * 24)
      )
      return (
        <span className={cn(
          'flex items-center gap-1 text-xs font-medium',
          days <= 0 ? 'text-orange-600 dark:text-orange-400' :
          days <= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-muted-foreground'
        )}>
          <Bell className="h-3 w-3" />
          {formatDate(val)}
        </span>
      )
    },
  },

  // ── Updated ──────────────────────────────────────────────────────────────
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <SortableHeader column={column} label="Updated" />,
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(getValue() as string)}
      </span>
    ),
  },
]
