'use client'

// Global command palette — triggered by Cmd+K / Ctrl+K.
// Uses the `cmdk` library (same one Shadcn's Command component wraps).
// Shows:
//   - All applications (fuzzy search by company + role)
//   - Navigation actions (Board, Stats, Map, Jobs, Résumé)
//   - Quick actions (Add Job, Export CSV)

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Briefcase, BarChart2, MapPin, Globe2, FileText,
  Plus, Download, ArrowRight, Building2,
} from 'lucide-react'
import { useApplications } from '@/hooks/useApplications'
import { KANBAN_COLUMNS } from '@/types'

// Status dot colours matching KANBAN_COLUMNS
const STATUS_DOT: Record<string, string> = {
  WISHLIST:     'bg-slate-400',
  APPLIED:      'bg-blue-400',
  PHONE_SCREEN: 'bg-violet-400',
  INTERVIEW:    'bg-cyan-400',
  OFFER:        'bg-green-400',
  REJECTED:     'bg-red-400',
}

interface Props {
  onAddJob?: () => void
  onExport?: () => void
}

export function CommandPalette({ onAddJob, onExport }: Props) {
  const [open, setOpen] = useState(false)
  const router          = useRouter()
  const locale          = useLocale()
  const { data: applications = [] } = useApplications()

  // Register Cmd+K / Ctrl+K globally
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const navigate = useCallback((path: string) => {
    router.push(`/${locale}${path}`)
    setOpen(false)
  }, [router, locale])

  function runAction(fn?: () => void) {
    fn?.()
    setOpen(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search applications, navigate, or run an action…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Applications */}
        {applications.length > 0 && (
          <CommandGroup heading="Applications">
            {applications.slice(0, 8).map(app => (
              <CommandItem
                key={app.id}
                value={`${app.company} ${app.role}`}
                onSelect={() => {
                  // Navigate to board and highlight — for now just close
                  navigate('/')
                }}
                className="gap-2"
              >
                <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[app.status] ?? 'bg-muted'}`} />
                <span className="font-medium truncate">{app.company}</span>
                <span className="text-muted-foreground truncate">— {app.role}</span>
                <ArrowRight className="h-3 w-3 ms-auto text-muted-foreground shrink-0" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => navigate('/')} className="gap-2">
            <Briefcase className="h-4 w-4" />
            Board
            <CommandShortcut>B</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/stats')} className="gap-2">
            <BarChart2 className="h-4 w-4" />
            Stats
          </CommandItem>
          <CommandItem onSelect={() => navigate('/map')} className="gap-2">
            <MapPin className="h-4 w-4" />
            Map
          </CommandItem>
          <CommandItem onSelect={() => navigate('/jobs')} className="gap-2">
            <Globe2 className="h-4 w-4" />
            Find Jobs
          </CommandItem>
          <CommandItem onSelect={() => navigate('/resume')} className="gap-2">
            <FileText className="h-4 w-4" />
            My Résumé
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Actions */}
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runAction(onAddJob)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add new application
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          {onExport && (
            <CommandItem onSelect={() => runAction(onExport)} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </CommandItem>
          )}
        </CommandGroup>

        {/* Status filter shortcuts */}
        <CommandSeparator />
        <CommandGroup heading="Filter by status">
          {KANBAN_COLUMNS.map(col => (
            <CommandItem
              key={col.id}
              value={`filter ${col.label}`}
              onSelect={() => {
                navigate(`/?status=${col.id}`)
              }}
              className="gap-2"
            >
              <span className={`inline-block w-2 h-2 rounded-full ${col.dotColor}`} />
              {col.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
