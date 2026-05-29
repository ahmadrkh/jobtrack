'use client'

// KanbanBoard — orchestrates drag-and-drop across columns.
//
// Architecture notes:
// - DndContext lives here (top of the dnd tree)
// - useMoveApplication from TanStack Query handles optimistic status updates
// - SortableContext lives inside each KanbanColumn
// - Active drag item is rendered via DragOverlay for smooth 60fps previews
// - Data is fetched via useApplications (TanStack Query) — no prop drilling

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  closestCenter,
} from '@dnd-kit/core'
import { useState, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { KanbanColumn } from './KanbanColumn'
import { JobCard } from './JobCard'
import { FilterBar } from '@/components/layout/FilterBar'
import { useApplications, useMoveApplication } from '@/hooks/useApplications'
import { KANBAN_COLUMNS } from '@/types'
import type { Application, Status } from '@/types'

export function KanbanBoard() {
  const { data: applications = [], isLoading, isError } = useApplications()
  const moveApp = useMoveApplication()

  const [activeApp, setActiveApp]     = useState<Application | null>(null)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL')

  // Sensors — require 8px pointer movement before starting drag.
  // Without this threshold, clicks on buttons inside cards would
  // accidentally initiate drags.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return applications.filter(a => {
      const matchesSearch =
        !q ||
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        (a.location ?? '').toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [applications, search, statusFilter])

  function handleDragStart({ active }: DragStartEvent) {
    const app = applications.find(a => a.id === active.id)
    setActiveApp(app ?? null)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveApp(null)
    if (!over) return

    const newStatus = over.id as Status
    const app = applications.find(a => a.id === active.id)
    if (!app || app.status === newStatus) return

    // Optimistic update handled inside useMoveApplication
    moveApp.mutate({ id: app.id, status: newStatus })
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-destructive text-sm">
        Failed to load applications. Please refresh.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Filter bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={applications.length}
        filteredCount={filtered.length}
      />

      {/* Board — horizontally scrollable, snaps on mobile */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden kanban-board-scroll">
          <div className="flex gap-4 p-4 h-full min-w-max">
            {KANBAN_COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                column={col}
                applications={filtered.filter(a => a.status === col.id)}
              />
            ))}
          </div>
        </div>

        {/* Drag overlay — renders the card being dragged at full opacity
            while the original fades out (handled by isDragging in JobCard) */}
        <DragOverlay>
          {activeApp && (
            <div className="rotate-2 shadow-2xl">
              <JobCard application={activeApp} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
