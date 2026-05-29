'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Plus, Download, BarChart2, Briefcase, MapPin, Globe2, FileText } from 'lucide-react'
import { Button }            from '@/components/ui/button'
import { ModeToggle }        from './ModeToggle'
import { UserMenu }          from './UserMenu'
import { LanguageSwitcher }  from './LanguageSwitcher'
import { GoalTracker }       from '@/components/goals/GoalTracker'
import { KeyboardShortcuts } from './KeyboardShortcuts'
import { CommandPalette }    from '@/components/command/CommandPalette'
import { AddJobDialog }      from '@/components/kanban/AddJobDialog'
import type { Application }  from '@/types'

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
  a.href = url; a.download = `jobtrack-${new Date().toISOString().slice(0, 10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export function Header({ applications = [] }: HeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const t       = useTranslations('header')
  const tNav    = useTranslations('nav')
  const tCommon = useTranslations('common')
  const locale  = useLocale()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">

        <Link href={`/${locale}`} className="flex items-center gap-2 font-semibold">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">{tCommon('appName')}</span>
        </Link>

        <nav className="flex items-center gap-1 ml-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}`}>{tNav('board')}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/stats`}>
              <BarChart2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">{tNav('stats')}</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/map`}>
              <MapPin className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Map</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/jobs`}>
              <Globe2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Jobs</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/resume`}>
              <FileText className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Résumé</span>
            </Link>
          </Button>
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {/* Weekly goal progress ring */}
          <GoalTracker />

          {applications.length > 0 && (
            <Button
              variant="outline" size="sm"
              onClick={() => exportCsv(applications)}
              aria-label={t('exportAriaLabel')}
            >
              <Download className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">{t('export')}</span>
            </Button>
          )}

          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">{t('addJob')}</span>
          </Button>

          <KeyboardShortcuts onAddJob={() => setDialogOpen(true)} />
          <LanguageSwitcher />
          <ModeToggle />
          <UserMenu />
        </div>
      </div>

      {/* Global command palette (Cmd+K) */}
      <CommandPalette
        onAddJob={() => setDialogOpen(true)}
        onExport={applications.length > 0 ? () => exportCsv(applications) : undefined}
      />

      <AddJobDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </header>
  )
}
