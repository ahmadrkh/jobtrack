'use client'

// Global keyboard shortcut handler + ? key help overlay.
// Mount once at the app level (in BoardOrListView or layout).
//
// Shortcuts:
//   ?          → open/close this help overlay
//   Cmd/Ctrl+K → command palette (handled in CommandPalette.tsx)
//   Cmd/Ctrl+N → add new job dialog (fires custom event)
//   b          → navigate to Board
//   s          → navigate to Stats
//   m          → navigate to Map
//   j          → navigate to Jobs
//   r          → navigate to Résumé
//   Escape     → close any open dialog / this overlay

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'

interface Shortcut {
  keys:        string[]
  description: string
  group:       string
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ['b'],       description: 'Go to Board',           group: 'Navigation' },
  { keys: ['s'],       description: 'Go to Stats',           group: 'Navigation' },
  { keys: ['m'],       description: 'Go to Map',             group: 'Navigation' },
  { keys: ['j'],       description: 'Go to Find Jobs',       group: 'Navigation' },
  { keys: ['r'],       description: 'Go to Résumé',          group: 'Navigation' },
  // Actions
  { keys: ['⌘', 'K'], description: 'Open command palette',  group: 'Actions' },
  { keys: ['⌘', 'N'], description: 'Add new application',   group: 'Actions' },
  { keys: ['?'],       description: 'Toggle this help',      group: 'Actions' },
  { keys: ['Esc'],     description: 'Close dialog / panel',  group: 'Actions' },
]

// Group shortcuts
const GROUPS = Array.from(new Set(SHORTCUTS.map(s => s.group)))

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono font-medium min-w-[1.5rem]">
      {children}
    </kbd>
  )
}

interface Props {
  onAddJob?: () => void
}

export function KeyboardShortcuts({ onAddJob }: Props) {
  const [open,   setOpen]   = useState(false)
  const router              = useRouter()
  const locale              = useLocale()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't fire shortcuts while typing in an input
      const tag = (e.target as HTMLElement).tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return

      // ? → toggle help
      if (e.key === '?') { e.preventDefault(); setOpen(o => !o); return }

      // Cmd/Ctrl+N → add job
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        onAddJob?.()
        return
      }

      // Single-key nav (no modifier)
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return

      switch (e.key) {
        case 'b': router.push(`/${locale}`);         break
        case 's': router.push(`/${locale}/stats`);   break
        case 'm': router.push(`/${locale}/map`);     break
        case 'j': router.push(`/${locale}/jobs`);    break
        case 'r': router.push(`/${locale}/resume`);  break
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [router, locale, onAddJob])

  return (
    <>
      {/* Keyboard icon in header (optional trigger) */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted h-8 w-8 transition-colors"
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {GROUPS.map(group => (
              <div key={group}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {group}
                </p>
                <div className="space-y-1.5">
                  {SHORTCUTS.filter(s => s.group === group).map(s => (
                    <div key={s.description} className="flex items-center justify-between">
                      <span className="text-sm">{s.description}</span>
                      <div className="flex items-center gap-1">
                        {s.keys.map(k => <Kbd key={k}>{k}</Kbd>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Shortcuts are disabled while typing in an input field.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
