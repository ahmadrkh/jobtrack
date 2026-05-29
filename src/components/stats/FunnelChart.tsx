'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts'

interface FunnelData {
  status: string
  label: string
  count: number
  reached: number
  pct: number
}

const COLORS: Record<string, string> = {
  APPLIED:      '#2563eb',
  PHONE_SCREEN: '#7c3aed',
  INTERVIEW:    '#0891b2',
  OFFER:        '#16a34a',
}

export function FunnelChart({ data }: { data: FunnelData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 48, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={90}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number, _name: string, props) => [
            `${value}% (${props.payload.reached} apps)`,
            'Reached stage',
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
        <Bar dataKey="pct" radius={[0, 4, 4, 0]} name="Conversion">
          {data.map((entry) => (
            <Cell key={entry.status} fill={COLORS[entry.status] ?? '#94a3b8'} />
          ))}
          <LabelList
            dataKey="pct"
            position="right"
            formatter={(v: number) => `${v}%`}
            style={{ fontSize: 11, fill: '#64748b' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
