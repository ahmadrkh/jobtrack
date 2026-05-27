'use client'

import { Briefcase, Plus, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ApplicationForm } from '@/components/forms/ApplicationForm'
import { Application } from '@/types'

interface HeaderProps {
  total: number
  onCreated: (app: Application) => void
}

export function Header({ total, onCreated }: HeaderProps) {
  const [open, setOpen] = useState(false)

  // ── Dark mode toggle ──────────────────────────────────────────────────────
  // We read the initial state from the <html> class (set by the anti-flash
  // script in layout.tsx) so the icon matches the actual current theme.
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Sync state with whatever the anti-flash script set on <html>
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    // Toggle the `dark` class on <html> — Tailwind reads this
    document.documentElement.classList.toggle('dark', next)
    // Persist the preference so the anti-flash script can read it on next load
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700
                       px-6 py-4 flex items-center justify-between transition-colors duration-200">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">JobTrack</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {total} application{total !== 1 ? 's' : ''} tracked
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          aria-label="Toggle dark mode"
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400
                     hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Add application */}
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
