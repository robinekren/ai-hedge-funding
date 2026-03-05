'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

/**
 * Risk Monitor Screen
 * Live drawdown, daily loss vs. limit, correlation heatmap.
 */
export default function RiskMonitor() {
  const [risk] = useState({
    daily_loss: -47.20,
    daily_loss_limit: 1000,
    max_drawdown: 0.038,
    current_drawdown: 0.012,
    kill_switch_triggered: false,
    portfolio_beta: 1.15,
    var_95: 1842,
    var_99: 2910,
  })

  // Correlation matrix for current positions
  const tickers = ['PLTR', 'SOFI', 'NVDA', 'AMD', 'RIVN', 'MARA', 'TSLA', 'META']
  const correlations: number[][] = [
    [1.00, 0.42, 0.38, 0.51, 0.33, 0.29, 0.44, 0.35],
    [0.42, 1.00, 0.28, 0.31, 0.45, 0.52, 0.37, 0.22],
    [0.38, 0.28, 1.00, 0.72, 0.19, 0.21, 0.48, 0.61],
    [0.51, 0.31, 0.72, 1.00, 0.17, 0.25, 0.43, 0.55],
    [0.33, 0.45, 0.19, 0.17, 1.00, 0.38, 0.62, 0.14],
    [0.29, 0.52, 0.21, 0.25, 0.38, 1.00, 0.34, 0.18],
    [0.44, 0.37, 0.48, 0.43, 0.62, 0.34, 1.00, 0.41],
    [0.35, 0.22, 0.61, 0.55, 0.14, 0.18, 0.41, 1.00],
  ]

  // Drawdown history (last 30 days)
  const drawdownHistory = [
    0.000, 0.004, 0.002, 0.008, 0.003, 0.001, 0.012, 0.006, 0.002, 0.015,
    0.009, 0.003, 0.001, 0.018, 0.011, 0.005, 0.002, 0.022, 0.014, 0.007,
    0.003, 0.028, 0.019, 0.011, 0.006, 0.038, 0.024, 0.015, 0.008, 0.012,
  ]

  const lossPercent = risk.daily_loss_limit > 0
    ? (Math.abs(risk.daily_loss) / risk.daily_loss_limit) * 100
    : 0

  const getCorrColor = (val: number) => {
    if (val >= 1.0) return 'bg-terminal-green'
    if (val >= 0.7) return 'bg-terminal-red/80'
    if (val >= 0.5) return 'bg-terminal-amber/60'
    if (val >= 0.3) return 'bg-terminal-green/40'
    return 'bg-terminal-green/20'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-terminal-green text-xl font-bold">△ Risk Monitor</h2>
        <span className="text-terminal-green text-xs font-bold">ALL CLEAR</span>
      </div>

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
            <span>{lossPercent.toFixed(1)}% of limit</span>
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

      {/* Risk Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <p className="metric-value text-terminal-amber">
            {(risk.max_drawdown * 100).toFixed(2)}%
          </p>
        </div>
        <div className="card">
          <p className="metric-label">Portfolio Beta</p>
          <p className="metric-value text-terminal-text">
            {risk.portfolio_beta.toFixed(2)}
          </p>
        </div>
        <div className="card">
          <p className="metric-label">Daily P&L</p>
          <p className={clsx(
            'metric-value',
            risk.daily_loss >= 0 ? 'text-terminal-green' : 'text-terminal-red'
          )}>
            -${Math.abs(risk.daily_loss).toFixed(2)}
          </p>
        </div>
      </div>

      {/* VaR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <p className="metric-label">Value at Risk (95%)</p>
          <p className="metric-value text-terminal-amber">${risk.var_95.toLocaleString()}</p>
          <p className="text-[10px] text-terminal-text-muted mt-1">Max daily loss with 95% confidence</p>
        </div>
        <div className="card">
          <p className="metric-label">Value at Risk (99%)</p>
          <p className="metric-value text-terminal-red">${risk.var_99.toLocaleString()}</p>
          <p className="text-[10px] text-terminal-text-muted mt-1">Max daily loss with 99% confidence</p>
        </div>
      </div>

      {/* Drawdown History */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">DRAWDOWN HISTORY — 30 DAYS</h3>
        <div className="h-24 flex items-end gap-[2px]">
          {drawdownHistory.map((dd, i) => {
            const maxDD = Math.max(...drawdownHistory)
            const height = maxDD > 0 ? (dd / maxDD) * 100 : 0
            return (
              <div
                key={i}
                className={clsx(
                  'flex-1 rounded-t',
                  dd > 0.03 ? 'bg-terminal-red/60' :
                  dd > 0.015 ? 'bg-terminal-amber/60' :
                  'bg-terminal-green/40'
                )}
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`Day ${i + 1}: ${(dd * 100).toFixed(2)}% drawdown`}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-terminal-text-muted text-[10px]">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Correlation Heatmap */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">CORRELATION HEATMAP</h3>
        <div className="overflow-x-auto">
          <table className="text-[10px]">
            <thead>
              <tr>
                <th className="p-1"></th>
                {tickers.map(t => (
                  <th key={t} className="p-1 text-terminal-text-muted font-normal">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickers.map((t, i) => (
                <tr key={t}>
                  <td className="p-1 text-terminal-text-muted">{t}</td>
                  {correlations[i].map((val, j) => (
                    <td key={j} className="p-0.5">
                      <div
                        className={clsx(
                          'w-8 h-6 rounded flex items-center justify-center text-[9px] font-bold',
                          getCorrColor(val),
                          val >= 0.7 && val < 1.0 ? 'text-white' : 'text-terminal-text'
                        )}
                        title={`${tickers[i]} ↔ ${tickers[j]}: ${val.toFixed(2)}`}
                      >
                        {val.toFixed(1)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-3 text-[10px] text-terminal-text-muted">
          <span className="flex items-center gap-1"><span className="w-3 h-2 bg-terminal-green/20 rounded" /> &lt;0.3 Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 bg-terminal-green/40 rounded" /> 0.3-0.5</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 bg-terminal-amber/60 rounded" /> 0.5-0.7</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 bg-terminal-red/80 rounded" /> &gt;0.7 High</span>
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
            <div className="flex items-center gap-2">
              <span className="text-terminal-text">0.70</span>
              <span className="text-terminal-green text-xs">(NVDA-AMD: 0.72 — flagged)</span>
            </div>
          </div>
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">Daily Loss Limit</span>
            <span className="text-terminal-text">${risk.daily_loss_limit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">Max Drawdown Threshold</span>
            <span className="text-terminal-text">10%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
