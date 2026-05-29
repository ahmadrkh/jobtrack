'use client'

// Header WITHOUT next-intl — use this on branches that don't have feat/i18n.
// Copy this over Header.tsx on: refactor/modern-stack, feat/auth,
// feat/reminders, feat/list-view, feat/testing, feat/pwa.
//
// cp src/components/layout/Header.no-intl.tsx src/components/layout/Header.tsx

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Download, BarChart2, Briefcase } from 'lucide-react'
import { Button }       from '@/components/ui/button'
import { ModeToggle }   from './ModeToggle'
import { UserMenu }     from './UserMenu'
import { AddJobDialog } from '@/components/kanban/AddJobDialog'
import type { Application } from '@/types'

interface HeaderProps {
  applications?: Application[]
}

function exportCsv(applications: Application[]) {
  const headers = ['Company', 'Role', 'Status', 'Location', 'Salary', 'Applied At', 'Job URL', 'Notes']
  const rows = applications.map(a => [
    a.company, a.role, a.status, a.location ?? '',
    a.salary ?? '', a.appliedAt ?? '', a.jobUrl ?? '', a.notes ?? '',
  ])
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `jobtrack-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function Header({ applications = [] }: HeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">

        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">JobTrack</span>
        </Link>

        <nav className="flex items-center gap-1 ml-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Board</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/stats">
              <BarChart2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Stats</span>
            </Link>
          </Button>
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {applications.length > 0 && (
            <Button
              variant="outline" size="sm"
              onClick={() => exportCsv(applications)}
              aria-label="Export CSV"
            >
              <Download className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Add Job</span>
          </Button>
          <ModeToggle />
          <UserMenu />
        </div>
      </div>

      <AddJobDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </header>
  )
}
