'use client'

import { useEffect, useState, useMemo } from 'react'
import { Application, Status } from '@/types'
import { Header } from '@/components/layout/Header'
import { FilterBar } from '@/components/layout/FilterBar'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'

export default function HomePage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  // ── Filter state ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL')

  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.json())
      .then((data: Application[]) => {
        setApplications(data)
        setLoading(false)
      })
  }, [])

  // ── Derived filtered list ─────────────────────────────────────────────────
  // We NEVER store filteredApplications in state — we compute it from the
  // source of truth (`applications`) every render. This is called a
  // "derived value". useMemo caches the result so it only recomputes when
  // `applications`, `search`, or `statusFilter` actually change.
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const q = search.toLowerCase()
      const matchesSearch =
        q === '' ||
        app.company.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === 'ALL' || app.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [applications, search, statusFilter])

  function handleCreated(app: Application) {
    setApplications(prev => [app, ...prev])
  }

  // ── Merge board updates back into the full list ───────────────────────────
  // KanbanBoard works on `filteredApplications` (a subset).
  // When a drag-drop happens, it calls onChange with an updated subset.
  // We need to merge those changes back into the full `applications` array
  // without losing the cards that were filtered out.
  function handleBoardChange(updated: Application[]) {
    setApplications(prev =>
      prev.map(app => updated.find(u => u.id === app.id) ?? app)
    )
  }

  function handleDelete(id: string) {
    setApplications(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header total={applications.length} onCreated={handleCreated} />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        total={applications.length}
        filtered={filteredApplications.length}
      />

      <main className="flex-1 pt-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex gap-2 items-center text-slate-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading applications…</span>
            </div>
          </div>
        ) : filteredApplications.length === 0 && (search || statusFilter !== 'ALL') ? (
          // Empty search state
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-slate-400">
            <span className="text-4xl">🔍</span>
            <p className="text-sm font-medium">No applications match your filters</p>
            <button
              onClick={() => { setSearch(''); setStatusFilter('ALL') }}
              className="text-xs text-blue-500 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <KanbanBoard
            applications={filteredApplications}
            onChange={handleBoardChange}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  )
}
