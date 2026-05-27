'use client'

import { Search, X } from 'lucide-react'
import { KANBAN_COLUMNS, Status } from '@/types'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: Status | 'ALL'
  onStatusFilterChange: (status: Status | 'ALL') => void
  total: number      // total unfiltered count
  filtered: number   // count after filtering
}

export function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  total,
  filtered,
}: FilterBarProps) {
  const isFiltered = search !== '' || statusFilter !== 'ALL'

  return (
    <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center gap-3 flex-wrap">

      {/* ── Search input ── */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search company or role…"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
        />
        {/* Clear button — only visible when there's a query */}
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Status filter pills ── */}
      {/*
        Each pill calls onStatusFilterChange with its column id.
        Clicking the active pill sets it back to 'ALL' (toggle behaviour).
        badgeColor from KANBAN_COLUMNS gives each pill its column colour
        when selected — violet for Wishlist, blue for Applied, etc.
      */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => onStatusFilterChange('ALL')}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
            statusFilter === 'ALL'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          )}
        >
          All
        </button>

        {KANBAN_COLUMNS.map(col => (
          <button
            key={col.id}
            onClick={() =>
              onStatusFilterChange(
                statusFilter === col.id ? 'ALL' : (col.id as Status)
              )
            }
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
              statusFilter === col.id
                ? col.badgeColor          // column's own colour when active
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            )}
          >
            {col.label}
          </button>
        ))}
      </div>

      {/* ── Result count — only shown while a filter is active ── */}
      {isFiltered && (
        <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">
          {filtered} of {total}
        </span>
      )}
    </div>
  )
}
