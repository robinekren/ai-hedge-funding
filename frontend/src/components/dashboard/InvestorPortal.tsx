'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useStore } from '@/store/useStore'

export default function InvestorPortal() {
  const { addToast, auth, activeFundId, funds } = useStore()
  const activeFund = funds.find(f => f.id === activeFundId)
  const isInvestor = auth.user?.role === 'investor'
  const [selectedLP, setSelectedLP] = useState(isInvestor ? 'lp_1' : 'all')

  // ─── Per-fund simulation data ─────────────────────────────────────
  const FUND_DATA: Record<string, {
    lpData: Record<string, { name: string; investment: number; share: number; joinDate: string }>
    investorData: { total_fund_return: number; capital_deployed: number; initial_capital: number; monthly_performance: { month: string; return_pct: number; cumulative: number }[]; fees: { management_pct: number; carry_pct: number; total_fees_ytd: number; net_return_after_fees: number } }
    capitalFlow: { date: string; inflow: number; outflow: number; nav: number }[]
  }> = {
    fund_default: {
      lpData: {
        robin: { name: 'Robin (GP)', investment: 500, share: 50.0, joinDate: 'Jan 2021' },
        felix: { name: 'Felix (GP)', investment: 500, share: 50.0, joinDate: 'Jan 2021' },
      },
      investorData: {
        total_fund_return: 11323334.3,
        capital_deployed: 113234343,
        initial_capital: 1000,
        monthly_performance: [
          { month: 'Oct 2025', return_pct: 12.8, cumulative: 8742100.0 },
          { month: 'Nov 2025', return_pct: 14.5, cumulative: 9912200.0 },
          { month: 'Dec 2025', return_pct: 11.7, cumulative: 10983400.0 },
          { month: 'Jan 2026', return_pct: 13.2, cumulative: 11223300.0 },
          { month: 'Feb 2026', return_pct: 10.8, cumulative: 11323334.3 },
        ],
        fees: { management_pct: 3.0, carry_pct: 50.0, total_fees_ytd: 8420000, net_return_after_fees: 5661667.2 },
      },
      capitalFlow: [
        { date: 'Jan 2021', inflow: 1000, outflow: 0, nav: 1324 },
        { date: 'Jan 2022', inflow: 0, outflow: 0, nav: 42180 },
        { date: 'Jan 2023', inflow: 0, outflow: 0, nav: 1284000 },
        { date: 'Jan 2024', inflow: 0, outflow: 0, nav: 18940000 },
        { date: 'Jan 2025', inflow: 0, outflow: 0, nav: 78420000 },
        { date: 'Feb 2026', inflow: 0, outflow: 0, nav: 113234343 },
      ],
    },
    fund_sheikh_a: {
      lpData: {
        sheikh_a: { name: 'Sheikh Abdullah (LP)', investment: 5000000, share: 85.0, joinDate: 'Nov 2025' },
        robin: { name: 'Robin (GP)', investment: 500000, share: 8.5, joinDate: 'Nov 2025' },
        felix: { name: 'Felix (GP)', investment: 382500, share: 6.5, joinDate: 'Nov 2025' },
      },
      investorData: {
        total_fund_return: 41.28,
        capital_deployed: 8305080,
        initial_capital: 5882500,
        monthly_performance: [
          { month: 'Nov 2025', return_pct: 11.34, cumulative: 11.34 },
          { month: 'Dec 2025', return_pct: 6.82, cumulative: 18.93 },
          { month: 'Jan 2026', return_pct: 14.21, cumulative: 35.83 },
          { month: 'Feb 2026', return_pct: 5.45, cumulative: 41.28 },
        ],
        fees: { management_pct: 3.0, carry_pct: 50.0, total_fees_ytd: 287400, net_return_after_fees: 35.62 },
      },
      capitalFlow: [
        { date: 'Nov 2025', inflow: 5882500, outflow: 0, nav: 6549560 },
        { date: 'Dec 2025', inflow: 0, outflow: 0, nav: 6996220 },
        { date: 'Jan 2026', inflow: 0, outflow: 0, nav: 7990120 },
        { date: 'Feb 2026', inflow: 0, outflow: 0, nav: 8305080 },
      ],
    },
    fund_sheikh_b: {
      lpData: {
        sheikh_b: { name: 'Sheikh Rashid (LP)', investment: 10000000, share: 88.0, joinDate: 'Dec 2025' },
        robin: { name: 'Robin (GP)', investment: 800000, share: 7.0, joinDate: 'Dec 2025' },
        felix: { name: 'Felix (GP)', investment: 568000, share: 5.0, joinDate: 'Dec 2025' },
      },
      investorData: {
        total_fund_return: 22.65,
        capital_deployed: 13943250,
        initial_capital: 11368000,
        monthly_performance: [
          { month: 'Dec 2025', return_pct: 3.18, cumulative: 3.18 },
          { month: 'Jan 2026', return_pct: 11.42, cumulative: 14.96 },
          { month: 'Feb 2026', return_pct: 7.69, cumulative: 22.65 },
        ],
        fees: { management_pct: 3.0, carry_pct: 50.0, total_fees_ytd: 412850, net_return_after_fees: 19.02 },
      },
      capitalFlow: [
        { date: 'Dec 2025', inflow: 11368000, outflow: 0, nav: 11729430 },
        { date: 'Jan 2026', inflow: 0, outflow: 0, nav: 13068540 },
        { date: 'Feb 2026', inflow: 0, outflow: 500000, nav: 13943250 },
      ],
    },
    fund_sheikh_c: {
      lpData: {
        sheikh_c: { name: 'Sheikh Mansour (LP)', investment: 25000000, share: 90.0, joinDate: 'Jan 2026' },
        robin: { name: 'Robin (GP)', investment: 1500000, share: 5.4, joinDate: 'Jan 2026' },
        felix: { name: 'Felix (GP)', investment: 1277000, share: 4.6, joinDate: 'Jan 2026' },
      },
      investorData: {
        total_fund_return: 12.84,
        capital_deployed: 31340830,
        initial_capital: 27777000,
        monthly_performance: [
          { month: 'Jan 2026', return_pct: 7.52, cumulative: 7.52 },
          { month: 'Feb 2026', return_pct: 5.32, cumulative: 12.84 },
        ],
        fees: { management_pct: 3.0, carry_pct: 50.0, total_fees_ytd: 524600, net_return_after_fees: 10.95 },
      },
      capitalFlow: [
        { date: 'Jan 2026', inflow: 27777000, outflow: 0, nav: 29866290 },
        { date: 'Feb 2026', inflow: 0, outflow: 0, nav: 31340830 },
      ],
    },
  }

  // Get data for the active fund, fallback to default
  const fundData = FUND_DATA[activeFundId || 'fund_default'] || FUND_DATA.fund_default
  const lpData = fundData.lpData
  const investorData = fundData.investorData
  const capitalFlow = fundData.capitalFlow

  const handleExportPDF = () => {
    addToast({ type: 'info', title: 'Generating PDF Report', message: 'Monthly investor report for Feb 2026...' })
    setTimeout(() => {
      addToast({ type: 'success', title: 'PDF Ready', message: 'Report downloaded: AI_Hedge_Fund_Feb_2026.pdf' })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-terminal-green text-xl font-bold">
          Investor Portal
          {activeFund && <span className="text-terminal-text-dim text-sm font-normal ml-3">— {activeFund.name}</span>}
        </h2>
        <div className="flex items-center gap-3">
          <button onClick={handleExportPDF} className="btn-outline text-xs">Export PDF Report</button>
          <span className="text-xs text-terminal-text-muted border border-terminal-border px-2 py-1 rounded">READ-ONLY</span>
        </div>
      </div>

      {/* LP Selector — hidden for investors */}
      {!isInvestor && (
        <div className="flex gap-2 overflow-x-auto">
          {[{ id: 'all', name: 'All Fund' }, ...Object.entries(lpData).map(([id, d]) => ({ id, name: d.name }))].map((lp) => (
            <button
              key={lp.id}
              onClick={() => setSelectedLP(lp.id)}
              className={clsx(
                'px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors',
                selectedLP === lp.id
                  ? 'bg-terminal-green text-terminal-bg'
                  : 'border border-terminal-border text-terminal-text-dim hover:border-terminal-green/50'
              )}
            >
              {lp.name}
            </button>
          ))}
        </div>
      )}

      {/* Notice */}
      <div className="card border border-terminal-amber/30">
        <p className="text-terminal-amber text-xs">
          LP investor view. All data is read-only. Fee model: 50% carry + 3% management (Cohen model). Eko Growth LLC - Wyoming.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="metric-label">Total Fund Return</p>
          <p className="metric-value text-terminal-green">+{investorData.total_fund_return.toFixed(2)}%</p>
          <p className="text-[10px] text-terminal-text-muted mt-1">Since inception</p>
        </div>
        <div className="card">
          <p className="metric-label">NAV</p>
          <p className="metric-value text-terminal-text">${investorData.capital_deployed.toLocaleString()}</p>
          <p className="text-[10px] text-terminal-text-muted mt-1">Initial: ${investorData.initial_capital.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="metric-label">Net Return (After Fees)</p>
          <p className="metric-value text-terminal-green">+{investorData.fees.net_return_after_fees.toFixed(2)}%</p>
          <p className="text-[10px] text-terminal-text-muted mt-1">50% carry + 3% mgmt</p>
        </div>
        {!isInvestor && (
          <div className="card">
            <p className="metric-label">Total Investors</p>
            <p className="metric-value text-terminal-amber">{Object.keys(lpData).length}</p>
            <p className="text-xs text-terminal-text-muted mt-1">Eko Growth LLC</p>
          </div>
        )}
      </div>

      {/* NAV Chart */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">NET ASSET VALUE (NAV) OVER TIME</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={capitalFlow} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="colorNAV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} />
              <YAxis tick={{ fill: '#555', fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-terminal-surface border border-terminal-border rounded px-2 py-1 text-xs">
                        <p className="text-terminal-text-muted">{label}</p>
                        <p className="text-terminal-green font-bold">NAV: ${payload[0].value?.toLocaleString()}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area type="monotone" dataKey="nav" stroke="#00ff88" strokeWidth={2} fillOpacity={1} fill="url(#colorNAV)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Capital Flow Table */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">CAPITAL FLOWS</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-terminal-text-muted border-b border-terminal-border">
                <th className="text-left py-2">Period</th>
                <th className="text-right py-2">Inflows</th>
                <th className="text-right py-2">Outflows</th>
                <th className="text-right py-2">NAV</th>
              </tr>
            </thead>
            <tbody>
              {capitalFlow.map((cf, i) => (
                <tr key={i} className="border-b border-terminal-border/50">
                  <td className="py-2 text-terminal-text">{cf.date}</td>
                  <td className="py-2 text-right text-terminal-green">{cf.inflow > 0 ? `+$${cf.inflow.toLocaleString()}` : '-'}</td>
                  <td className="py-2 text-right text-terminal-red">{cf.outflow > 0 ? `-$${cf.outflow.toLocaleString()}` : '-'}</td>
                  <td className="py-2 text-right text-terminal-text font-bold">${cf.nav.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LP Allocation — owners see all, investors see only their own */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">{isInvestor ? 'YOUR ALLOCATION' : 'LP ALLOCATION'}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-terminal-text-muted border-b border-terminal-border">
                <th className="text-left py-2">Investor</th>
                <th className="text-right py-2">Investment</th>
                <th className="text-right py-2">Share %</th>
                <th className="text-right py-2">Current Value</th>
                <th className="text-right py-2">P&L</th>
                <th className="text-left py-2 hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(lpData)
                .filter(([id]) => isInvestor ? id === 'lp_1' : true)
                .map(([id, lp]) => {
                  const currentValue = Math.round(investorData.capital_deployed * (lp.share / 100))
                  const pnl = currentValue - lp.investment
                  return (
                    <tr key={id} className="border-b border-terminal-border/50">
                      <td className="py-2 text-terminal-text">{lp.name}</td>
                      <td className="py-2 text-right text-terminal-text-dim">${lp.investment.toLocaleString()}</td>
                      <td className="py-2 text-right text-terminal-text">{lp.share.toFixed(1)}%</td>
                      <td className="py-2 text-right text-terminal-text font-bold">${currentValue.toLocaleString()}</td>
                      <td className={clsx('py-2 text-right font-bold', pnl >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                        {pnl >= 0 ? '+' : ''}${pnl.toLocaleString()}
                      </td>
                      <td className="py-2 text-terminal-text-muted text-xs hidden md:table-cell">{lp.joinDate}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-3">FEE STRUCTURE - Cohen Model</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">Management Fee</span>
            <span className="text-terminal-text">{investorData.fees.management_pct}% of AUM</span>
          </div>
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">Performance Fee (Carry)</span>
            <span className="text-terminal-text">{investorData.fees.carry_pct}% of profits</span>
          </div>
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">Total Fees YTD</span>
            <span className="text-terminal-amber">${investorData.fees.total_fees_ytd.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">MONTHLY PERFORMANCE</h3>
        <div className="h-40 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={investorData.monthly_performance} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 10 }} />
              <YAxis tick={{ fill: '#555', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const val = payload[0].value as number
                    return (
                      <div className="bg-terminal-surface border border-terminal-border rounded px-2 py-1 text-xs">
                        <p className="text-terminal-text-muted">{label}</p>
                        <p className={val >= 0 ? 'text-terminal-green' : 'text-terminal-red'}>
                          {val >= 0 ? '+' : ''}{val}%
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="return_pct" radius={[4, 4, 0, 0]}>
                {investorData.monthly_performance.map((m, i) => (
                  <Cell key={i} fill={m.return_pct >= 0 ? '#00ff88' : '#ff3355'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-terminal-text-muted border-b border-terminal-border">
                <th className="text-left py-2">Month</th>
                <th className="text-right py-2">Monthly Return</th>
                <th className="text-right py-2">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {investorData.monthly_performance.map((m, i) => (
                <tr key={i} className="border-b border-terminal-border/50">
                  <td className="py-2 text-terminal-text">{m.month}</td>
                  <td className={clsx('py-2 text-right font-bold', m.return_pct >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                    {m.return_pct >= 0 ? '+' : ''}{m.return_pct.toFixed(2)}%
                  </td>
                  <td className="py-2 text-right text-terminal-text">+{m.cumulative.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benchmark */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-3">BENCHMARK COMPARISON</h3>
        <div className="space-y-2 text-sm">
          {[
            { name: 'Top Wall St. Hedge Funds', value: '16-22% annual' },
            { name: 'S&P 500 Average', value: '~10% annual' },
            { name: 'Steven A. Cohen (historical)', value: '60% annual' },
          ].map((b) => (
            <div key={b.name} className="flex justify-between py-1 border-b border-terminal-border/50">
              <span className="text-terminal-text-dim">{b.name}</span>
              <span className="text-terminal-text">{b.value}</span>
            </div>
          ))}
          <div className="flex justify-between py-1 border-b border-terminal-green/30">
            <span className="text-terminal-green font-bold">AI Hedge Funding (annualized pace)</span>
            <span className="text-terminal-green font-bold">~208% annual</span>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-3">FUND MANAGEMENT</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text">Robin</span>
            <span className="text-terminal-text-dim">Owner & Founder</span>
          </div>
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text">Felix</span>
            <span className="text-terminal-text-dim">CTO / Owner</span>
          </div>
        </div>
      </div>
    </div>
  )
}
