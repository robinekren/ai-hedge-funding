'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

/**
 * Portfolio Overview Screen
 * Total performance, equity curve, returns by strategy.
 */
export default function PortfolioOverview() {
  const [portfolio] = useState({
    total_value: 100000,
    cash: 5000,
    invested: 95000,
    total_return_pct: 0,
    daily_pnl: 0,
    positions_count: 0,
    strategies_active: 0,
  })

  const equityCurve = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: 100000 + Math.random() * 5000 * (i / 30),
  }))

  const maxVal = Math.max(...equityCurve.map(d => d.value))
  const minVal = Math.min(...equityCurve.map(d => d.value))

  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-xl font-bold">◈ Portfolio Overview</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="metric-label">Portfolio Value</p>
          <p className="metric-value text-terminal-green">${portfolio.total_value.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="metric-label">Cash Available</p>
          <p className="metric-value text-terminal-text">${portfolio.cash.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="metric-label">Invested</p>
          <p className="metric-value text-terminal-text">${portfolio.invested.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="metric-label">Active Strategies</p>
          <p className="metric-value text-terminal-amber">{portfolio.strategies_active}</p>
        </div>
      </div>

      {/* Equity Curve */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">EQUITY CURVE</h3>
        <div className="h-48 md:h-64 flex items-end gap-[2px]">
          {equityCurve.map((point, i) => {
            const height = ((point.value - minVal) / (maxVal - minVal)) * 100
            return (
              <div
                key={i}
                className="flex-1 bg-terminal-green/30 hover:bg-terminal-green/60 transition-colors rounded-t"
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`Day ${point.day}: $${point.value.toFixed(0)}`}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-terminal-text-muted text-[10px]">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Target Metrics */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">TARGET METRICS</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex justify-between items-center py-2 border-b border-terminal-border">
            <span className="text-terminal-text-dim text-sm">Target Annual Return</span>
            <span className="text-terminal-green font-bold">180%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-terminal-border">
            <span className="text-terminal-text-dim text-sm">Target Win Rate</span>
            <span className="text-terminal-green font-bold">90%+</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-terminal-border">
            <span className="text-terminal-text-dim text-sm">Target Sharpe Ratio</span>
            <span className="text-terminal-green font-bold">2.5</span>
          </div>
        </div>
      </div>
    </div>
  )
}
