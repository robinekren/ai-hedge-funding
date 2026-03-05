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
    total_fund_return: 0,
    capital_deployed: 0,
    monthly_performance: [] as number[],
  })

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]

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
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="metric-label">Total Fund Return</p>
          <p className={clsx(
            'metric-value',
            investorData.total_fund_return >= 0 ? 'text-terminal-green' : 'text-terminal-red'
          )}>
            {investorData.total_fund_return >= 0 ? '+' : ''}
            {investorData.total_fund_return.toFixed(2)}%
          </p>
        </div>
        <div className="card">
          <p className="metric-label">Capital Deployed</p>
          <p className="metric-value text-terminal-text">
            ${investorData.capital_deployed.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="metric-label">Fund Structure</p>
          <p className="metric-value text-terminal-amber text-base">Eko Growth LLC</p>
          <p className="text-xs text-terminal-text-muted mt-1">Wyoming</p>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">MONTHLY PERFORMANCE</h3>
        {investorData.monthly_performance.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-terminal-text-muted text-sm">
              Performance data will populate after first month of trading.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-terminal-text-muted border-b border-terminal-border">
                  <th className="text-left py-2">Month</th>
                  <th className="text-right py-2">Return</th>
                </tr>
              </thead>
              <tbody>
                {investorData.monthly_performance.map((ret, i) => (
                  <tr key={i} className="border-b border-terminal-border/50">
                    <td className="py-2 text-terminal-text">{months[i % 12]}</td>
                    <td className={clsx(
                      'py-2 text-right font-bold',
                      ret >= 0 ? 'text-terminal-green' : 'text-terminal-red'
                    )}>
                      {ret >= 0 ? '+' : ''}{ret.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
            <span className="text-terminal-green font-bold">AI Hedge Funding Target</span>
            <span className="text-terminal-green font-bold">180% annual</span>
          </div>
        </div>
      </div>
    </div>
  )
}
