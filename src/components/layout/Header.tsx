'use client'

import { Briefcase, Plus } from 'lucide-react'
import { useState } from 'react'
import { ApplicationForm } from '@/components/forms/ApplicationForm'
import { Application } from '@/types'

interface HeaderProps {
  total: number
  onCreated: (app: Application) => void
}

export function Header({ total, onCreated }: HeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">JobTrack</h1>
          <p className="text-xs text-slate-500">{total} application{total !== 1 ? 's' : ''} tracked</p>
        </div>
      </div>

      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Application
      </button>

      <ApplicationForm
        open={open}
        onOpenChange={setOpen}
        onSuccess={(app) => { onCreated(app); setOpen(false) }}
      />
    </header>
  )
}
