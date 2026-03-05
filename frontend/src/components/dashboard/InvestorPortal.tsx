'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

/**
 * Investor Portal — Completely separate from main dashboard.
 * Read-only access for LP investors.
 * Shows: total fund return, capital deployed, monthly performance.
 */
export default function InvestorPortal() {
  const [investorData] = useState({
    total_fund_return: 34.72,
    capital_deployed: 134720,
    initial_capital: 100000,
    monthly_performance: [
      { month: 'Oct 2025', return_pct: 8.42, cumulative: 8.42 },
      { month: 'Nov 2025', return_pct: 12.18, cumulative: 21.63 },
      { month: 'Dec 2025', return_pct: -2.34, cumulative: 18.78 },
      { month: 'Jan 2026', return_pct: 9.67, cumulative: 30.27 },
      { month: 'Feb 2026', return_pct: 4.45, cumulative: 34.72 },
    ],
    fees: {
      management_pct: 3.0,
      carry_pct: 50.0,
      total_fees_ytd: 4812,
      net_return_after_fees: 29.90,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-terminal-green text-xl font-bold">◇ Investor Portal</h2>
        <span className="text-xs text-terminal-text-muted border border-terminal-border px-2 py-1 rounded">
          READ-ONLY
        </span>
      </div>

      {/* Notice */}
      <div className="card border border-terminal-amber/30">
        <p className="text-terminal-amber text-xs">
          This is the LP investor view. All data is read-only.
          Fee model: 50% carry + 3% management (Cohen model).
          Eko Growth LLC — Wyoming.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="metric-label">Total Fund Return</p>
          <p className="metric-value text-terminal-green">
            +{investorData.total_fund_return.toFixed(2)}%
          </p>
          <p className="text-[10px] text-terminal-text-muted mt-1">Since inception</p>
        </div>
        <div className="card">
          <p className="metric-label">Capital Deployed</p>
          <p className="metric-value text-terminal-text">
            ${investorData.capital_deployed.toLocaleString()}
          </p>
          <p className="text-[10px] text-terminal-text-muted mt-1">
            Initial: ${investorData.initial_capital.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="metric-label">Net Return (After Fees)</p>
          <p className="metric-value text-terminal-green">
            +{investorData.fees.net_return_after_fees.toFixed(2)}%
          </p>
          <p className="text-[10px] text-terminal-text-muted mt-1">50% carry + 3% mgmt</p>
        </div>
        <div className="card">
          <p className="metric-label">Fund Structure</p>
          <p className="metric-value text-terminal-amber text-base">Eko Growth LLC</p>
          <p className="text-xs text-terminal-text-muted mt-1">Wyoming</p>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-3">FEE STRUCTURE — Cohen Model</h3>
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
                  <td className={clsx(
                    'py-2 text-right font-bold',
                    m.return_pct >= 0 ? 'text-terminal-green' : 'text-terminal-red'
                  )}>
                    {m.return_pct >= 0 ? '+' : ''}{m.return_pct.toFixed(2)}%
                  </td>
                  <td className="py-2 text-right text-terminal-text">
                    +{m.cumulative.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mini equity chart */}
        <div className="mt-4 h-16 flex items-end gap-1">
          {investorData.monthly_performance.map((m, i) => {
            const maxCum = Math.max(...investorData.monthly_performance.map(x => x.cumulative))
            const height = maxCum > 0 ? (m.cumulative / maxCum) * 100 : 0
            return (
              <div
                key={i}
                className={clsx(
                  'flex-1 rounded-t',
                  m.return_pct >= 0 ? 'bg-terminal-green/50' : 'bg-terminal-red/50'
                )}
                style={{ height: `${Math.max(height, 5)}%` }}
                title={`${m.month}: ${m.return_pct >= 0 ? '+' : ''}${m.return_pct}%`}
              />
            )
          })}
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-3">BENCHMARK COMPARISON</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">Top Wall St. Hedge Funds</span>
            <span className="text-terminal-text">16-22% annual</span>
          </div>
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">S&P 500 Average</span>
            <span className="text-terminal-text">~10% annual</span>
          </div>
          <div className="flex justify-between py-1 border-b border-terminal-border/50">
            <span className="text-terminal-text-dim">Steven A. Cohen (historical)</span>
            <span className="text-terminal-text">60% annual</span>
          </div>
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
