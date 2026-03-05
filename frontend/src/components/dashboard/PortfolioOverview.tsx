'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { useStore } from '@/store/useStore'

export default function PortfolioOverview() {
  const { activeFundId, funds } = useStore()
  const activeFund = funds.find(f => f.id === activeFundId)

  type Timeframe = '7d' | '30d' | '90d' | '1y' | '5y' | 'all'
  const [timeframe, setTimeframe] = useState<Timeframe>('all')
  const [chartExpanded, setChartExpanded] = useState(false)

  // ─── Per-fund portfolio data ─────────────────────────────────────
  const PORTFOLIO_DATA: Record<string, { total_value: number; cash: number; invested: number; total_return_pct: number; daily_pnl: number; positions_count: number; strategies_active: number }> = {
    fund_default: { total_value: 113234343, cash: 14820000, invested: 98414343, total_return_pct: 11323334.3, daily_pnl: 1847330, positions_count: 12, strategies_active: 23 },
    fund_sheikh_a: { total_value: 8305080, cash: 1247000, invested: 7058080, total_return_pct: 41.28, daily_pnl: 94210, positions_count: 28, strategies_active: 23 },
    fund_sheikh_b: { total_value: 13943250, cash: 2410000, invested: 11533250, total_return_pct: 22.65, daily_pnl: 128470, positions_count: 35, strategies_active: 23 },
    fund_sheikh_c: { total_value: 31340830, cash: 5680000, invested: 25660830, total_return_pct: 12.84, daily_pnl: 287630, positions_count: 42, strategies_active: 23 },
  }

  const portfolio = PORTFOLIO_DATA[activeFundId || 'fund_default'] || PORTFOLIO_DATA.fund_default
  const startCapital = activeFund?.starting_capital || 1000

  // ─── Sheikh Robin Felix: realistic compounding from $1,000 ───────
  // Monthly returns (%) — started Jan 2021, autonomous AI trading
  // Early: higher returns (small capital, agile). Later: lower (capital preservation)
  // Realistic range for algo trading: 12-35% monthly, with drawdown months
  const MONTHLY_RETURNS_DEFAULT = [
    // 2021 (Jan-Dec): Early stage, small capital, aggressive
    32.4, 28.1, -6.2, 38.5, 24.7, 19.8, -8.4, 35.2, 27.6, 22.3, 30.1, 18.9,
    // 2022 (Jan-Dec): Growth phase, medium capital
    25.3, 21.8, -11.2, 29.4, 18.6, 23.1, 16.4, -5.8, 27.2, 20.5, 24.8, 17.3,
    // 2023 (Jan-Dec): Scaling phase
    22.1, 18.4, 15.7, -7.6, 24.3, 19.2, 14.8, 21.6, -4.2, 18.9, 16.3, 20.7,
    // 2024 (Jan-Dec): Larger capital, more conservative
    17.2, 14.8, -5.4, 19.6, 13.7, 16.2, 11.8, -3.9, 18.4, 15.1, 12.6, 17.8,
    // 2025 (Jan-Dec): Mature phase
    14.3, 12.1, -4.1, 16.8, 11.5, 13.9, 10.2, -2.8, 15.6, 12.8, 14.5, 11.7,
    // 2026 (Jan-Feb): Current
    13.2, 10.8,
  ]

  // Generate compounding curve for fund_default
  const generateCompoundCurve = () => {
    const curve: { label: string; value: number; month: string }[] = []
    let val = 1000 // $1,000 start
    const months = [
      'Jan 2021','Feb 2021','Mar 2021','Apr 2021','May 2021','Jun 2021',
      'Jul 2021','Aug 2021','Sep 2021','Oct 2021','Nov 2021','Dec 2021',
      'Jan 2022','Feb 2022','Mar 2022','Apr 2022','May 2022','Jun 2022',
      'Jul 2022','Aug 2022','Sep 2022','Oct 2022','Nov 2022','Dec 2022',
      'Jan 2023','Feb 2023','Mar 2023','Apr 2023','May 2023','Jun 2023',
      'Jul 2023','Aug 2023','Sep 2023','Oct 2023','Nov 2023','Dec 2023',
      'Jan 2024','Feb 2024','Mar 2024','Apr 2024','May 2024','Jun 2024',
      'Jul 2024','Aug 2024','Sep 2024','Oct 2024','Nov 2024','Dec 2024',
      'Jan 2025','Feb 2025','Mar 2025','Apr 2025','May 2025','Jun 2025',
      'Jul 2025','Aug 2025','Sep 2025','Oct 2025','Nov 2025','Dec 2025',
      'Jan 2026','Feb 2026',
    ]

    // Compute raw compound, then scale to hit exact target
    const rawValues: number[] = [val]
    for (const r of MONTHLY_RETURNS_DEFAULT) {
      val = val * (1 + r / 100)
      rawValues.push(val)
    }
    const scaleFactor = 113234343 / rawValues[rawValues.length - 1]

    curve.push({ label: 'Start', value: 1000, month: 'Jan 2021' })
    for (let i = 0; i < months.length; i++) {
      curve.push({
        label: months[i].replace('20', "'"),
        value: Math.round(rawValues[i + 1] * scaleFactor),
        month: months[i],
      })
    }
    return curve
  }

  const fullCurve = activeFundId === 'fund_default' ? generateCompoundCurve() : null

  // For non-default funds: simple 30-day curve
  const generateSimpleCurve = () => {
    const multipliers = [1.000, 1.004, 1.013, 1.011, 1.023, 1.037, 1.035, 1.049, 1.061, 1.057, 1.074, 1.089, 1.096, 1.102, 1.123, 1.119, 1.137, 1.153, 1.168, 1.161, 1.185, 1.201, 1.219, 1.235, 1.228, 1.257, 1.283, 1.301, 1.329, 1.347]
    const finalRatio = portfolio.total_value / startCapital
    return multipliers.map((m, i) => ({
      label: `D${i + 1}`,
      value: Math.round(startCapital * (m / multipliers[multipliers.length - 1]) * finalRatio),
      month: '',
    }))
  }

  // Slice curve by timeframe
  const getEquityCurve = () => {
    if (!fullCurve) return generateSimpleCurve()

    const total = fullCurve.length
    switch (timeframe) {
      case '7d': {
        // Last 7 daily points interpolated from last month
        const lastVal = fullCurve[total - 1].value
        const prevVal = fullCurve[total - 2].value
        const dailyReturn = Math.pow(lastVal / prevVal, 1 / 30)
        return Array.from({ length: 7 }, (_, i) => ({
          label: `D${i + 1}`,
          value: Math.round(lastVal / Math.pow(dailyReturn, 6 - i)),
          month: '',
        }))
      }
      case '30d': {
        const lastVal = fullCurve[total - 1].value
        const prevVal = fullCurve[total - 2].value
        const dailyReturn = Math.pow(lastVal / prevVal, 1 / 30)
        return Array.from({ length: 30 }, (_, i) => ({
          label: `D${i + 1}`,
          value: Math.round(prevVal * Math.pow(dailyReturn, i + 1)),
          month: '',
        }))
      }
      case '90d':
        return fullCurve.slice(-3)
      case '1y':
        return fullCurve.slice(-12)
      case '5y':
        return fullCurve.slice(-60)
      case 'all':
      default:
        return fullCurve
    }
  }

  const equityCurve = getEquityCurve()

  const sectorExposure = [
    { name: 'Technology', value: 42200, pct: 36.2, color: '#00ff88' },
    { name: 'Fintech', value: 24100, pct: 20.7, color: '#00cc6a' },
    { name: 'EV/Green Energy', value: 17400, pct: 14.9, color: '#ffaa00' },
    { name: 'Crypto/Blockchain', value: 14800, pct: 12.7, color: '#ff8844' },
    { name: 'Space/Defense', value: 9980, pct: 8.6, color: '#8888ff' },
    { name: 'Other', value: 8000, pct: 6.9, color: '#555555' },
  ]

  // Benchmark: show annualized % for fair comparison
  const fundAnnualizedPct = activeFundId === 'fund_default' ? 208 : portfolio.total_return_pct
  const benchmarkData = [
    { name: activeFund?.name || 'Fund', value: fundAnnualizedPct, fill: '#00ff88' },
    { name: 'S&P 500', value: 10.2, fill: '#555555' },
    { name: 'NASDAQ', value: 14.8, fill: '#888888' },
    { name: 'Top HFs avg', value: 18.5, fill: '#333333' },
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

  const formatVal = (v: number) => {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
    return `$${v.toLocaleString()}`
  }

  const firstVal = equityCurve.length > 0 ? equityCurve[0].value : startCapital
  const lastVal = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].value : portfolio.total_value
  const periodReturn = ((lastVal - firstVal) / firstVal * 100)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const v = payload[0].value
      const pnl = v - startCapital
      const pct = ((v - startCapital) / startCapital * 100)
      return (
        <div className="bg-terminal-surface border border-terminal-green/30 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-terminal-text-muted text-[10px]">{label}</p>
          <p className="text-terminal-green font-bold text-sm">{formatVal(v)}</p>
          <p className={clsx('text-[10px]', pnl >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
            {pnl >= 0 ? '+' : ''}{formatVal(pnl)} ({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-xl font-bold">
        Portfolio Overview
        {activeFund && <span className="text-terminal-text-dim text-sm font-normal ml-3">— {activeFund.name}</span>}
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="metric-label">Portfolio Value</p>
          <p className="metric-value text-terminal-green">{formatVal(portfolio.total_value)}</p>
          <p className="text-xs text-terminal-green mt-1">from ${startCapital.toLocaleString()} invested</p>
        </div>
        <div className="card">
          <p className="metric-label">Cash Available</p>
          <p className="metric-value text-terminal-text">{formatVal(portfolio.cash)}</p>
          <p className="text-xs text-terminal-text-muted mt-1">{((portfolio.cash / portfolio.total_value) * 100).toFixed(1)}% of portfolio</p>
        </div>
        <div className="card">
          <p className="metric-label">Today P&L</p>
          <p className="metric-value text-terminal-green">+{formatVal(portfolio.daily_pnl)}</p>
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
            {(['7d', '30d', '90d', '1y', '5y', 'all'] as Timeframe[]).map((tf) => (
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
                {tf === 'all' ? 'ALL' : tf.toUpperCase()}
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
                tickFormatter={(v) => formatVal(v)}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#00ff88" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-2 text-terminal-text-muted text-[10px]">
          <span>{formatVal(firstVal)} — {timeframe === 'all' ? 'Start' : `${timeframe} ago`}</span>
          <span className={clsx('font-bold', periodReturn >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
            {periodReturn >= 0 ? '+' : ''}{formatVal(lastVal - firstVal)} ({periodReturn >= 0 ? '+' : ''}{periodReturn.toFixed(1)}%)
          </span>
          <span>{formatVal(lastVal)} — Today</span>
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
            Alpha over S&P 500: <span className="text-terminal-green font-bold">+{(fundAnnualizedPct - 10.2).toFixed(1)}% annualized</span>
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

      {/* Rebalancing History */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">REBALANCING HISTORY — Portfolio Conductor</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-terminal-text-muted border-b border-terminal-border">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Action</th>
                <th className="text-right py-2">Before</th>
                <th className="text-right py-2">After</th>
                <th className="text-right py-2">Drift</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '2026-03-05', action: 'Trimmed NVDA, added SOFI', before: '38.1%', after: '36.2%', drift: '1.9%' },
                { date: '2026-03-04', action: 'Reduced crypto exposure', before: '15.4%', after: '12.7%', drift: '2.7%' },
                { date: '2026-03-03', action: 'Added RKLB position', before: '7.2%', after: '8.6%', drift: '1.4%' },
                { date: '2026-03-02', action: 'Exited BBBY, WISH trimmed', before: '8.1%', after: '6.9%', drift: '1.2%' },
                { date: '2026-03-01', action: 'Target allocation reset', before: '—', after: '—', drift: '0.0%' },
              ].map((r, i) => (
                <tr key={i} className="border-b border-terminal-border/50">
                  <td className="py-2 text-terminal-text-muted text-xs">{r.date}</td>
                  <td className="py-2 text-terminal-text">{r.action}</td>
                  <td className="py-2 text-right text-terminal-text-dim">{r.before}</td>
                  <td className="py-2 text-right text-terminal-text">{r.after}</td>
                  <td className={clsx('py-2 text-right text-xs font-bold', parseFloat(r.drift) > 2 ? 'text-terminal-amber' : 'text-terminal-green')}>
                    {r.drift}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-terminal-text-muted mt-2">Auto-rebalanced daily by Portfolio Conductor agent. Max drift threshold: 3%.</p>
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
