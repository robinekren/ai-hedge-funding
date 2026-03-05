'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

const AGENT_INFO: Record<string, { name: string; edge: string; icon: string }> = {
  signal_harvester: {
    name: 'Signal Harvester',
    edge: '10x data sources vs. any human analyst team. Never sleeps.',
    icon: '◉',
  },
  chatter_analyst: {
    name: 'Chatter Analyst',
    edge: 'The core alpha engine. The logic no competitor has.',
    icon: '◈',
  },
  strategy_engine: {
    name: 'Strategy Engine',
    edge: 'Generates thousands of strategy variations autonomously.',
    icon: '⧫',
  },
  execution_agent: {
    name: 'Execution Agent',
    edge: '50ms reaction on spike detection → immediate exit. Zero emotion.',
    icon: '⟐',
  },
  risk_sentinel: {
    name: 'Risk Sentinel',
    edge: 'No human monitors at 3am. This one does.',
    icon: '△',
  },
  portfolio_conductor: {
    name: 'Portfolio Conductor',
    edge: 'No static allocation. Capital flows to what performs, daily.',
    icon: '⬡',
  },
  meta_learner: {
    name: 'Meta Learner',
    edge: 'The system becomes smarter every month without human input.',
    icon: '◇',
  },
  compliance_capital: {
    name: 'Compliance & Capital',
    edge: 'Scales from $100k to $100M with zero additional overhead.',
    icon: '⚙',
  },
}

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  running: { color: 'text-terminal-green', label: 'RUNNING' },
  paused: { color: 'text-terminal-amber', label: 'PAUSED' },
  error: { color: 'text-terminal-red', label: 'ERROR' },
  stopped: { color: 'text-terminal-text-muted', label: 'STOPPED' },
}

/**
 * Agent Status Screen
 * Health status of all 8 AI roles — running, paused, error.
 */
export default function AgentStatus() {
  const [agents] = useState([
    {
      role: 'signal_harvester',
      status: 'running',
      tasks_completed: 14832,
      errors: 3,
      uptime_seconds: 2592000,  // 30 days
      message: 'Scanning r/wallstreetbets — 847 signals today',
      last_action: 'Scraped 2,549 posts across 10 subreddits',
      memory_mb: 342,
      cpu_pct: 12,
    },
    {
      role: 'chatter_analyst',
      status: 'running',
      tasks_completed: 8947,
      errors: 1,
      uptime_seconds: 2592000,
      message: 'Analyzing $SMCI — steady chatter pattern detected',
      last_action: 'Classified 15 signals in last hour',
      memory_mb: 512,
      cpu_pct: 28,
    },
    {
      role: 'strategy_engine',
      status: 'running',
      tasks_completed: 1247,
      errors: 7,
      uptime_seconds: 2592000,
      message: 'Backtesting variation #1248 — Penny Reversal v7',
      last_action: 'Generated 23 new strategy variations today',
      memory_mb: 768,
      cpu_pct: 45,
    },
    {
      role: 'execution_agent',
      status: 'running',
      tasks_completed: 3421,
      errors: 0,
      uptime_seconds: 2592000,
      message: 'Executed BUY 150 $PLTR @ $24.30 — 14:32:08',
      last_action: '10 fills today — $32,847 volume',
      memory_mb: 128,
      cpu_pct: 5,
    },
    {
      role: 'risk_sentinel',
      status: 'running',
      tasks_completed: 86400,
      errors: 0,
      uptime_seconds: 2592000,
      message: 'Daily loss: $47.20 / $1,000 limit — 4.7% utilized',
      last_action: 'All risk parameters nominal',
      memory_mb: 256,
      cpu_pct: 8,
    },
    {
      role: 'portfolio_conductor',
      status: 'running',
      tasks_completed: 720,
      errors: 2,
      uptime_seconds: 2592000,
      message: 'Rebalanced: +$2,400 to WSB Accumulator v3',
      last_action: 'Daily reallocation complete — 23 strategies active',
      memory_mb: 384,
      cpu_pct: 15,
    },
    {
      role: 'meta_learner',
      status: 'running',
      tasks_completed: 89,
      errors: 4,
      uptime_seconds: 2592000,
      message: 'Proposing new strategy: Reddit Momentum Decay v1',
      last_action: 'Identified 2 underperforming strategies for retirement',
      memory_mb: 1024,
      cpu_pct: 62,
    },
    {
      role: 'compliance_capital',
      status: 'running',
      tasks_completed: 341,
      errors: 0,
      uptime_seconds: 2592000,
      message: 'Monthly LP report generated — Feb 2026',
      last_action: 'Tax reconciliation complete',
      memory_mb: 196,
      cpu_pct: 3,
    },
  ])

  const allRunning = agents.every(a => a.status === 'running')
  const totalTasks = agents.reduce((sum, a) => sum + a.tasks_completed, 0)
  const totalErrors = agents.reduce((sum, a) => sum + a.errors, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-terminal-green text-xl font-bold">⬡ Agent Status — 8 AI Roles</h2>
        <div className="flex items-center gap-4 text-xs">
          <span className={clsx(
            'font-bold',
            allRunning ? 'text-terminal-green' : 'text-terminal-amber'
          )}>
            {allRunning ? 'ALL OPERATIONAL' : 'ATTENTION NEEDED'}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card">
          <p className="metric-label">Agents Online</p>
          <p className="metric-value text-terminal-green">{agents.filter(a => a.status === 'running').length}/8</p>
        </div>
        <div className="card">
          <p className="metric-label">Tasks Completed</p>
          <p className="metric-value text-terminal-text">{totalTasks.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="metric-label">Total Errors</p>
          <p className={clsx('metric-value', totalErrors > 10 ? 'text-terminal-red' : 'text-terminal-amber')}>
            {totalErrors}
          </p>
        </div>
        <div className="card">
          <p className="metric-label">Uptime</p>
          <p className="metric-value text-terminal-green">30d 0h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const info = AGENT_INFO[agent.role]
          const statusStyle = STATUS_STYLES[agent.status] || STATUS_STYLES.stopped

          return (
            <div
              key={agent.role}
              className={clsx(
                'card border',
                agent.status === 'running' ? 'border-terminal-green/30' :
                agent.status === 'error' ? 'border-terminal-red/30' :
                'border-terminal-border'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-terminal-green text-lg">{info.icon}</span>
                  <h3 className="text-terminal-text font-bold text-sm">{info.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className={clsx(
                    'w-2 h-2 rounded-full',
                    agent.status === 'running' ? 'bg-terminal-green animate-pulse' :
                    agent.status === 'error' ? 'bg-terminal-red animate-pulse' :
                    agent.status === 'paused' ? 'bg-terminal-amber' : 'bg-terminal-text-muted'
                  )} />
                  <span className={clsx('text-xs font-bold', statusStyle.color)}>
                    {statusStyle.label}
                  </span>
                </div>
              </div>

              <p className="text-terminal-text-dim text-xs mb-2">{info.edge}</p>

              {/* Current activity */}
              <div className="bg-terminal-bg rounded px-2 py-1.5 mb-3">
                <p className="text-terminal-green text-[11px] font-mono">{agent.message}</p>
              </div>
              <p className="text-[10px] text-terminal-text-muted mb-3">Last: {agent.last_action}</p>

              {/* Stats row */}
              <div className="flex gap-4 text-xs text-terminal-text-muted">
                <span>Tasks: {agent.tasks_completed.toLocaleString()}</span>
                <span className={agent.errors > 0 ? 'text-terminal-amber' : ''}>Errors: {agent.errors}</span>
                <span>Uptime: {Math.floor(agent.uptime_seconds / 86400)}d</span>
              </div>

              {/* Resource bar */}
              <div className="flex gap-3 mt-2">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] text-terminal-text-muted mb-0.5">
                    <span>CPU</span>
                    <span>{agent.cpu_pct}%</span>
                  </div>
                  <div className="w-full h-1 bg-terminal-bg rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full',
                        agent.cpu_pct > 60 ? 'bg-terminal-amber' : 'bg-terminal-green/60'
                      )}
                      style={{ width: `${agent.cpu_pct}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] text-terminal-text-muted mb-0.5">
                    <span>MEM</span>
                    <span>{agent.memory_mb}MB</span>
                  </div>
                  <div className="w-full h-1 bg-terminal-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-terminal-green/60"
                      style={{ width: `${Math.min((agent.memory_mb / 1024) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
