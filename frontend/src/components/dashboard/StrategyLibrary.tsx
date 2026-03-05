'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

/**
 * Strategy Library Screen (Phase 2)
 * All strategies with performance metrics and filters.
 * Includes Backtest Runner — Meta Learner suggestions.
 */
export default function StrategyLibrary() {
  const [strategies] = useState<any[]>([])
  const [filter, setFilter] = useState('all')

  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-xl font-bold">⧫ Strategy Library</h2>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="metric-label">Total Strategies</p>
          <p className="metric-value text-terminal-text">{strategies.length}</p>
        </div>
        <div className="card">
          <p className="metric-label">Active</p>
          <p className="metric-value text-terminal-green">
            {strategies.filter(s => s.is_active).length}
          </p>
        </div>
        <div className="card">
          <p className="metric-label">Phase 1 Target</p>
          <p className="metric-value text-terminal-amber">100+</p>
        </div>
        <div className="card">
          <p className="metric-label">Phase 2 Target</p>
          <p className="metric-value text-terminal-amber">315+</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'active', 'top_sharpe', 'top_winrate'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1 rounded text-xs font-bold',
              filter === f
                ? 'bg-terminal-green text-terminal-bg'
                : 'border border-terminal-border text-terminal-text-dim'
            )}
          >
            {f.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Backtest Runner */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-3">BACKTEST RUNNER</h3>
        <p className="text-xs text-terminal-text-dim mb-3">
          Launch new backtest variations — Strategy Engine + Meta Learner suggestions.
        </p>
        <button className="btn-primary text-xs">
          Generate 5 New Variations
        </button>
      </div>

      {/* Strategy Table */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">STRATEGIES</h3>
        {strategies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-terminal-text-muted text-sm">
              Strategy Engine is generating variations...
            </p>
            <p className="text-terminal-text-muted text-xs mt-1">
              Target: 100+ strategies in Phase 1
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-terminal-text-muted border-b border-terminal-border">
                  <th className="text-left py-2">Name</th>
                  <th className="text-center py-2">Status</th>
                  <th className="text-right py-2">Win Rate</th>
                  <th className="text-right py-2">Return</th>
                  <th className="text-right py-2">Sharpe</th>
                  <th className="text-right py-2">Trades</th>
                </tr>
              </thead>
              <tbody>
                {strategies.map((s: any) => (
                  <tr key={s.id} className="border-b border-terminal-border/50">
                    <td className="py-2 text-terminal-text">{s.name}</td>
                    <td className="py-2 text-center">
                      <span className={clsx(
                        'text-xs px-2 py-0.5 rounded',
                        s.is_active ? 'bg-terminal-green/20 text-terminal-green' : 'bg-terminal-text-muted/20 text-terminal-text-muted'
                      )}>
                        {s.is_active ? 'LIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-2 text-right">{(s.win_rate * 100).toFixed(1)}%</td>
                    <td className={clsx(
                      'py-2 text-right',
                      s.total_return >= 0 ? 'text-terminal-green' : 'text-terminal-red'
                    )}>
                      {(s.total_return * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 text-right">{s.sharpe_ratio.toFixed(2)}</td>
                    <td className="py-2 text-right">{s.total_trades}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
