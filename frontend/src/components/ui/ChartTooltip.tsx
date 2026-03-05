'use client'

import { clsx } from 'clsx'

interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: (value: any, name: string) => string
  borderColor?: string
}

export default function ChartTooltip({ active, payload, label, formatter, borderColor = 'border-terminal-border' }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className={clsx('bg-terminal-surface border rounded px-3 py-2 shadow-lg text-xs', borderColor)}>
      {label && <p className="text-terminal-text-muted mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || '#00ff88' }} className="font-bold">
          {p.name && payload.length > 1 ? `${p.name}: ` : ''}
          {formatter ? formatter(p.value, p.name) : p.value}
        </p>
      ))}
    </div>
  )
}
