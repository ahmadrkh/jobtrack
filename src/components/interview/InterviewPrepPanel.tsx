'use client'

// Interview prep panel — stored in localStorage keyed by applicationId.
// No server round-trip; purely client-side. Keeps things fast and avoids
// a new DB table for what is essentially personal scratch notes.
//
// Contains:
//   1. Research checklist (standard items + custom)
//   2. Questions to ask the interviewer
//   3. STAR-method notes (Situation, Task, Action, Result)

import { useState, useEffect, useCallback } from 'react'
import { ClipboardList, ChevronDown, ChevronUp, Plus, X, CheckSquare, Square } from 'lucide-react'
import { Button }    from '@/components/ui/button'
import { Input }     from '@/components/ui/input'
import { Textarea }  from '@/components/ui/textarea'
import { cn }        from '@/lib/utils'

// ── Default checklist items ───────────────────────────────────────────────────

const DEFAULT_CHECKLIST = [
  'Research the company mission and values',
  'Read recent news about the company',
  'Review the job description thoroughly',
  'Prepare answers for common behavioural questions',
  'Prepare 3–5 questions to ask the interviewer',
  'Review your résumé and be ready to discuss each point',
  'Research typical salary for this role',
  'Plan your route / test the video call setup',
]

interface CheckItem {
  id:      string
  text:    string
  checked: boolean
  custom:  boolean
}

interface PrepData {
  checklist:  CheckItem[]
  questions:  string
  starNotes:  string
}

function loadPrep(applicationId: string): PrepData {
  try {
    const raw = localStorage.getItem(`prep_${applicationId}`)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }

  return {
    checklist: DEFAULT_CHECKLIST.map((text, i) => ({
      id: `default_${i}`, text, checked: false, custom: false,
    })),
    questions: '',
    starNotes: '',
  }
}

function savePrep(applicationId: string, data: PrepData) {
  try {
    localStorage.setItem(`prep_${applicationId}`, JSON.stringify(data))
  } catch { /* ignore */ }
}

interface Props {
  applicationId: string
  company:       string
}

export function InterviewPrepPanel({ applicationId, company }: Props) {
  const [open,    setOpen]    = useState(false)
  const [data,    setData]    = useState<PrepData | null>(null)
  const [newItem, setNewItem] = useState('')

  // Load from localStorage once panel opens
  useEffect(() => {
    if (open && !data) {
      setData(loadPrep(applicationId))
    }
  }, [open, applicationId, data])

  const update = useCallback((next: PrepData) => {
    setData(next)
    savePrep(applicationId, next)
  }, [applicationId])

  function toggleCheck(id: string) {
    if (!data) return
    update({
      ...data,
      checklist: data.checklist.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    })
  }

  function addCustomItem() {
    if (!data || !newItem.trim()) return
    update({
      ...data,
      checklist: [...data.checklist, {
        id: `custom_${Date.now()}`, text: newItem.trim(), checked: false, custom: true,
      }],
    })
    setNewItem('')
  }

  function removeItem(id: string) {
    if (!data) return
    update({ ...data, checklist: data.checklist.filter(i => i.id !== id) })
  }

  const doneCount  = data?.checklist.filter(i => i.checked).length ?? 0
  const totalCount = data?.checklist.length ?? 0

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          Interview Prep
          {totalCount > 0 && (
            <span className={cn(
              'rounded-full px-1.5 text-xs',
              doneCount === totalCount
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                : 'bg-muted text-muted-foreground',
            )}>
              {doneCount}/{totalCount}
            </span>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && data && (
        <div className="border-t divide-y">
          {/* Checklist */}
          <div className="p-3 space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Research Checklist
            </p>
            {data.checklist.map(item => (
              <div key={item.id} className="flex items-start gap-2 group">
                <button
                  onClick={() => toggleCheck(item.id)}
                  className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary"
                >
                  {item.checked
                    ? <CheckSquare className="h-4 w-4 text-green-500" />
                    : <Square className="h-4 w-4" />}
                </button>
                <span className={cn('text-sm flex-1', item.checked && 'line-through text-muted-foreground')}>
                  {item.text}
                </span>
                {item.custom && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}

            {/* Add custom item */}
            <div className="flex gap-1.5 mt-2">
              <Input
                className="h-7 text-xs flex-1"
                placeholder="Add custom item…"
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomItem()}
              />
              <Button size="sm" variant="outline" className="h-7 px-2" onClick={addCustomItem}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Questions to ask */}
          <div className="p-3 space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Questions to Ask
            </label>
            <Textarea
              className="text-xs min-h-[80px] resize-y"
              placeholder={`What does success look like in the first 90 days at ${company}?\nHow does the team handle disagreements?\nWhat are the biggest challenges this role will face?`}
              value={data.questions}
              onChange={e => update({ ...data, questions: e.target.value })}
            />
          </div>

          {/* STAR method notes */}
          <div className="p-3 space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              STAR Method Notes
            </label>
            <p className="text-xs text-muted-foreground">
              Situation · Task · Action · Result — prepare 2–3 stories for behavioural questions.
            </p>
            <Textarea
              className="text-xs min-h-[100px] resize-y font-mono"
              placeholder="S: Led a team of 4 during a production outage…&#10;T: Needed to restore service within 2 hours…&#10;A: Coordinated rollback, identified root cause…&#10;R: Resolved in 45 min, wrote post-mortem"
              value={data.starNotes}
              onChange={e => update({ ...data, starNotes: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Saved automatically to your browser.</p>
          </div>
        </div>
      )}
    </div>
  )
}
