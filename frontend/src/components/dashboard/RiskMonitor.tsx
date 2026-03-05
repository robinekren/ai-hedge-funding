'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, Cell,
} from 'recharts'
import { useStore } from '@/store/useStore'

export default function RiskMonitor() {
  const { dailyLossLimit, activeFundId, funds } = useStore()
  const activeFund = funds.find(f => f.id === activeFundId)

  const [risk] = useState({
    daily_loss: -47.20,
    max_drawdown: 0.038,
    current_drawdown: 0.012,
    kill_switch_triggered: false,
    portfolio_beta: 1.15,
    var_95: 1842,
    var_99: 2910,
  })

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

  // Drawdown history with Recharts data
  const drawdownData = [
    { day: 1, dd: 0.0 }, { day: 2, dd: 0.4 }, { day: 3, dd: 0.2 }, { day: 4, dd: 0.8 },
    { day: 5, dd: 0.3 }, { day: 6, dd: 0.1 }, { day: 7, dd: 1.2 }, { day: 8, dd: 0.6 },
    { day: 9, dd: 0.2 }, { day: 10, dd: 1.5 }, { day: 11, dd: 0.9 }, { day: 12, dd: 0.3 },
    { day: 13, dd: 0.1 }, { day: 14, dd: 1.8 }, { day: 15, dd: 1.1 }, { day: 16, dd: 0.5 },
    { day: 17, dd: 0.2 }, { day: 18, dd: 2.2 }, { day: 19, dd: 1.4 }, { day: 20, dd: 0.7 },
    { day: 21, dd: 0.3 }, { day: 22, dd: 2.8 }, { day: 23, dd: 1.9 }, { day: 24, dd: 1.1 },
    { day: 25, dd: 0.6 }, { day: 26, dd: 3.8 }, { day: 27, dd: 2.4 }, { day: 28, dd: 1.5 },
    { day: 29, dd: 0.8 }, { day: 30, dd: 1.2 },
  ]

  // Sharpe Ratio trend
  const sharpeHistory = [
    { week: 'W1', sharpe: 1.82, sortino: 2.10, calmar: 1.45 },
    { week: 'W2', sharpe: 1.95, sortino: 2.28, calmar: 1.52 },
    { week: 'W3', sharpe: 2.14, sortino: 2.51, calmar: 1.68 },
    { week: 'W4', sharpe: 2.31, sortino: 2.74, calmar: 1.89 },
  ]

  // Stress Test scenarios
  const stressTests = [
    { scenario: 'Market -5%', impact: -6120, pct: -4.54, color: 'text-terminal-amber' },
    { scenario: 'Market -10%', impact: -13450, pct: -9.98, color: 'text-terminal-red' },
    { scenario: 'Market -20% (Crash)', impact: -29870, pct: -22.17, color: 'text-terminal-red' },
    { scenario: 'Tech Sector -15%', impact: -18340, pct: -13.61, color: 'text-terminal-red' },
    { scenario: 'Interest Rate +2%', impact: -4280, pct: -3.18, color: 'text-terminal-amber' },
    { scenario: 'VIX Spike to 40', impact: -8920, pct: -6.62, color: 'text-terminal-amber' },
  ]

  // Liquidity analysis
  const liquidityData = [
    { ticker: 'NVDA', avgVolume: '45M', daysToExit: 0.01, liquidity: 'Excellent' },
    { ticker: 'TSLA', avgVolume: '78M', daysToExit: 0.01, liquidity: 'Excellent' },
    { ticker: 'META', avgVolume: '22M', daysToExit: 0.01, liquidity: 'Excellent' },
    { ticker: 'PLTR', avgVolume: '32M', daysToExit: 0.01, liquidity: 'Excellent' },
    { ticker: 'AMD', avgVolume: '52M', daysToExit: 0.01, liquidity: 'Excellent' },
    { ticker: 'SOFI', avgVolume: '28M', daysToExit: 0.01, liquidity: 'Good' },
    { ticker: 'MARA', avgVolume: '15M', daysToExit: 0.02, liquidity: 'Good' },
    { ticker: 'IONQ', avgVolume: '4M', daysToExit: 0.05, liquidity: 'Moderate' },
    { ticker: 'RKLB', avgVolume: '3M', daysToExit: 0.13, liquidity: 'Moderate' },
    { ticker: 'RIVN', avgVolume: '18M', daysToExit: 0.01, liquidity: 'Good' },
    { ticker: 'COIN', avgVolume: '8M', daysToExit: 0.01, liquidity: 'Good' },
    { ticker: 'AAPL', avgVolume: '65M', daysToExit: 0.01, liquidity: 'Excellent' },
  ]

  const lossPercent = dailyLossLimit > 0 ? (Math.abs(risk.daily_loss) / dailyLossLimit) * 100 : 0

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
        <h2 className="text-terminal-green text-xl font-bold">
          Risk Monitor
          {activeFund && <span className="text-terminal-text-dim text-sm font-normal ml-3">— {activeFund.name}</span>}
        </h2>
        <span className="text-terminal-green text-xs font-bold">ALL CLEAR</span>
      </div>

      {/* Kill Switch */}
      <div className={clsx('card border-2', risk.kill_switch_triggered ? 'border-terminal-red glow-red' : 'border-terminal-green/30')}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-terminal-text">KILL SWITCH STATUS</h3>
            <p className="text-xs text-terminal-text-dim mt-1">Daily-Loss-Limit: ${dailyLossLimit.toLocaleString()}</p>
          </div>
          <div className={clsx('px-4 py-2 rounded font-bold text-sm', risk.kill_switch_triggered ? 'bg-terminal-red/20 text-terminal-red' : 'bg-terminal-green/20 text-terminal-green')}>
            {risk.kill_switch_triggered ? 'TRIGGERED' : 'SAFE'}
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-terminal-text-dim mb-1">
            <span>Daily Loss: ${Math.abs(risk.daily_loss).toFixed(2)}</span>
            <span>{lossPercent.toFixed(1)}% of limit</span>
            <span>Limit: ${dailyLossLimit.toFixed(2)}</span>
          </div>
          <div className="w-full h-3 bg-terminal-bg rounded-full overflow-hidden">
            <div
              className={clsx('h-full rounded-full transition-all', lossPercent > 80 ? 'bg-terminal-red' : lossPercent > 50 ? 'bg-terminal-amber' : 'bg-terminal-green')}
              style={{ width: `${Math.min(lossPercent, 100)}%` }}
            />
          </div>
          {/* Warning thresholds */}
          <div className="flex justify-between text-[10px] text-terminal-text-muted mt-1">
            <span>0%</span>
            <span className="text-terminal-amber">50% Warning</span>
            <span className="text-terminal-red">80% Critical</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="metric-label">Current Drawdown</p>
          <p className={clsx('metric-value', risk.current_drawdown > 0.05 ? 'text-terminal-red' : risk.current_drawdown > 0.02 ? 'text-terminal-amber' : 'text-terminal-green')}>
            {(risk.current_drawdown * 100).toFixed(2)}%
          </p>
        </div>
        <div className="card">
          <p className="metric-label">Max Drawdown</p>
          <p className="metric-value text-terminal-amber">{(risk.max_drawdown * 100).toFixed(2)}%</p>
        </div>
        <div className="card">
          <p className="metric-label">VaR (95%)</p>
          <p className="metric-value text-terminal-amber">${risk.var_95.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="metric-label">VaR (99%)</p>
          <p className="metric-value text-terminal-red">${risk.var_99.toLocaleString()}</p>
        </div>
      </div>

      {/* Drawdown Chart */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">DRAWDOWN HISTORY — 30 DAYS</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={drawdownData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="colorDD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3355" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ff3355" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 10 }} />
              <YAxis tick={{ fill: '#555', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-terminal-surface border border-terminal-red/30 rounded px-2 py-1 text-xs">
                        <p className="text-terminal-text-muted">Day {label}</p>
                        <p className="text-terminal-red font-bold">{payload[0].value}% drawdown</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area type="monotone" dataKey="dd" stroke="#ff3355" strokeWidth={2} fillOpacity={1} fill="url(#colorDD)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sharpe / Sortino / Calmar Trend */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">RISK-ADJUSTED RETURN RATIOS — Weekly Trend</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sharpeHistory} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="week" tick={{ fill: '#555', fontSize: 10 }} />
              <YAxis tick={{ fill: '#555', fontSize: 10 }} domain={[1, 3]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-terminal-surface border border-terminal-border rounded px-3 py-2 text-xs space-y-1">
                        <p className="text-terminal-text-muted">{label}</p>
                        {payload.map((p: any) => (
                          <p key={p.name} style={{ color: p.color }} className="font-bold">
                            {p.name}: {p.value}
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line type="monotone" dataKey="sharpe" stroke="#00ff88" strokeWidth={2} dot={{ fill: '#00ff88', r: 4 }} name="Sharpe" />
              <Line type="monotone" dataKey="sortino" stroke="#ffaa00" strokeWidth={2} dot={{ fill: '#ffaa00', r: 4 }} name="Sortino" />
              <Line type="monotone" dataKey="calmar" stroke="#8888ff" strokeWidth={2} dot={{ fill: '#8888ff', r: 4 }} name="Calmar" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-terminal-green" /> Sharpe</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-terminal-amber" /> Sortino</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#8888ff]" /> Calmar</span>
        </div>
      </div>

      {/* Stress Test */}
      <div className="card border border-terminal-red/20">
        <h3 className="text-terminal-red text-sm font-bold mb-4">STRESS TEST SCENARIOS</h3>
        <p className="text-xs text-terminal-text-dim mb-3">Estimated portfolio impact under extreme market conditions</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-terminal-text-muted border-b border-terminal-border">
                <th className="text-left py-2">Scenario</th>
                <th className="text-right py-2">Impact ($)</th>
                <th className="text-right py-2">Impact (%)</th>
                <th className="text-right py-2">Surviving</th>
              </tr>
            </thead>
            <tbody>
              {stressTests.map((test, i) => (
                <tr key={i} className="border-b border-terminal-border/50">
                  <td className="py-2 text-terminal-text">{test.scenario}</td>
                  <td className={clsx('py-2 text-right font-bold', test.color)}>
                    -${Math.abs(test.impact).toLocaleString()}
                  </td>
                  <td className={clsx('py-2 text-right font-bold', test.color)}>
                    {test.pct.toFixed(2)}%
                  </td>
                  <td className="py-2 text-right">
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded',
                      Math.abs(test.pct) < 10 ? 'bg-terminal-green/20 text-terminal-green' : 'bg-terminal-red/20 text-terminal-red'
                    )}>
                      {Math.abs(test.pct) < 10 ? 'YES' : 'AT RISK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Liquidity Analysis */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">LIQUIDITY ANALYSIS</h3>
        <p className="text-xs text-terminal-text-dim mb-3">How quickly each position can be liquidated at market</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-terminal-text-muted border-b border-terminal-border">
                <th className="text-left py-2">Ticker</th>
                <th className="text-right py-2">Avg Volume</th>
                <th className="text-right py-2">Days to Exit</th>
                <th className="text-right py-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {liquidityData.map((l) => (
                <tr key={l.ticker} className="border-b border-terminal-border/50">
                  <td className="py-1.5 text-terminal-green font-bold">${l.ticker}</td>
                  <td className="py-1.5 text-right text-terminal-text-dim">{l.avgVolume}</td>
                  <td className="py-1.5 text-right text-terminal-text">{l.daysToExit < 0.1 ? '<1h' : `${l.daysToExit}d`}</td>
                  <td className="py-1.5 text-right">
                    <span className={clsx('text-xs',
                      l.liquidity === 'Excellent' ? 'text-terminal-green' :
                      l.liquidity === 'Good' ? 'text-terminal-text' : 'text-terminal-amber'
                    )}>
                      {l.liquidity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-terminal-text-muted mt-2">
          Full portfolio exit time: <span className="text-terminal-green font-bold">&lt;2 hours</span> at market
        </p>
      </div>

      {/* Correlation Heatmap */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">CORRELATION HEATMAP</h3>
        <div className="overflow-x-auto">
          <table className="text-[10px]">
            <thead>
              <tr>
                <th className="p-1"></th>
                {tickers.map(t => <th key={t} className="p-1 text-terminal-text-muted font-normal">{t}</th>)}
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
                        title={`${tickers[i]} / ${tickers[j]}: ${val.toFixed(2)}`}
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
              <span className="text-terminal-amber text-xs">(NVDA-AMD: 0.72 — flagged)</span>
            </div>
          </div>
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">Daily Loss Limit</span>
            <span className="text-terminal-text">${dailyLossLimit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">Max Drawdown Threshold</span>
            <span className="text-terminal-text">10%</span>
          </div>
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">Portfolio Beta</span>
            <span className="text-terminal-text">{risk.portfolio_beta.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
