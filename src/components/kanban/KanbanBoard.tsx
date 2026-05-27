'use client'

// DndContext  — the root provider for all drag-and-drop
// DragOverlay — renders the floating "ghost" card while dragging
// closestCorners — the collision detection algorithm: when you drag
//   a card, dnd-kit checks which droppable corner is closest to the
//   dragged card's center. This works better than the default
//   "intersect" strategy for kanban-style layouts.
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useState } from 'react'
import { Application } from '@/types'
import { KANBAN_COLUMNS } from '@/types'
import { KanbanColumn } from './KanbanColumn'
import { JobCard } from './JobCard'

interface KanbanBoardProps {
  applications: Application[]
  // The board doesn't manage its own data — it receives it from the
  // page and calls these callbacks when something changes.
  // This is called "lifting state up" — a core React pattern.
  // The page owns the data; the board just displays and mutates it.
  onChange: (updated: Application[]) => void
  onDelete: (id: string) => void
}

export function KanbanBoard({ applications, onChange, onDelete }: KanbanBoardProps) {
  // activeId tracks which card is currently being dragged.
  // We need this to render the DragOverlay (the floating ghost card).
  const [activeId, setActiveId] = useState<string | null>(null)

  // Sensors define HOW drag is initiated. PointerSensor handles both
  // mouse and touch. activationConstraint.distance means: "don't start
  // dragging until the pointer has moved 8px" — this prevents accidental
  // drags when the user just clicks on a card.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  // Find the application object that matches activeId so we can
  // render it inside DragOverlay.
  const activeApplication = activeId
    ? applications.find(a => a.id === activeId) ?? null
    : null

  // Group applications by status for rendering into columns.
  // This is a derived value — we compute it on every render from
  // the `applications` array rather than storing it in state.
  // Rule of thumb: never store in state what you can derive from state.
  function getColumnApplications(columnId: string) {
    return applications.filter(a => a.status === columnId)
  }

  function handleDragStart(event: DragStartEvent) {
    // event.active.id is the id we passed to useSortable({ id: ... })
    // in JobCard. We save it so DragOverlay knows what to render.
    setActiveId(String(event.active.id))
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null) // Clear the overlay regardless of outcome

    // `over` is null if the card was dropped outside any droppable zone
    if (!over) return

    const cardId = String(active.id)
    const newStatus = String(over.id)

    // Find the card that was dragged
    const card = applications.find(a => a.id === cardId)
    if (!card) return

    // If it was dropped in the same column it started in, do nothing
    if (card.status === newStatus) return

    // OPTIMISTIC UPDATE:
    // 1. Immediately update local state so the UI feels instant
    // 2. Fire the API call in the background
    // 3. If the API fails, we could roll back (kept simple here)
    const updated = applications.map(a =>
      a.id === cardId ? { ...a, status: newStatus as Application['status'] } : a
    )
    onChange(updated) // Tell the parent page about the new state

    // Now persist the change to the database via our PATCH route
    await fetch(`/api/applications/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    // Note: in a production app you'd catch errors here and roll back
    // the optimistic update if the fetch fails.
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 px-6 pb-6 overflow-x-auto">
        {KANBAN_COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            applications={getColumnApplications(column.id)}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* DragOverlay renders outside the normal DOM flow (via a portal),
          so it's not clipped by overflow:hidden on the columns.
          It shows a copy of the card while dragging.
          dropAnimation gives the card a smooth "snap into place" when dropped. */}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeApplication ? (
          <div className="rotate-2 scale-105 opacity-90">
            <JobCard
              application={activeApplication}
              onDelete={() => {}} // No-op: can't delete from the overlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
