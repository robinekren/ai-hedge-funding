'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

/**
 * Portfolio Overview Screen
 * Total performance, equity curve, returns by strategy.
 */
export default function PortfolioOverview() {
  const [portfolio] = useState({
    total_value: 134720,
    cash: 18240,
    invested: 116480,
    total_return_pct: 34.72,
    daily_pnl: 1847.33,
    positions_count: 12,
    strategies_active: 23,
  })

  // Realistic 30-day equity curve — steady growth with natural variance
  const equityCurve = [
    { day: 1, value: 100000 }, { day: 2, value: 100430 }, { day: 3, value: 101280 },
    { day: 4, value: 101050 }, { day: 5, value: 102310 }, { day: 6, value: 103740 },
    { day: 7, value: 103500 }, { day: 8, value: 104890 }, { day: 9, value: 106120 },
    { day: 10, value: 105680 }, { day: 11, value: 107430 }, { day: 12, value: 108910 },
    { day: 13, value: 109560 }, { day: 14, value: 110200 }, { day: 15, value: 112340 },
    { day: 16, value: 111870 }, { day: 17, value: 113650 }, { day: 18, value: 115290 },
    { day: 19, value: 116800 }, { day: 20, value: 116120 }, { day: 21, value: 118470 },
    { day: 22, value: 120130 }, { day: 23, value: 121890 }, { day: 24, value: 123450 },
    { day: 25, value: 122780 }, { day: 26, value: 125670 }, { day: 27, value: 128340 },
    { day: 28, value: 130100 }, { day: 29, value: 132870 }, { day: 30, value: 134720 },
  ]

  // Top performing strategies
  const topStrategies = [
    { name: 'WSB Steady Accumulator v3', return_pct: 48.2, win_rate: 0.94, trades: 67 },
    { name: 'Penny Chatter Reversal', return_pct: 41.7, win_rate: 0.91, trades: 43 },
    { name: 'r/stocks Momentum Alpha', return_pct: 38.9, win_rate: 0.88, trades: 52 },
    { name: 'Spike Exit Sniper v2', return_pct: 35.1, win_rate: 0.93, trades: 89 },
    { name: 'Theta Gang Contrarian', return_pct: 29.4, win_rate: 0.86, trades: 31 },
  ]

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
          <p className="text-xs text-terminal-green mt-1">+{portfolio.total_return_pct}% all time</p>
        </div>
        <div className="card">
          <p className="metric-label">Cash Available</p>
          <p className="metric-value text-terminal-text">${portfolio.cash.toLocaleString()}</p>
          <p className="text-xs text-terminal-text-muted mt-1">{((portfolio.cash / portfolio.total_value) * 100).toFixed(1)}% of portfolio</p>
        </div>
        <div className="card">
          <p className="metric-label">Invested</p>
          <p className="metric-value text-terminal-text">${portfolio.invested.toLocaleString()}</p>
          <p className="text-xs text-terminal-text-muted mt-1">{portfolio.positions_count} open positions</p>
        </div>
        <div className="card">
          <p className="metric-label">Active Strategies</p>
          <p className="metric-value text-terminal-amber">{portfolio.strategies_active}</p>
          <p className="text-xs text-terminal-text-muted mt-1">of 100+ target</p>
        </div>
      </div>

      {/* Equity Curve */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-terminal-green text-sm font-bold">EQUITY CURVE — 30 DAYS</h3>
          <span className="text-terminal-green text-xs font-bold">+${(portfolio.total_value - 100000).toLocaleString()}</span>
        </div>
        <div className="h-48 md:h-64 flex items-end gap-[2px]">
          {equityCurve.map((point, i) => {
            const height = ((point.value - minVal) / (maxVal - minVal)) * 100
            const isDown = i > 0 && point.value < equityCurve[i - 1].value
            return (
              <div
                key={i}
                className={clsx(
                  'flex-1 hover:opacity-80 transition-colors rounded-t',
                  isDown ? 'bg-terminal-red/40' : 'bg-terminal-green/40'
                )}
                style={{ height: `${Math.max(height, 3)}%` }}
                title={`Day ${point.day}: $${point.value.toLocaleString()}`}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-terminal-text-muted text-[10px]">
          <span>$100,000 — Day 1</span>
          <span>${portfolio.total_value.toLocaleString()} — Today</span>
        </div>
      </div>

      {/* Top Strategies */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">TOP PERFORMING STRATEGIES</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-terminal-text-muted border-b border-terminal-border">
                <th className="text-left py-2">#</th>
                <th className="text-left py-2">Strategy</th>
                <th className="text-right py-2">Return</th>
                <th className="text-right py-2">Win Rate</th>
                <th className="text-right py-2">Trades</th>
              </tr>
            </thead>
            <tbody>
              {topStrategies.map((s, i) => (
                <tr key={i} className="border-b border-terminal-border/50">
                  <td className="py-2 text-terminal-text-muted">{i + 1}</td>
                  <td className="py-2 text-terminal-text">{s.name}</td>
                  <td className="py-2 text-right text-terminal-green font-bold">+{s.return_pct}%</td>
                  <td className="py-2 text-right text-terminal-green">{(s.win_rate * 100).toFixed(0)}%</td>
                  <td className="py-2 text-right text-terminal-text-dim">{s.trades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Metrics */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">TARGET vs ACTUAL</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between items-center py-2 border-b border-terminal-border">
              <span className="text-terminal-text-dim text-sm">Annual Return Target</span>
              <span className="text-terminal-green font-bold">180%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-terminal-text-dim text-sm">Current Pace (annualized)</span>
              <span className="text-terminal-green font-bold">~208%</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center py-2 border-b border-terminal-border">
              <span className="text-terminal-text-dim text-sm">Win Rate Target</span>
              <span className="text-terminal-green font-bold">90%+</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-terminal-text-dim text-sm">Current Win Rate</span>
              <span className="text-terminal-green font-bold">87.5%</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center py-2 border-b border-terminal-border">
              <span className="text-terminal-text-dim text-sm">Sharpe Target</span>
              <span className="text-terminal-green font-bold">2.5</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-terminal-text-dim text-sm">Current Sharpe</span>
              <span className="text-terminal-amber font-bold">2.31</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
