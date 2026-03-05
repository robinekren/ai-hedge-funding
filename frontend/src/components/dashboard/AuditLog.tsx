'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { useStore, AuditEntry } from '@/store/useStore'

const CATEGORY_COLORS: Record<string, string> = {
  trade: 'text-terminal-green bg-terminal-green/10 border-terminal-green/30',
  agent: 'text-terminal-amber bg-terminal-amber/10 border-terminal-amber/30',
  risk: 'text-terminal-red bg-terminal-red/10 border-terminal-red/30',
  system: 'text-terminal-text bg-terminal-surface border-terminal-border',
  auth: 'text-terminal-green bg-terminal-green/10 border-terminal-green/30',
  phase: 'text-terminal-amber bg-terminal-amber/10 border-terminal-amber/30',
}

const SEVERITY_DOTS: Record<string, string> = {
  info: 'bg-terminal-green',
  warning: 'bg-terminal-amber',
  critical: 'bg-terminal-red animate-pulse',
}

export default function AuditLog() {
  const { auditLog } = useStore()
  const [filter, setFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  const filtered = auditLog.filter((entry) => {
    if (filter !== 'all' && entry.category !== filter) return false
    if (severityFilter !== 'all' && entry.severity !== severityFilter) return false
    return true
  })

  const categoryCounts = auditLog.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1
    return acc
  }, {})

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-terminal-green text-xl font-bold">Activity Log</h2>
        <span className="text-terminal-text-muted text-xs">{auditLog.length} entries</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card">
          <p className="metric-label">Total Events</p>
          <p className="metric-value text-terminal-text">{auditLog.length}</p>
        </div>
        <div className="card">
          <p className="metric-label">Critical</p>
          <p className="metric-value text-terminal-red">
            {auditLog.filter((e) => e.severity === 'critical').length}
          </p>
        </div>
        <div className="card">
          <p className="metric-label">Warnings</p>
          <p className="metric-value text-terminal-amber">
            {auditLog.filter((e) => e.severity === 'warning').length}
          </p>
        </div>
        <div className="card">
          <p className="metric-label">Info</p>
          <p className="metric-value text-terminal-green">
            {auditLog.filter((e) => e.severity === 'info').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">
          {['all', 'trade', 'agent', 'risk', 'system', 'auth', 'phase'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={clsx(
                'px-2 py-1 rounded text-xs font-bold transition-colors',
                filter === cat
                  ? 'bg-terminal-green text-terminal-bg'
                  : 'border border-terminal-border text-terminal-text-dim hover:border-terminal-green/50'
              )}
            >
              {cat.toUpperCase()}
              {cat !== 'all' && categoryCounts[cat] ? ` (${categoryCounts[cat]})` : ''}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {['all', 'info', 'warning', 'critical'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={clsx(
                'px-2 py-1 rounded text-xs transition-colors',
                severityFilter === sev
                  ? 'bg-terminal-green text-terminal-bg font-bold'
                  : 'border border-terminal-border text-terminal-text-dim hover:border-terminal-green/50'
              )}
            >
              {sev.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Log entries */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-terminal-text-muted text-sm">No activity logged yet</p>
            <p className="text-terminal-text-muted text-xs mt-1">
              Actions like trades, agent changes, and logins will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className={clsx(
                  'flex items-start gap-3 py-2.5 border-b border-terminal-border/30',
                  entry.severity === 'critical' && 'bg-terminal-red/5 -mx-4 px-4 rounded'
                )}
              >
                <div className={clsx('w-2 h-2 rounded-full mt-1.5 shrink-0', SEVERITY_DOTS[entry.severity])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-terminal-text text-sm">{entry.action}</span>
                    <span
                      className={clsx(
                        'text-[10px] px-1.5 py-0.5 rounded border',
                        CATEGORY_COLORS[entry.category]
                      )}
                    >
                      {entry.category}
                    </span>
                  </div>
                  {entry.details && (
                    <p className="text-terminal-text-muted text-xs mt-0.5">{entry.details}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-terminal-text-dim text-xs">{entry.user}</span>
                  <span className="text-terminal-text-muted text-[10px]">{formatTime(entry.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
