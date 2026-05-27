'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Application } from '@/types'
import { KanbanColumn as KanbanColumnType } from '@/types'
import { JobCard } from './JobCard'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  column: KanbanColumnType
  applications: Application[]
  onDelete: (id: string) => void
  onEdit: (app: Application) => void
}

export function KanbanColumn({ column, applications, onDelete, onEdit }: KanbanColumnProps) {
  // useDroppable makes this DOM element a valid drop target.
  // The `id` we pass here is the same value we'll read in `onDragEnd`
  // inside KanbanBoard to know which column the card was dropped into.
  // `setNodeRef` attaches the droppable behaviour to our div.
  // `isOver` is true while a dragged card is hovering above this column
  // — we use it for the subtle highlight effect below.
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column header */}
      <div className={cn('flex items-center justify-between px-3 py-2 rounded-t-xl', column.headerColor)}>
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', column.dotColor)} />
          <span className="text-sm font-semibold text-slate-700">{column.label}</span>
        </div>
        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded-full',
          column.badgeColor
        )}>
          {applications.length}
        </span>
      </div>

      {/* Droppable + scrollable card list */}
      {/*
        SortableContext wraps all the draggable items in this column.
        `items` must be an array of the IDs of the items inside it —
        not the full objects, just the IDs. dnd-kit uses these to
        figure out order and animate placeholders as you drag.
      */}
      <SortableContext
        items={applications.map(a => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            'flex-1 min-h-[120px] p-2 space-y-2 rounded-b-xl transition-colors kanban-scroll overflow-y-auto max-h-[calc(100vh-180px)]',
            column.columnBg,
            isOver && 'ring-2 ring-blue-400 ring-inset'
          )}
        >
          {applications.map(app => (
            <JobCard
              key={app.id}
              application={app}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}

          {/* Empty state — gives the column visual height when empty
              so the user has somewhere to drop cards */}
          {applications.length === 0 && (
            <div className="flex items-center justify-center h-20 border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-xs text-slate-400">Drop here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
