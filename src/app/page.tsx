'use client'
// Why 'use client'?
// This page manages the applications array in React state (useState).
// Whenever a card is dragged to a new column or deleted, we update
// that state — which triggers a re-render. State management requires
// a Client Component. If there were no interactivity, we could make
// this a Server Component and fetch from the DB directly.

import { useEffect, useState } from 'react'
import { Application } from '@/types'
import { Header } from '@/components/layout/Header'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'

export default function HomePage() {
  // `applications` is the single source of truth for the board.
  // Everything else (columns, counts, order) is derived from this array.
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  // useEffect with an empty dependency array [] runs exactly once:
  // after the component first renders (mounts) in the browser.
  // This is the standard way to trigger a data fetch on page load.
  // Think of it as "componentDidMount" from the old class-component era.
  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.json())
      .then((data: Application[]) => {
        setApplications(data)
        setLoading(false)
      })
  }, []) // ← the [] is critical: without it, this would re-run on every render (infinite loop)

  // Called by Header's ApplicationForm after a successful POST.
  // We prepend the new application to the local array so it appears
  // immediately — without a full page reload.
  function handleCreated(app: Application) {
    setApplications(prev => [app, ...prev])
  }

  // Called by KanbanBoard after a drag-and-drop.
  // The board already did the optimistic update and the API call;
  // here we just sync the parent state so everything is consistent.
  function handleBoardChange(updated: Application[]) {
    setApplications(updated)
  }

  // Called by JobCard's delete button.
  // We filter the deleted card out of local state immediately (optimistic).
  // The card's own component already fired the DELETE API call.
  function handleDelete(id: string) {
    setApplications(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header total={applications.length} onCreated={handleCreated} applications={applications} />

      <main className="flex-1 pt-4">
        {loading ? (
          // Simple loading state — in a production app you'd use
          // skeleton cards here for a better perceived performance.
          <div className="flex items-center justify-center h-64">
            <div className="flex gap-2 items-center text-slate-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading applications…</span>
            </div>
          </div>
        ) : (
          <KanbanBoard
            applications={applications}
            onChange={handleBoardChange}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  )
}
