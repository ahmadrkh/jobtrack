'use client'

import { useApplications } from '@/hooks/useApplications'
import { WeeklyChart }    from './WeeklyChart'
import { FunnelChart }    from './FunnelChart'
import { AvgDaysChart }   from './AvgDaysChart'
import { SalaryChart }    from './SalaryChart'
import { Loader2, TrendingUp, Briefcase, CheckCircle2, Award } from 'lucide-react'
import type { Application, Status } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function startOfWeekISO(date: Date): string {
  const d = new Date(date)
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

function buildWeeklyData(apps: Application[]) {
  const counts: Record<string, number> = {}
  apps.forEach(a => {
    if (!a.appliedAt) return
    const week = startOfWeekISO(new Date(a.appliedAt))
    counts[week] = (counts[week] ?? 0) + 1
  })
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([week, count]) => ({
      week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }))
}

const FUNNEL_LABELS: Partial<Record<Status, string>> = {
  APPLIED:      'Applied',
  PHONE_SCREEN: 'Phone Screen',
  INTERVIEW:    'Interview',
  OFFER:        'Offer',
}

function buildFunnelData(apps: Application[]) {
  const ORDER: Status[] = ['APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER']
  const totalApplied = apps.filter(a => a.status !== 'WISHLIST').length

  return ORDER.map(status => {
    const reached = apps.filter(a => a.status === status || isAfterStage(a.status, status)).length
    const pct     = totalApplied > 0 ? Math.round((reached / totalApplied) * 100) : 0
    return { status, label: FUNNEL_LABELS[status] ?? status, count: reached, reached, pct }
  })
}

const STAGE_ORDER: Status[] = ['WISHLIST', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED']
function isAfterStage(current: Status, stage: Status) {
  return STAGE_ORDER.indexOf(current) >= STAGE_ORDER.indexOf(stage)
}

const AVG_LABELS: Partial<Record<Status, string>> = {
  APPLIED:      'Applied',
  PHONE_SCREEN: 'Phone Screen',
  INTERVIEW:    'Interview',
  OFFER:        'Offer',
}

function buildAvgDaysData(apps: Application[]) {
  const stages: Status[] = ['APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER']
  return stages.map(status => {
    const inStage = apps.filter(a => a.status === status && a.appliedAt && a.updatedAt)
    const count   = inStage.length
    if (!count) return { status, label: AVG_LABELS[status] ?? status, avgDays: 0, count: 0 }
    const avgDays = Math.round(
      inStage.reduce((sum, a) => {
        const diff = (new Date(a.updatedAt).getTime() - new Date(a.appliedAt!).getTime()) / 86400000
        return sum + Math.abs(diff)
      }, 0) / count
    )
    return { status, label: AVG_LABELS[status] ?? status, avgDays, count }
  })
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number
  icon: React.ElementType; color: string
}) {
  return (
    <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function StatsPage() {
  const { data: applications = [], isLoading } = useApplications()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <TrendingUp className="h-12 w-12 opacity-20" />
        <p className="text-sm">Add some applications to see your stats.</p>
      </div>
    )
  }

  const active   = applications.filter(a => !['REJECTED', 'OFFER'].includes(a.status)).length
  const offers   = applications.filter(a => a.status === 'OFFER').length
  const applied  = applications.filter(a => a.status !== 'WISHLIST').length
  const offerRate = applied > 0 ? `${Math.round((offers / applied) * 100)}%` : '—'

  const weeklyData = buildWeeklyData(applications)
  const funnelData = buildFunnelData(applications)
  const avgDaysData = buildAvgDaysData(applications)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stats</h1>
        <p className="text-muted-foreground text-sm mt-1">Your job search at a glance</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={applications.length}
          icon={Briefcase}    color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" />
        <StatCard label="Active"             value={active}
          icon={TrendingUp}   color="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400" />
        <StatCard label="Offers"             value={offers}
          icon={Award}        color="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" />
        <StatCard label="Offer Rate"         value={offerRate}
          icon={CheckCircle2} color="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <h3 className="font-semibold">Applications per Week</h3>
          <p className="text-xs text-muted-foreground">Last 12 weeks</p>
          {weeklyData.length > 0
            ? <WeeklyChart data={weeklyData} />
            : <p className="text-sm text-muted-foreground py-8 text-center">No applied-date data yet</p>
          }
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-3">
          <h3 className="font-semibold">Stage Conversion</h3>
          <p className="text-xs text-muted-foreground">How many applications reach each stage</p>
          <FunnelChart data={funnelData} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <h3 className="font-semibold">Avg. Days per Stage</h3>
          <p className="text-xs text-muted-foreground">Time spent in each status</p>
          <AvgDaysChart data={avgDaysData} />
        </div>

        <SalaryChart applications={applications} />
      </div>
    </div>
  )
}
