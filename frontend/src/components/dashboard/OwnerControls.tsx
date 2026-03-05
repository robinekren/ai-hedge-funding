'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'

const AGENT_NAMES: Record<string, string> = {
  signal_harvester: 'Signal Harvester',
  chatter_analyst: 'Chatter Analyst',
  strategy_engine: 'Strategy Engine',
  execution_agent: 'Execution Agent',
  risk_sentinel: 'Risk Sentinel',
  portfolio_conductor: 'Portfolio Conductor',
  meta_learner: 'Meta Learner',
  compliance_capital: 'Compliance & Capital',
}

export default function OwnerControls() {
  const {
    currentPhase, setCurrentPhase,
    dailyLossLimit, setDailyLossLimit,
    agentStates, setAgentState, setAllAgentStates,
    emergencyActive, setEmergencyActive,
    addToast, addAuditEntry, auth,
    activeFundId, funds,
  } = useStore()
  const activeFund = funds.find(f => f.id === activeFundId)

  const [emergencyConfirm, setEmergencyConfirm] = useState(false)
  const [limitInput, setLimitInput] = useState(dailyLossLimit.toString())
  const [limitSaved, setLimitSaved] = useState(false)
  const [limitConfirm, setLimitConfirm] = useState(false)
  const [phaseConfirmTarget, setPhaseConfirmTarget] = useState<string | null>(null)
  const [deployConfirm, setDeployConfirm] = useState<string | null>(null)

  const agents = Object.keys(AGENT_NAMES)

  const agentTasks: Record<string, number> = {
    signal_harvester: 14832, chatter_analyst: 8947, strategy_engine: 1247,
    execution_agent: 3421, risk_sentinel: 86400, portfolio_conductor: 720,
    meta_learner: 89, compliance_capital: 341,
  }

  const phaseLabels: Record<string, { name: string; desc: string; requirements: string }> = {
    phase_1: {
      name: 'Phase 1 - Supervised',
      desc: 'AI proposes -> Robin approves -> Execution',
      requirements: 'Current phase. All trades require human approval.',
    },
    phase_2: {
      name: 'Phase 2 - Semi-Autonomous',
      desc: 'AI executes autonomously + Daily-Loss Kill Switch',
      requirements: 'Requires: 30 consecutive profitable days, 70% win rate, <10% drawdown, 100+ trades.',
    },
    phase_3: {
      name: 'Phase 3 - Fully Autonomous',
      desc: '100% autonomous. No human in the loop.',
      requirements: 'Requires: 90 profitable days, 80% win rate, <5% drawdown, 10+ ML successes.',
    },
  }

  const confirmPhaseTransition = () => {
    if (phaseConfirmTarget) {
      setCurrentPhase(phaseConfirmTarget)
      setPhaseConfirmTarget(null)
      addToast({ type: 'warning', title: 'Phase Transition', message: `Switched to ${phaseLabels[phaseConfirmTarget]?.name}` })
    }
  }

  const handleSetLimit = () => {
    setLimitConfirm(true)
  }

  const confirmSetLimit = () => {
    const val = parseFloat(limitInput)
    if (!isNaN(val) && val > 0) {
      setDailyLossLimit(val)
      setLimitSaved(true)
      addToast({ type: 'success', title: 'Loss Limit Updated', message: `New limit: $${val.toLocaleString()}` })
      setTimeout(() => setLimitSaved(false), 2000)
    }
    setLimitConfirm(false)
  }

  const toggleAgent = (agent: string) => {
    const newState = agentStates[agent] === 'running' ? 'paused' : 'running'
    setAgentState(agent, newState)
    addToast({
      type: newState === 'paused' ? 'warning' : 'success',
      title: `${AGENT_NAMES[agent]} ${newState === 'paused' ? 'Paused' : 'Started'}`,
    })
  }

  const handleEmergencyStop = () => {
    setEmergencyConfirm(false)
    setEmergencyActive(true)
    setAllAgentStates(Object.fromEntries(agents.map(a => [a, 'paused'])))
  }

  const runningCount = Object.values(agentStates).filter(s => s === 'running').length
  const pausedCount = Object.values(agentStates).filter(s => s === 'paused').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-terminal-green text-xl font-bold">
          Owner Controls
          {activeFund && <span className="text-terminal-text-dim text-sm font-normal ml-3">— {activeFund.name}</span>}
        </h2>
        <span className="text-xs text-terminal-text-muted">
          Logged in as: <span className="text-terminal-green">{auth.user?.name || 'unknown'}</span>
        </span>
      </div>

      {/* Emergency Banner */}
      {emergencyActive && (
        <div className="card border-2 border-terminal-red bg-terminal-red/10 glow-red">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-terminal-red font-bold text-sm">EMERGENCY STOP ACTIVE</p>
              <p className="text-terminal-text-dim text-xs mt-1">All trading halted. All agents paused.</p>
            </div>
            <button
              onClick={() => {
                setEmergencyActive(false)
                setAllAgentStates(Object.fromEntries(agents.map(a => [a, 'running'])))
                addToast({ type: 'success', title: 'System Resumed', message: 'All agents restarted' })
                addAuditEntry({ user: auth.user?.name || 'system', action: 'Emergency stop lifted - system resumed', category: 'system', severity: 'critical' })
              }}
              className="btn-primary text-xs"
            >
              Resume System
            </button>
          </div>
        </div>
      )}

      {/* System Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card">
          <p className="metric-label">Current Phase</p>
          <p className="metric-value text-terminal-green text-base">
            {currentPhase === 'phase_1' ? 'SUPERVISED' : currentPhase === 'phase_2' ? 'SEMI-AUTO' : 'AUTONOMOUS'}
          </p>
        </div>
        <div className="card">
          <p className="metric-label">Daily Loss Limit</p>
          <p className="metric-value text-terminal-amber text-base">${dailyLossLimit.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="metric-label">Agents Running</p>
          <p className="metric-value text-terminal-green text-base">{runningCount}/8</p>
        </div>
        <div className="card">
          <p className="metric-label">Agents Paused</p>
          <p className={clsx('metric-value text-base', pausedCount > 0 ? 'text-terminal-amber' : 'text-terminal-text-muted')}>{pausedCount}</p>
        </div>
      </div>

      {/* Phase Transition */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">PHASE TRANSITION - Trust Escalation Protocol</h3>
        <div className="space-y-3">
          {Object.entries(phaseLabels).map(([key, { name, desc, requirements }]) => (
            <div key={key} className={clsx('flex items-center justify-between p-3 rounded border',
              currentPhase === key ? 'border-terminal-green bg-terminal-green/10' : 'border-terminal-border'
            )}>
              <div className="flex-1">
                <p className={clsx('text-sm font-bold', currentPhase === key ? 'text-terminal-green' : 'text-terminal-text-dim')}>{name}</p>
                <p className="text-xs text-terminal-text-muted mt-1">{desc}</p>
                <p className="text-[10px] text-terminal-text-muted mt-1">{requirements}</p>
              </div>
              {currentPhase !== key && phaseConfirmTarget !== key && (
                <button onClick={() => setPhaseConfirmTarget(key)} className="btn-outline text-xs ml-3">Activate</button>
              )}
              {phaseConfirmTarget === key && (
                <div className="flex items-center gap-2 ml-3">
                  <button onClick={confirmPhaseTransition} className="btn-primary text-xs">Confirm</button>
                  <button onClick={() => setPhaseConfirmTarget(null)} className="btn-outline text-xs">Cancel</button>
                </div>
              )}
              {currentPhase === key && <span className="text-terminal-green text-xs font-bold ml-3">ACTIVE</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Loss Limit */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">DAILY-LOSS-LIMIT - Kill Switch</h3>
        <p className="text-xs text-terminal-text-dim mb-3">
          System pauses all execution when daily loss exceeds this threshold.
          Current daily loss: <span className="text-terminal-red">-$47.20</span> ({((47.20 / dailyLossLimit) * 100).toFixed(1)}% of limit)
        </p>
        <div className="flex items-center gap-3">
          <span className="text-terminal-text-dim text-sm">$</span>
          <input
            type="number"
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            className="bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-green font-mono w-40 text-sm focus:border-terminal-green outline-none"
          />
          <button onClick={handleSetLimit} className="btn-primary text-xs">Update</button>
          {limitSaved && <span className="text-terminal-green text-xs font-bold animate-pulse">Saved</span>}
        </div>
        <div className="flex gap-2 mt-3">
          {[500, 1000, 2500, 5000].map(val => (
            <button
              key={val}
              onClick={() => { setLimitInput(val.toString()); setDailyLossLimit(val); addToast({ type: 'success', title: `Limit: $${val.toLocaleString()}` }) }}
              className={clsx('text-[10px] px-2 py-1 rounded border',
                dailyLossLimit === val ? 'border-terminal-green text-terminal-green' : 'border-terminal-border text-terminal-text-muted hover:border-terminal-green/50'
              )}
            >
              ${val.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Control */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">AGENT CONTROL - Pause / Start Individual Agents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {agents.map(agent => (
            <div key={agent} className={clsx('flex items-center justify-between p-2 rounded border',
              agentStates[agent] === 'running' ? 'border-terminal-green/20' : 'border-terminal-amber/30 bg-terminal-amber/5'
            )}>
              <div className="flex items-center gap-2 flex-1">
                <div className={clsx('w-2 h-2 rounded-full',
                  agentStates[agent] === 'running' ? 'bg-terminal-green animate-pulse' : 'bg-terminal-amber'
                )} />
                <div>
                  <span className="text-sm text-terminal-text">{AGENT_NAMES[agent]}</span>
                  <span className="text-[10px] text-terminal-text-muted ml-2">{agentTasks[agent]?.toLocaleString()} tasks</span>
                </div>
              </div>
              <button
                onClick={() => toggleAgent(agent)}
                className={clsx('text-xs px-3 py-1 rounded font-bold',
                  agentStates[agent] === 'running'
                    ? 'bg-terminal-amber/20 text-terminal-amber hover:bg-terminal-amber/30'
                    : 'bg-terminal-green/20 text-terminal-green hover:bg-terminal-green/30'
                )}
              >
                {agentStates[agent] === 'running' ? 'Pause' : 'Start'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Meta Learner Queue */}
      <div className="card border border-terminal-green/20">
        <h3 className="text-terminal-green text-sm font-bold mb-4">META LEARNER - Pending Strategy Approvals</h3>
        <div className="space-y-2">
          {[
            { name: 'Reddit Momentum Decay v1', sharpe: 1.68, winRate: 0.77, trades: 4 },
            { name: 'Cross-Platform Confluence v1', sharpe: 2.12, winRate: 0.82, trades: 0 },
          ].map((strat, i) => (
            <div key={i} className="flex items-center justify-between p-2 border border-terminal-border/50 rounded">
              <div>
                <span className="text-sm text-terminal-text">{strat.name}</span>
                <div className="flex gap-3 text-[10px] text-terminal-text-muted mt-0.5">
                  <span>Sharpe: {strat.sharpe}</span>
                  <span>Win Rate: {(strat.winRate * 100).toFixed(0)}%</span>
                  <span>Backtested: {strat.trades} trades</span>
                </div>
              </div>
              <div className="flex gap-2">
                {deployConfirm === strat.name ? (
                  <>
                    <button
                      onClick={() => {
                        addToast({ type: 'success', title: 'Strategy Deployed', message: strat.name })
                        addAuditEntry({ user: auth.user?.name || 'system', action: `Deployed strategy: ${strat.name}`, category: 'trade', severity: 'info' })
                        setDeployConfirm(null)
                      }}
                      className="btn-primary text-xs"
                    >
                      Confirm
                    </button>
                    <button onClick={() => setDeployConfirm(null)} className="btn-outline text-xs">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setDeployConfirm(strat.name)} className="btn-primary text-xs">Deploy</button>
                    <button
                      onClick={() => {
                        addToast({ type: 'warning', title: 'Strategy Rejected', message: strat.name })
                        addAuditEntry({ user: auth.user?.name || 'system', action: `Rejected strategy: ${strat.name}`, category: 'trade', severity: 'warning' })
                      }}
                      className="btn-outline text-xs"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Stop */}
      {!emergencyActive && (
        <div className="card border-2 border-terminal-red/50">
          <h3 className="text-terminal-red text-sm font-bold mb-4">EMERGENCY STOP</h3>
          <p className="text-xs text-terminal-text-dim mb-2">Immediately close ALL open trades and halt ALL execution.</p>
          <p className="text-xs text-terminal-text-muted mb-4">Currently: 12 open positions, $116,480 invested, {runningCount} agents running.</p>
          <button onClick={() => setEmergencyConfirm(true)} className="btn-danger">Initiate Emergency Stop</button>
        </div>
      )}

      {/* Emergency Stop Confirm Modal */}
      {emergencyConfirm && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEmergencyConfirm(false)} />
          <div className="relative bg-terminal-surface border-2 border-terminal-red rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-red-glow">
            <h3 className="text-terminal-red font-bold text-xl mb-4">EMERGENCY STOP</h3>
            <div className="bg-terminal-red/10 border border-terminal-red/30 rounded p-4 mb-6">
              <p className="text-terminal-red text-sm font-bold mb-3">This will immediately:</p>
              <ul className="text-terminal-text-dim text-sm space-y-2 list-disc list-inside">
                <li>Close all 12 open positions at market price</li>
                <li>Cancel all pending trade proposals</li>
                <li>Pause all 8 AI agents</li>
                <li>Send emergency notification to all owners</li>
              </ul>
            </div>
            <p className="text-terminal-text-muted text-xs mb-6">This action can be reversed from the controls panel.</p>
            <div className="flex items-center gap-4">
              <button onClick={handleEmergencyStop} className="btn-danger flex-1 py-3 text-base">CONFIRM EMERGENCY STOP</button>
              <button onClick={() => setEmergencyConfirm(false)} className="btn-outline flex-1 py-3">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Loss Limit Confirm Modal */}
      {limitConfirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setLimitConfirm(false)} />
          <div className="relative bg-terminal-surface border border-terminal-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-terminal-amber font-bold text-lg mb-2">Confirm Loss Limit Change</h3>
            <p className="text-terminal-text text-sm mb-1">
              New limit: <span className="text-terminal-green font-bold">${parseFloat(limitInput).toLocaleString()}</span>
            </p>
            <p className="text-terminal-text-dim text-xs mb-4">
              Previous: ${dailyLossLimit.toLocaleString()}. The kill switch will trigger at this new threshold.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setLimitConfirm(false)} className="btn-outline text-xs">Cancel</button>
              <button onClick={confirmSetLimit} className="btn-primary text-xs">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
