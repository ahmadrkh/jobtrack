'use client'

// feat/export-csv version of Header.
// Changes from main:
//   - Added `applications` prop
//   - Added exportCSV() helper that builds a CSV string and triggers download
//   - Added "Export CSV" button next to "Add Application"

import { Briefcase, Plus, Download } from 'lucide-react'
import { useState } from 'react'
import { ApplicationForm } from '@/components/forms/ApplicationForm'
import { Application } from '@/types'

interface HeaderProps {
  total: number
  onCreated: (app: Application) => void
  applications: Application[]   // needed to build the CSV
}

// ── CSV export ──────────────────────────────────────────────────────────────
// Pure client-side — no API call needed.
// 1. Build a 2D array of [headers, ...rows]
// 2. Join each row with commas, wrap cells in quotes to handle commas/newlines
// 3. Wrap as a Blob, create an object URL, click a hidden <a> to download
// 4. Revoke the URL to free memory
function exportCSV(applications: Application[]) {
  const headers = [
    'Company', 'Role', 'Status', 'Location',
    'Salary', 'Job URL', 'Notes', 'Applied At', 'Created At',
  ]

  const rows = applications.map(app => [
    app.company,
    app.role,
    app.status,
    app.location  ?? '',
    app.salary    ?? '',
    app.jobUrl    ?? '',
    app.notes     ?? '',
    app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '',
    new Date(app.createdAt).toLocaleDateString(),
  ])

  // RFC 4180 CSV: cells wrapped in double-quotes, internal quotes doubled
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `jobtrack-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function Header({ total, onCreated, applications }: HeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">JobTrack</h1>
          <p className="text-xs text-slate-500">{total} application{total !== 1 ? 's' : ''} tracked</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => exportCSV(applications)}
          disabled={applications.length === 0}
          className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50
                     disabled:opacity-40 disabled:cursor-not-allowed
                     text-slate-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      <ApplicationForm
        open={open}
        onOpenChange={setOpen}
        onSuccess={(app) => { onCreated(app); setOpen(false) }}
      />
    </header>
  )
}
