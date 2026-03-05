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
  const [agents] = useState(
    Object.keys(AGENT_INFO).map(role => ({
      role,
      status: 'running',
      tasks_completed: 0,
      errors: 0,
      uptime_seconds: 0,
      message: 'Initialized',
    }))
  )

  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-xl font-bold">⬡ Agent Status — 8 AI Roles</h2>

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

              <p className="text-terminal-text-dim text-xs mb-3">{info.edge}</p>

              <div className="flex gap-4 text-xs text-terminal-text-muted">
                <span>Tasks: {agent.tasks_completed}</span>
                <span>Errors: {agent.errors}</span>
                <span>Uptime: {Math.floor(agent.uptime_seconds / 60)}m</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
