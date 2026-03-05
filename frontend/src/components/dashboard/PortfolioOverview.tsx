'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'

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

  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [chartExpanded, setChartExpanded] = useState(false)

  const equityCurve = [
    { day: 'D1', value: 100000 }, { day: 'D2', value: 100430 }, { day: 'D3', value: 101280 },
    { day: 'D4', value: 101050 }, { day: 'D5', value: 102310 }, { day: 'D6', value: 103740 },
    { day: 'D7', value: 103500 }, { day: 'D8', value: 104890 }, { day: 'D9', value: 106120 },
    { day: 'D10', value: 105680 }, { day: 'D11', value: 107430 }, { day: 'D12', value: 108910 },
    { day: 'D13', value: 109560 }, { day: 'D14', value: 110200 }, { day: 'D15', value: 112340 },
    { day: 'D16', value: 111870 }, { day: 'D17', value: 113650 }, { day: 'D18', value: 115290 },
    { day: 'D19', value: 116800 }, { day: 'D20', value: 116120 }, { day: 'D21', value: 118470 },
    { day: 'D22', value: 120130 }, { day: 'D23', value: 121890 }, { day: 'D24', value: 123450 },
    { day: 'D25', value: 122780 }, { day: 'D26', value: 125670 }, { day: 'D27', value: 128340 },
    { day: 'D28', value: 130100 }, { day: 'D29', value: 132870 }, { day: 'D30', value: 134720 },
  ]

  const sectorExposure = [
    { name: 'Technology', value: 42200, pct: 36.2, color: '#00ff88' },
    { name: 'Fintech', value: 24100, pct: 20.7, color: '#00cc6a' },
    { name: 'EV/Green Energy', value: 17400, pct: 14.9, color: '#ffaa00' },
    { name: 'Crypto/Blockchain', value: 14800, pct: 12.7, color: '#ff8844' },
    { name: 'Space/Defense', value: 9980, pct: 8.6, color: '#8888ff' },
    { name: 'Other', value: 8000, pct: 6.9, color: '#555555' },
  ]

  const benchmarkData = [
    { name: 'AI Hedge Fund', value: 34.72, fill: '#00ff88' },
    { name: 'S&P 500', value: 8.2, fill: '#555555' },
    { name: 'NASDAQ', value: 12.4, fill: '#888888' },
    { name: 'Top HFs avg', value: 5.8, fill: '#333333' },
  ]

  const topStrategies = [
    { name: 'WSB Steady Accumulator v3', return_pct: 48.2, win_rate: 0.94, trades: 67, capital: 18400 },
    { name: 'Penny Chatter Reversal', return_pct: 41.7, win_rate: 0.91, trades: 43, capital: 15200 },
    { name: 'r/stocks Momentum Alpha', return_pct: 38.9, win_rate: 0.88, trades: 52, capital: 12800 },
    { name: 'Spike Exit Sniper v2', return_pct: 35.1, win_rate: 0.93, trades: 89, capital: 11500 },
    { name: 'Theta Gang Contrarian', return_pct: 29.4, win_rate: 0.86, trades: 31, capital: 9800 },
  ]

  const transactions = [
    { date: '2026-03-05', action: 'BUY', ticker: 'PLTR', qty: 150, price: 24.30, total: 3645, pnl: null as number | null },
    { date: '2026-03-05', action: 'SELL', ticker: 'AMC', qty: 120, price: 5.82, total: 698.40, pnl: 247.20 },
    { date: '2026-03-04', action: 'BUY', ticker: 'IONQ', qty: 180, price: 12.40, total: 2232, pnl: null },
    { date: '2026-03-04', action: 'SELL', ticker: 'MSTR', qty: 75, price: 1720.00, total: 129000, pnl: 1635 },
    { date: '2026-03-04', action: 'BUY', ticker: 'SOFI', qty: 300, price: 8.45, total: 2535, pnl: null },
    { date: '2026-03-03', action: 'SELL', ticker: 'UPST', qty: 60, price: 32.80, total: 1968, pnl: -89.40 },
    { date: '2026-03-03', action: 'BUY', ticker: 'COIN', qty: 35, price: 225.60, total: 7896, pnl: null },
    { date: '2026-03-02', action: 'SELL', ticker: 'BBBY', qty: 500, price: 0.42, total: 210, pnl: 385 },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-terminal-surface border border-terminal-green/30 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-terminal-text-muted text-[10px]">{label}</p>
          <p className="text-terminal-green font-bold text-sm">${payload[0].value.toLocaleString()}</p>
          <p className="text-terminal-green text-[10px]">
            +${(payload[0].value - 100000).toLocaleString()} ({((payload[0].value - 100000) / 1000).toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-xl font-bold">Portfolio Overview</h2>

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
          <p className="metric-label">Today P&L</p>
          <p className="metric-value text-terminal-green">+${portfolio.daily_pnl.toLocaleString()}</p>
          <p className="text-xs text-terminal-green mt-1">+{((portfolio.daily_pnl / portfolio.total_value) * 100).toFixed(2)}%</p>
        </div>
        <div className="card">
          <p className="metric-label">Active Strategies</p>
          <p className="metric-value text-terminal-amber">{portfolio.strategies_active}</p>
          <p className="text-xs text-terminal-text-muted mt-1">{portfolio.positions_count} open positions</p>
        </div>
      </div>

      {/* Equity Curve — Recharts */}
      <div className={clsx('card transition-all', chartExpanded && 'fixed inset-4 z-50 bg-terminal-surface')}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-terminal-green text-sm font-bold">EQUITY CURVE</h3>
          <div className="flex items-center gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={clsx(
                  'text-[10px] px-2 py-1 rounded',
                  timeframe === tf
                    ? 'bg-terminal-green text-terminal-bg font-bold'
                    : 'text-terminal-text-muted hover:text-terminal-green'
                )}
              >
                {tf.toUpperCase()}
              </button>
            ))}
            <button
              onClick={() => setChartExpanded(!chartExpanded)}
              className="text-terminal-text-muted hover:text-terminal-green text-xs ml-2"
              title={chartExpanded ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {chartExpanded ? 'X' : '[+]'}
            </button>
          </div>
        </div>
        <div className={clsx(chartExpanded ? 'h-[calc(100%-60px)]' : 'h-64 md:h-80')}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityCurve} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 10 }} axisLine={{ stroke: '#1a1a1a' }} />
              <YAxis
                tick={{ fill: '#555', fontSize: 10 }}
                axisLine={{ stroke: '#1a1a1a' }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                domain={['dataMin - 1000', 'dataMax + 1000']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#00ff88" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-2 text-terminal-text-muted text-[10px]">
          <span>$100,000 — Start</span>
          <span className="text-terminal-green font-bold">+${(portfolio.total_value - 100000).toLocaleString()} ({portfolio.total_return_pct}%)</span>
          <span>${portfolio.total_value.toLocaleString()} — Today</span>
        </div>
      </div>

      {/* Sector Exposure + Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-terminal-green text-sm font-bold mb-4">SECTOR EXPOSURE</h3>
          <div className="flex items-center gap-4">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sectorExposure} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={2} dataKey="value">
                    {sectorExposure.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-terminal-surface border border-terminal-border rounded px-2 py-1 text-xs">
                            <p className="text-terminal-text font-bold">{data.name}</p>
                            <p className="text-terminal-green">${data.value.toLocaleString()} ({data.pct}%)</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {sectorExposure.map((sector) => (
                <div key={sector.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: sector.color }} />
                  <span className="text-terminal-text-dim flex-1">{sector.name}</span>
                  <span className="text-terminal-text font-bold">{sector.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-terminal-green text-sm font-bold mb-4">vs BENCHMARKS (Same Period)</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#555', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#888', fontSize: 10 }} width={90} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-terminal-surface border border-terminal-border rounded px-2 py-1 text-xs">
                          <p className="text-terminal-green font-bold">+{payload[0].value}%</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {benchmarkData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-terminal-text-muted mt-2">
            Alpha over S&P 500: <span className="text-terminal-green font-bold">+{(34.72 - 8.2).toFixed(1)}%</span>
          </p>
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
                <th className="text-right py-2 hidden md:table-cell">Capital</th>
              </tr>
            </thead>
            <tbody>
              {topStrategies.map((s, i) => (
                <tr key={i} className="border-b border-terminal-border/50 hover:bg-terminal-green/5">
                  <td className="py-2 text-terminal-text-muted">{i + 1}</td>
                  <td className="py-2 text-terminal-text">{s.name}</td>
                  <td className="py-2 text-right text-terminal-green font-bold">+{s.return_pct}%</td>
                  <td className="py-2 text-right text-terminal-green">{(s.win_rate * 100).toFixed(0)}%</td>
                  <td className="py-2 text-right text-terminal-text-dim">{s.trades}</td>
                  <td className="py-2 text-right text-terminal-text-dim hidden md:table-cell">${s.capital.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">RECENT TRANSACTIONS</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-terminal-text-muted border-b border-terminal-border">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Action</th>
                <th className="text-left py-2">Ticker</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2 hidden md:table-cell">Total</th>
                <th className="text-right py-2">P&L</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i} className="border-b border-terminal-border/50">
                  <td className="py-2 text-terminal-text-muted text-xs">{t.date}</td>
                  <td className={clsx('py-2 font-bold', t.action === 'BUY' ? 'text-terminal-green' : 'text-terminal-red')}>
                    {t.action}
                  </td>
                  <td className="py-2 text-terminal-green font-bold">${t.ticker}</td>
                  <td className="py-2 text-right text-terminal-text">{t.qty}</td>
                  <td className="py-2 text-right text-terminal-text-dim">${t.price.toFixed(2)}</td>
                  <td className="py-2 text-right text-terminal-text hidden md:table-cell">${t.total.toLocaleString()}</td>
                  <td className={clsx('py-2 text-right font-bold',
                    t.pnl === null ? 'text-terminal-text-muted' : t.pnl >= 0 ? 'text-terminal-green' : 'text-terminal-red'
                  )}>
                    {t.pnl === null ? '—' : `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}`}
                  </td>
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
              <span className="text-terminal-text-dim text-sm">Current Pace</span>
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
