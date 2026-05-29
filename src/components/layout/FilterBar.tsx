'use client'

import { Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { KANBAN_COLUMNS } from '@/types'
import type { Status } from '@/types'
import { Input }  from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn }     from '@/lib/utils'

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: Status | 'ALL'
  onStatusFilterChange: (status: Status | 'ALL') => void
  totalCount: number
  filteredCount: number
}

export function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const t  = useTranslations('filter')
  const tS = useTranslations('status')
  const isFiltered = search !== '' || statusFilter !== 'ALL'

  return (
    <div className="px-4 sm:px-6 py-2.5 border-b bg-background flex items-center gap-3 flex-wrap">

      {/* Search */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="ps-8 pe-8 h-8 text-sm"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={t('clearSearch')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => onStatusFilterChange('ALL')}
          className={cn(
            'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors',
            statusFilter === 'ALL'
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {t('allStatuses')}
        </button>

        {KANBAN_COLUMNS.map(col => (
          <button
            key={col.id}
            onClick={() => onStatusFilterChange(statusFilter === col.id ? 'ALL' : col.id)}
            className={cn(
              'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors',
              statusFilter === col.id
                ? col.badgeColor
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {tS(col.id)}
          </button>
        ))}
      </div>

      {/* Count */}
      {isFiltered && (
        <span className="ms-auto text-xs text-muted-foreground whitespace-nowrap">
          {t('showing', { filtered: filteredCount, total: totalCount })}
        </span>
      )}
    </div>
  )
}
