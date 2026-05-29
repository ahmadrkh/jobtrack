'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

interface AvgData {
  status: string
  label: string
  avgDays: number
  count: number
}

const COLORS: Record<string, string> = {
  APPLIED:      '#2563eb',
  PHONE_SCREEN: '#7c3aed',
  INTERVIEW:    '#0891b2',
  OFFER:        '#16a34a',
  REJECTED:     '#ef4444',
}

export function AvgDaysChart({ data }: { data: AvgData[] }) {
  // Only show stages with at least one application
  const filtered = data.filter((d) => d.count > 0)

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
        No data yet — add some applications first.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={filtered} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          unit=" d"
        />
        <Tooltip
          formatter={(value: number, _name, props) => [
            `${value} days (${props.payload.count} app${props.payload.count !== 1 ? 's' : ''})`,
            'Avg time in pipeline',
          ]}
          contentStyle={{
            background: '#1e293b',
            border: 'none',
            borderRadius: 6,
            color: '#f1f5f9',
            fontSize: 12,
          }}
          cursor={{ fill: '#eff6ff' }}
        />
        <Bar dataKey="avgDays" name="Avg days" radius={[4, 4, 0, 0]}>
          {filtered.map((entry) => (
            <Cell key={entry.status} fill={COLORS[entry.status] ?? '#94a3b8'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
