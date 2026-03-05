'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

/**
 * Risk Monitor Screen
 * Live drawdown, daily loss vs. limit, correlation heatmap.
 */
export default function RiskMonitor() {
  const [risk] = useState({
    daily_loss: 0,
    daily_loss_limit: 1000,
    max_drawdown: 0,
    current_drawdown: 0,
    kill_switch_triggered: false,
    correlation_matrix: {},
  })

  const lossPercent = risk.daily_loss_limit > 0
    ? (Math.abs(risk.daily_loss) / risk.daily_loss_limit) * 100
    : 0

  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-xl font-bold">△ Risk Monitor</h2>

      {/* Kill Switch Status */}
      <div className={clsx(
        'card border-2',
        risk.kill_switch_triggered
          ? 'border-terminal-red glow-red'
          : 'border-terminal-green/30'
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-terminal-text">KILL SWITCH STATUS</h3>
            <p className="text-xs text-terminal-text-dim mt-1">
              Daily-Loss-Limit: ${risk.daily_loss_limit.toLocaleString()}
            </p>
          </div>
          <div className={clsx(
            'px-4 py-2 rounded font-bold text-sm',
            risk.kill_switch_triggered
              ? 'bg-terminal-red/20 text-terminal-red'
              : 'bg-terminal-green/20 text-terminal-green'
          )}>
            {risk.kill_switch_triggered ? 'TRIGGERED' : 'SAFE'}
          </div>
        </div>

        {/* Loss bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-terminal-text-dim mb-1">
            <span>Daily Loss: ${Math.abs(risk.daily_loss).toFixed(2)}</span>
            <span>Limit: ${risk.daily_loss_limit.toFixed(2)}</span>
          </div>
          <div className="w-full h-3 bg-terminal-bg rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all',
                lossPercent > 80 ? 'bg-terminal-red' :
                lossPercent > 50 ? 'bg-terminal-amber' :
                'bg-terminal-green'
              )}
              style={{ width: `${Math.min(lossPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Drawdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="metric-label">Current Drawdown</p>
          <p className={clsx(
            'metric-value',
            risk.current_drawdown > 0.05 ? 'text-terminal-red' :
            risk.current_drawdown > 0.02 ? 'text-terminal-amber' :
            'text-terminal-green'
          )}>
            {(risk.current_drawdown * 100).toFixed(2)}%
          </p>
        </div>
        <div className="card">
          <p className="metric-label">Max Drawdown</p>
          <p className="metric-value text-terminal-text">
            {(risk.max_drawdown * 100).toFixed(2)}%
          </p>
        </div>
        <div className="card">
          <p className="metric-label">Daily P&L</p>
          <p className={clsx(
            'metric-value',
            risk.daily_loss >= 0 ? 'text-terminal-green' : 'text-terminal-red'
          )}>
            {risk.daily_loss >= 0 ? '+' : ''}${risk.daily_loss.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Correlation Heatmap Placeholder */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">CORRELATION HEATMAP</h3>
        <div className="text-center py-8 text-terminal-text-muted text-sm">
          Correlation data populates when positions are open
        </div>
      </div>

      {/* Risk Rules */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-3">RISK RULES</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">Max Position Size</span>
            <span className="text-terminal-text">5% of portfolio</span>
          </div>
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">Max Correlation</span>
            <span className="text-terminal-text">0.70</span>
          </div>
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">Daily Loss Limit</span>
            <span className="text-terminal-text">${risk.daily_loss_limit.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
