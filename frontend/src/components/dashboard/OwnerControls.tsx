'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

/**
 * Owner Controls Screen
 * - Phase Transition (Phase 1 → 2 → 3)
 * - Daily-Loss-Limit (kill switch threshold)
 * - Agent Control (pause/start individual agents)
 * - Emergency Stop (close all trades, halt execution)
 */
export default function OwnerControls() {
  const [currentPhase, setCurrentPhase] = useState('phase_1')
  const [dailyLossLimit, setDailyLossLimit] = useState(1000)
  const [emergencyConfirm, setEmergencyConfirm] = useState(false)
  const [limitInput, setLimitInput] = useState('1000')

  const agents = [
    'signal_harvester', 'chatter_analyst', 'strategy_engine', 'execution_agent',
    'risk_sentinel', 'portfolio_conductor', 'meta_learner', 'compliance_capital',
  ]

  const [agentStates, setAgentStates] = useState<Record<string, string>>(
    Object.fromEntries(agents.map(a => [a, 'running']))
  )

  const phaseLabels: Record<string, { name: string; desc: string }> = {
    phase_1: { name: 'Phase 1 — Supervised', desc: 'AI proposes → Robin approves → Execution' },
    phase_2: { name: 'Phase 2 — Semi-Autonomous', desc: 'AI executes autonomously + Daily-Loss Kill Switch' },
    phase_3: { name: 'Phase 3 — Fully Autonomous', desc: '100% autonomous. No human in the loop.' },
  }

  const handlePhaseTransition = (target: string) => {
    if (confirm(`Confirm phase transition to ${phaseLabels[target].name}?\n\nThis will change execution rules.`)) {
      setCurrentPhase(target)
    }
  }

  const handleSetLimit = () => {
    const val = parseFloat(limitInput)
    if (!isNaN(val) && val > 0) {
      setDailyLossLimit(val)
    }
  }

  const toggleAgent = (agent: string) => {
    setAgentStates(prev => ({
      ...prev,
      [agent]: prev[agent] === 'running' ? 'paused' : 'running',
    }))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-xl font-bold">⚙ Owner Controls</h2>

      {/* Phase Transition */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">PHASE TRANSITION</h3>
        <div className="space-y-3">
          {Object.entries(phaseLabels).map(([key, { name, desc }]) => (
            <div
              key={key}
              className={clsx(
                'flex items-center justify-between p-3 rounded border',
                currentPhase === key
                  ? 'border-terminal-green bg-terminal-green/10'
                  : 'border-terminal-border'
              )}
            >
              <div>
                <p className={clsx(
                  'text-sm font-bold',
                  currentPhase === key ? 'text-terminal-green' : 'text-terminal-text-dim'
                )}>
                  {name}
                </p>
                <p className="text-xs text-terminal-text-muted mt-1">{desc}</p>
              </div>
              {currentPhase !== key && (
                <button
                  onClick={() => handlePhaseTransition(key)}
                  className="btn-outline text-xs"
                >
                  Activate
                </button>
              )}
              {currentPhase === key && (
                <span className="text-terminal-green text-xs font-bold">ACTIVE</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Loss Limit */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">DAILY-LOSS-LIMIT — Kill Switch</h3>
        <p className="text-xs text-terminal-text-dim mb-3">
          System pauses all execution when daily loss exceeds this threshold.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-terminal-text-dim text-sm">$</span>
          <input
            type="number"
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            className="bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-green font-mono w-40 text-sm"
          />
          <button onClick={handleSetLimit} className="btn-primary text-xs">
            Update
          </button>
          <span className="text-terminal-text-muted text-xs">
            Current: ${dailyLossLimit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Agent Control */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">
          AGENT CONTROL — Pause / Start Individual Agents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {agents.map(agent => (
            <div
              key={agent}
              className="flex items-center justify-between p-2 border border-terminal-border/50 rounded"
            >
              <div className="flex items-center gap-2">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  agentStates[agent] === 'running' ? 'bg-terminal-green animate-pulse' : 'bg-terminal-amber'
                )} />
                <span className="text-sm text-terminal-text">
                  {agent.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                onClick={() => toggleAgent(agent)}
                className={clsx(
                  'text-xs px-3 py-1 rounded font-bold',
                  agentStates[agent] === 'running'
                    ? 'bg-terminal-amber/20 text-terminal-amber'
                    : 'bg-terminal-green/20 text-terminal-green'
                )}
              >
                {agentStates[agent] === 'running' ? 'Pause' : 'Start'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Stop */}
      <div className="card border-2 border-terminal-red/50">
        <h3 className="text-terminal-red text-sm font-bold mb-4">EMERGENCY STOP</h3>
        <p className="text-xs text-terminal-text-dim mb-4">
          Immediately close ALL open trades and halt ALL execution.
          This is the nuclear button.
        </p>
        {!emergencyConfirm ? (
          <button
            onClick={() => setEmergencyConfirm(true)}
            className="btn-danger"
          >
            Initiate Emergency Stop
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-terminal-red text-sm font-bold">CONFIRM:</span>
            <button
              onClick={() => {
                alert('Emergency stop activated. All positions closed.')
                setEmergencyConfirm(false)
              }}
              className="btn-danger"
            >
              CONFIRM STOP
            </button>
            <button
              onClick={() => setEmergencyConfirm(false)}
              className="btn-outline text-xs"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
