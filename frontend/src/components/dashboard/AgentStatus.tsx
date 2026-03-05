'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useStore } from '@/store/useStore'

const AGENT_INFO: Record<string, { name: string; edge: string; icon: string }> = {
  signal_harvester: { name: 'Signal Harvester', edge: '10x data sources vs. any human analyst team. Never sleeps.', icon: '~' },
  chatter_analyst: { name: 'Chatter Analyst', edge: 'The core alpha engine. The logic no competitor has.', icon: '*' },
  strategy_engine: { name: 'Strategy Engine', edge: 'Generates thousands of strategy variations autonomously.', icon: '#' },
  execution_agent: { name: 'Execution Agent', edge: '50ms reaction on spike detection. Zero emotion.', icon: '>' },
  risk_sentinel: { name: 'Risk Sentinel', edge: 'No human monitors at 3am. This one does.', icon: '!' },
  portfolio_conductor: { name: 'Portfolio Conductor', edge: 'Capital flows to what performs, daily.', icon: '=' },
  meta_learner: { name: 'Meta Learner', edge: 'The system becomes smarter every month.', icon: '+' },
  compliance_capital: { name: 'Compliance & Capital', edge: 'Scales from $100k to $100M with zero overhead.', icon: '$' },
}

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  running: { color: 'text-terminal-green', label: 'RUNNING' },
  paused: { color: 'text-terminal-amber', label: 'PAUSED' },
  error: { color: 'text-terminal-red', label: 'ERROR' },
  stopped: { color: 'text-terminal-text-muted', label: 'STOPPED' },
}

export default function AgentStatus() {
  const { agentStates } = useStore()
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const [agents] = useState([
    { role: 'signal_harvester', tasks_completed: 14832, errors: 3, uptime_seconds: 2592000, message: 'Scanning r/wallstreetbets - 847 signals today', last_action: 'Scraped 2,549 posts across 10 subreddits', memory_mb: 342, cpu_pct: 12, accuracy: 0.94, pnl_contribution: 12400 },
    { role: 'chatter_analyst', tasks_completed: 8947, errors: 1, uptime_seconds: 2592000, message: 'Analyzing $SMCI - steady chatter pattern detected', last_action: 'Classified 15 signals in last hour', memory_mb: 512, cpu_pct: 28, accuracy: 0.91, pnl_contribution: 18200 },
    { role: 'strategy_engine', tasks_completed: 1247, errors: 7, uptime_seconds: 2592000, message: 'Backtesting variation #1248 - Penny Reversal v7', last_action: 'Generated 23 new strategy variations today', memory_mb: 768, cpu_pct: 45, accuracy: 0.87, pnl_contribution: 8900 },
    { role: 'execution_agent', tasks_completed: 3421, errors: 0, uptime_seconds: 2592000, message: 'Executed BUY 150 $PLTR @ $24.30', last_action: '10 fills today - $32,847 volume', memory_mb: 128, cpu_pct: 5, accuracy: 0.99, pnl_contribution: 4200 },
    { role: 'risk_sentinel', tasks_completed: 86400, errors: 0, uptime_seconds: 2592000, message: 'Daily loss: $47.20 / $1,000 limit - 4.7% utilized', last_action: 'All risk parameters nominal', memory_mb: 256, cpu_pct: 8, accuracy: 1.0, pnl_contribution: 0 },
    { role: 'portfolio_conductor', tasks_completed: 720, errors: 2, uptime_seconds: 2592000, message: 'Rebalanced: +$2,400 to WSB Accumulator v3', last_action: 'Daily reallocation complete', memory_mb: 384, cpu_pct: 15, accuracy: 0.92, pnl_contribution: 6800 },
    { role: 'meta_learner', tasks_completed: 89, errors: 4, uptime_seconds: 2592000, message: 'Proposing: Reddit Momentum Decay v1', last_action: 'Identified 2 underperforming strategies', memory_mb: 1024, cpu_pct: 62, accuracy: 0.85, pnl_contribution: 3100 },
    { role: 'compliance_capital', tasks_completed: 341, errors: 0, uptime_seconds: 2592000, message: 'Monthly LP report generated - Feb 2026', last_action: 'Tax reconciliation complete', memory_mb: 196, cpu_pct: 3, accuracy: 1.0, pnl_contribution: 0 },
  ])

  const performanceData = agents
    .filter(a => a.pnl_contribution > 0)
    .map(a => ({
      name: AGENT_INFO[a.role]?.name.split(' ')[0] || a.role,
      pnl: a.pnl_contribution,
      accuracy: a.accuracy * 100,
    }))
    .sort((a, b) => b.pnl - a.pnl)

  const agentLogs: Record<string, string[]> = {
    signal_harvester: [
      '[14:32:08] Scraped r/wallstreetbets - 142 new posts',
      '[14:31:45] Found $SMCI - 18 mentions in 1h window',
      '[14:31:02] Scraped r/stocks - 67 new posts',
      '[14:30:18] API rate limit check: 847/1000 requests used',
      '[14:29:55] Scanning r/pennystocks - 89 new posts',
    ],
    chatter_analyst: [
      '[14:32:05] $SMCI classified: steady_chatter (18 days, quality: 0.92)',
      '[14:31:42] $GME classified: spike (47x ratio, quality: 0.96)',
      '[14:31:20] $HOOD classified: steady_chatter (12 days, quality: 0.84)',
      '[14:30:58] Batch analysis: 15 signals processed',
    ],
    strategy_engine: [
      '[14:32:00] Backtest #1248: Penny Reversal v7 - Sharpe 1.42',
      '[14:28:00] Backtest #1247: Volume Fade v3 - Sharpe 2.18 (deployed)',
      '[14:24:00] Generated 5 new variations from WSB Accumulator template',
    ],
    execution_agent: [
      '[14:32:08] EXECUTED: BUY 150 PLTR @ $24.30 - Fill confirmed',
      '[14:18:44] EXECUTED: SELL 120 AMC @ $5.82 - P&L: +$247.20',
      '[13:55:21] EXECUTED: BUY 180 IONQ @ $12.40 - Fill confirmed',
      '[13:22:07] EXECUTED: SELL 75 MSTR @ $1720 - P&L: +$1,635',
    ],
    risk_sentinel: [
      '[14:32:00] Health check: All 12 positions within limits',
      '[14:31:00] Correlation alert: NVDA-AMD at 0.72 (limit: 0.70)',
      '[14:30:00] Daily loss: $47.20 of $1,000 limit (4.7%)',
    ],
    portfolio_conductor: [
      '[14:30:00] Rebalanced: +$2,400 to WSB Accumulator v3',
      '[14:29:00] Reviewed 23 active strategies - 0 flagged',
    ],
    meta_learner: [
      '[14:25:00] Proposed: Reddit Momentum Decay v1 (Sharpe: 1.68)',
      '[14:20:00] Flagged: Weekend Gap Scanner - underperforming',
    ],
    compliance_capital: [
      '[14:00:00] Monthly LP report generated - Feb 2026',
      '[13:00:00] Tax reconciliation complete for Q1 2026',
    ],
  }

  const allRunning = agents.every(a => agentStates[a.role] === 'running')
  const totalTasks = agents.reduce((sum, a) => sum + a.tasks_completed, 0)
  const totalErrors = agents.reduce((sum, a) => sum + a.errors, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-terminal-green text-xl font-bold">Agent Status - 8 AI Roles</h2>
        <span className={clsx('text-xs font-bold', allRunning ? 'text-terminal-green' : 'text-terminal-amber')}>
          {allRunning ? 'ALL OPERATIONAL' : 'ATTENTION NEEDED'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card">
          <p className="metric-label">Agents Online</p>
          <p className="metric-value text-terminal-green">{Object.values(agentStates).filter(s => s === 'running').length}/8</p>
        </div>
        <div className="card">
          <p className="metric-label">Tasks Completed</p>
          <p className="metric-value text-terminal-text">{totalTasks.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="metric-label">Total Errors</p>
          <p className={clsx('metric-value', totalErrors > 10 ? 'text-terminal-red' : 'text-terminal-amber')}>{totalErrors}</p>
        </div>
        <div className="card">
          <p className="metric-label">Uptime</p>
          <p className="metric-value text-terminal-green">30d 0h</p>
        </div>
      </div>

      {/* Agent Performance Chart */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">AGENT P&L CONTRIBUTION</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis tick={{ fill: '#555', fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-terminal-surface border border-terminal-border rounded px-2 py-1 text-xs">
                        <p className="text-terminal-green font-bold">${payload[0].value?.toLocaleString()}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {performanceData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#00ff88' : i === 1 ? '#00cc6a' : '#00ff8860'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const info = AGENT_INFO[agent.role]
          const status = agentStates[agent.role] || 'stopped'
          const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.stopped
          const isSelected = selectedAgent === agent.role

          return (
            <div
              key={agent.role}
              onClick={() => setSelectedAgent(isSelected ? null : agent.role)}
              className={clsx(
                'card border cursor-pointer transition-all',
                status === 'running' ? 'border-terminal-green/30 hover:border-terminal-green/60' :
                status === 'error' ? 'border-terminal-red/30' : 'border-terminal-border',
                isSelected && 'ring-1 ring-terminal-green/50'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-terminal-green text-sm font-bold">[{info.icon}]</span>
                  <h3 className="text-terminal-text font-bold text-sm">{info.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className={clsx('w-2 h-2 rounded-full',
                    status === 'running' ? 'bg-terminal-green animate-pulse' :
                    status === 'error' ? 'bg-terminal-red animate-pulse' :
                    status === 'paused' ? 'bg-terminal-amber' : 'bg-terminal-text-muted'
                  )} />
                  <span className={clsx('text-xs font-bold', statusStyle.color)}>{statusStyle.label}</span>
                </div>
              </div>

              <p className="text-terminal-text-dim text-xs mb-2">{info.edge}</p>

              <div className="bg-terminal-bg rounded px-2 py-1.5 mb-3">
                <p className="text-terminal-green text-[11px] font-mono">{agent.message}</p>
              </div>
              <p className="text-[10px] text-terminal-text-muted mb-3">Last: {agent.last_action}</p>

              <div className="flex gap-3 text-xs text-terminal-text-muted flex-wrap">
                <span>Tasks: {agent.tasks_completed.toLocaleString()}</span>
                <span className={agent.errors > 0 ? 'text-terminal-amber' : ''}>Errors: {agent.errors}</span>
                <span>Accuracy: <span className={agent.accuracy >= 0.95 ? 'text-terminal-green' : 'text-terminal-text'}>{(agent.accuracy * 100).toFixed(0)}%</span></span>
                {agent.pnl_contribution > 0 && (
                  <span className="text-terminal-green">P&L: +${agent.pnl_contribution.toLocaleString()}</span>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] text-terminal-text-muted mb-0.5">
                    <span>CPU</span><span>{agent.cpu_pct}%</span>
                  </div>
                  <div className="w-full h-1 bg-terminal-bg rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full', agent.cpu_pct > 60 ? 'bg-terminal-amber' : 'bg-terminal-green/60')} style={{ width: `${agent.cpu_pct}%` }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] text-terminal-text-muted mb-0.5">
                    <span>MEM</span><span>{agent.memory_mb}MB</span>
                  </div>
                  <div className="w-full h-1 bg-terminal-bg rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-terminal-green/60" style={{ width: `${Math.min((agent.memory_mb / 1024) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Expanded Logs */}
              {isSelected && agentLogs[agent.role] && (
                <div className="mt-3 pt-3 border-t border-terminal-border">
                  <h4 className="text-terminal-green text-[10px] font-bold mb-2">RECENT LOGS</h4>
                  <div className="bg-terminal-bg rounded p-2 max-h-40 overflow-y-auto space-y-1">
                    {agentLogs[agent.role].map((log, i) => (
                      <p key={i} className="text-[10px] text-terminal-text-dim font-mono">{log}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
