'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { JobCard } from './JobCard'
import type { Application, KanbanColumn as KanbanColumnType } from '@/types'

interface KanbanColumnProps {
  column: KanbanColumnType
  applications: Application[]
}

export function KanbanColumn({ column, applications }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col w-[17rem] flex-shrink-0">
      {/* Column header */}
      <div className={cn(
        'flex items-center justify-between px-3 py-2 rounded-t-xl',
        column.headerColor
      )}>
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', column.dotColor)} />
          <span className="text-sm font-semibold">{column.label}</span>
        </div>
        <Badge
          className={cn('text-xs font-medium border-0', column.badgeColor)}
          variant="outline"
        >
          {applications.length}
        </Badge>
      </div>

      {/* Drop zone */}
      <SortableContext
        items={applications.map(a => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <ScrollArea
          className={cn(
            'flex-1 min-h-[120px] rounded-b-xl transition-all',
            column.columnBg,
            isOver && 'ring-2 ring-primary/40 ring-inset'
          )}
        >
          <div
            ref={setNodeRef}
            className="p-2 space-y-2 min-h-[120px]"
          >
            {applications.map(app => (
              <JobCard key={app.id} application={app} />
            ))}

            {applications.length === 0 && (
              <div className="flex items-center justify-center h-20 border-2 border-dashed border-border rounded-lg">
                <p className="text-xs text-muted-foreground">Drop here</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SortableContext>
    </div>
  )
}
