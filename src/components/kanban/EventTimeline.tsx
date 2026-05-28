'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, ArrowRight, Plus, Loader2 } from 'lucide-react'
import { Event, EventType } from '@/types'

// ── helpers ───────────────────────────────────────────────────────────────────

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const EVENT_ICON: Record<EventType, React.ReactNode> = {
  STATUS_CHANGE: <ArrowRight className="w-3 h-3" />,
  NOTE:          <MessageSquare className="w-3 h-3" />,
  CREATED:       <Plus className="w-3 h-3" />,
}

const EVENT_COLORS: Record<EventType, string> = {
  STATUS_CHANGE: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
  NOTE:          'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  CREATED:       'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
}

// ── component ─────────────────────────────────────────────────────────────────

interface EventTimelineProps {
  applicationId: string
}

export function EventTimeline({ applicationId }: EventTimelineProps) {
  const [events, setEvents]   = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [note, setNote]       = useState('')
  const [saving, setSaving]   = useState(false)
  const inputRef              = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/applications/${applicationId}/events`)
      .then(r => r.json())
      .then((data: Event[]) => { setEvents(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [applicationId])

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim() || saving) return
    setSaving(true)
    try {
      const res = await fetch(`/api/applications/${applicationId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note.trim() }),
      })
      if (res.ok) {
        const created: Event = await res.json()
        setEvents(prev => [...prev, created])
        setNote('')
        inputRef.current?.focus()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="border-t border-slate-100 dark:border-slate-700 mt-3 pt-3 space-y-2"
      onClick={e => e.stopPropagation()}   // prevent card drag from activating
    >
      {/* Event list */}
      {loading ? (
        <div className="flex items-center gap-1.5 text-slate-400 text-xs py-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading…
        </div>
      ) : events.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 py-1">
          No activity yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {events.map(event => (
            <li key={event.id} className="flex items-start gap-2">
              {/* Icon bubble */}
              <span className={`mt-0.5 flex-shrink-0 rounded-full p-1 ${EVENT_COLORS[event.type as EventType]}`}>
                {EVENT_ICON[event.type as EventType]}
              </span>
              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                  {event.content}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {formatRelative(event.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add note input */}
      <form onSubmit={handleAddNote} className="flex gap-1.5 pt-1">
        <input
          ref={inputRef}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a note…"
          maxLength={500}
          className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-md
                     border border-slate-200 dark:border-slate-600
                     bg-white dark:bg-slate-700
                     text-slate-900 dark:text-slate-100
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition"
        />
        <button
          type="submit"
          disabled={!note.trim() || saving}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md
                     bg-blue-600 text-white
                     hover:bg-blue-700 disabled:opacity-40
                     disabled:cursor-not-allowed transition"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
        </button>
      </form>
    </div>
  )
}
