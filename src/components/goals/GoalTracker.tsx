'use client'

// Weekly application goal tracker.
// Goal is stored in localStorage (no DB round-trip).
// Progress is computed from TanStack Query cache (applications applied this week).
//
// Renders a compact SVG progress ring that lives in the header.
// Clicking it opens a settings popover to change the weekly target.

import { useState, useEffect } from 'react'
import { useApplications } from '@/hooks/useApplications'
import { Target } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn }     from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

function startOfWeek(): Date {
  const d = new Date()
  // Monday as week start
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function loadGoal(): number {
  try { return parseInt(localStorage.getItem('weeklyGoal') ?? '5', 10) || 5 }
  catch { return 5 }
}

function saveGoal(n: number) {
  try { localStorage.setItem('weeklyGoal', String(n)) }
  catch { /* ignore */ }
}

// ── Ring SVG ──────────────────────────────────────────────────────────────────

function ProgressRing({ progress, size = 36 }: { progress: number; size?: number }) {
  const r   = (size - 4) / 2
  const circ = 2 * Math.PI * r
  const dash = Math.min(progress, 1) * circ
  const color = progress >= 1 ? '#22c55e' : progress >= 0.5 ? '#f59e0b' : '#3b82f6'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="currentColor" strokeWidth="3"
        className="text-muted-foreground/20"
      />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function GoalTracker() {
  const [goal,      setGoal]      = useState(5)
  const [inputGoal, setInputGoal] = useState('5')
  const [open,      setOpen]      = useState(false)
  const { data: applications = [] } = useApplications()

  useEffect(() => {
    const g = loadGoal()
    setGoal(g)
    setInputGoal(String(g))
  }, [])

  // Applications submitted this week (status moved away from WISHLIST + have appliedAt this week)
  const weekStart   = startOfWeek()
  const thisWeek    = applications.filter(a => {
    if (!a.appliedAt) return false
    return new Date(a.appliedAt) >= weekStart
  }).length

  const progress    = goal > 0 ? thisWeek / goal : 0
  const isComplete  = thisWeek >= goal

  function applyGoal() {
    const n = Math.max(1, Math.min(50, parseInt(inputGoal, 10) || 5))
    setGoal(n)
    setInputGoal(String(n))
    saveGoal(n)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex items-center justify-center rounded-full hover:bg-muted transition-colors p-0.5"
          aria-label={`Weekly goal: ${thisWeek} of ${goal} applications`}
          title={`${thisWeek}/${goal} applications this week`}
        >
          <ProgressRing progress={progress} size={34} />
          {/* Centre label */}
          <span className={cn(
            'absolute text-[9px] font-bold tabular-nums',
            isComplete ? 'text-green-500' : 'text-foreground',
          )}>
            {thisWeek}/{goal}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-4 space-y-3" align="end">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <p className="font-semibold text-sm">Weekly Goal</p>
        </div>

        <p className="text-xs text-muted-foreground">
          {isComplete
            ? `🎉 Goal reached! You've applied to ${thisWeek} jobs this week.`
            : `${thisWeek} of ${goal} applications this week. Keep going!`}
        </p>

        {/* Streak */}
        <div className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2">
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums">{thisWeek}</p>
            <p className="text-[10px] text-muted-foreground">this week</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums">{applications.length}</p>
            <p className="text-[10px] text-muted-foreground">total</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums">
              {applications.filter(a => a.status === 'OFFER').length}
            </p>
            <p className="text-[10px] text-muted-foreground">offers</p>
          </div>
        </div>

        {/* Change goal */}
        <div className="space-y-1.5">
          <Label className="text-xs">Applications per week</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              max={50}
              className="h-8 text-sm"
              value={inputGoal}
              onChange={e => setInputGoal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyGoal()}
            />
            <Button size="sm" className="h-8" onClick={applyGoal}>Set</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
