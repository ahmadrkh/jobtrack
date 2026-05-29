'use client'

// Salary distribution chart.
// Parses free-text salary strings into numeric values (handles $, k, –, ranges)
// then renders a Recharts bar histogram with median and percentile lines.

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import type { Application } from '@/types'

// ── Salary parser ─────────────────────────────────────────────────────────────

const MULTIPLIERS: Record<string, number> = {
  k: 1_000, m: 1_000_000,
}

function parseSalaryValue(raw: string): number | null {
  // Normalise: lowercase, strip currency symbols and spaces
  const s = raw.toLowerCase().replace(/[$€£,\s]/g, '')

  // Range like "80k-100k" or "80000-100000" → average
  const rangeParts = s.split(/[–\-to]+/).map(p => p.trim()).filter(Boolean)
  if (rangeParts.length === 2) {
    const [a, b] = rangeParts.map(parseVal)
    if (a !== null && b !== null) return (a + b) / 2
  }

  return parseVal(s)
}

function parseVal(s: string): number | null {
  const m = s.match(/^(\d+(?:\.\d+)?)(k|m)?$/)
  if (!m) return null
  const num = parseFloat(m[1])
  const mul = m[2] ? MULTIPLIERS[m[2]] : 1
  return num * mul
}

// ── Histogram builder ─────────────────────────────────────────────────────────

function buildHistogram(values: number[], buckets = 8) {
  if (values.length === 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (min === max) {
    return [{ label: formatSalary(min), count: values.length, midpoint: min }]
  }
  const step = (max - min) / buckets
  return Array.from({ length: buckets }, (_, i) => {
    const lo = min + i * step
    const hi = lo + step
    const count = values.filter(v => v >= lo && (i === buckets - 1 ? v <= hi : v < hi)).length
    return { label: formatSalary(lo + step / 2), count, midpoint: lo + step / 2 }
  }).filter(b => b.count > 0)
}

function formatSalary(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m]
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  applications: Application[]
}

export function SalaryChart({ applications }: Props) {
  const values = applications
    .filter(a => a.salary)
    .map(a => parseSalaryValue(a.salary!))
    .filter((v): v is number => v !== null && v > 0)

  if (values.length < 2) {
    return (
      <div className="rounded-xl border bg-card p-6 flex items-center justify-center h-48 text-sm text-muted-foreground">
        Add salary info to at least 2 applications to see the distribution.
      </div>
    )
  }

  const hist   = buildHistogram(values)
  const med    = median(values)
  const p25    = values.sort((a, b) => a - b)[Math.floor(values.length * 0.25)]
  const p75    = values.sort((a, b) => a - b)[Math.floor(values.length * 0.75)]
  const maxBar = Math.max(...hist.map(h => h.count))

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-semibold">Salary Distribution</h3>
          <p className="text-sm text-muted-foreground">
            Based on {values.length} application{values.length !== 1 ? 's' : ''} with salary data
          </p>
        </div>
        {/* Key stats */}
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="font-bold text-primary">{formatSalary(med)}</p>
            <p className="text-xs text-muted-foreground">Median</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-amber-500">{formatSalary(p25)}</p>
            <p className="text-xs text-muted-foreground">P25</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-green-500">{formatSalary(p75)}</p>
            <p className="text-xs text-muted-foreground">P75</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{formatSalary(Math.max(...values))}</p>
            <p className="text-xs text-muted-foreground">Max</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={hist} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false} tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: 12,
            }}
            formatter={(v: number) => [v, 'Applications']}
            labelFormatter={(label: string) => `Around ${label}`}
          />
          {/* Median reference line */}
          <ReferenceLine
            x={hist.find(h => h.midpoint >= med)?.label}
            stroke="hsl(var(--primary))"
            strokeDasharray="4 4"
            label={{ value: 'Median', position: 'top', fontSize: 10, fill: 'hsl(var(--primary))' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {hist.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.midpoint >= p25 && entry.midpoint <= p75
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--primary) / 0.4)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-muted-foreground">
        Bars within the 25th–75th percentile range are highlighted.
        Salary strings are parsed automatically — ranges like "$80k–$120k" are averaged.
      </p>
    </div>
  )
}
