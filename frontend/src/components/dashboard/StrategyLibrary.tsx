'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useStore } from '@/store/useStore'

export default function StrategyLibrary() {
  const { addToast, addAuditEntry, auth, activeFundId, funds } = useStore()
  const activeFund = funds.find(f => f.id === activeFundId)

  const [strategies] = useState([
    { id: 's-1', name: 'WSB Steady Accumulator v3', is_active: true, win_rate: 0.94, total_return: 0.482, sharpe_ratio: 3.12, total_trades: 67, asset_class: 'US Equities', capital: 18400 },
    { id: 's-2', name: 'Penny Chatter Reversal', is_active: true, win_rate: 0.91, total_return: 0.417, sharpe_ratio: 2.89, total_trades: 43, asset_class: 'US Equities', capital: 15200 },
    { id: 's-3', name: 'r/stocks Momentum Alpha', is_active: true, win_rate: 0.88, total_return: 0.389, sharpe_ratio: 2.74, total_trades: 52, asset_class: 'US Equities', capital: 12800 },
    { id: 's-4', name: 'Spike Exit Sniper v2', is_active: true, win_rate: 0.93, total_return: 0.351, sharpe_ratio: 3.05, total_trades: 89, asset_class: 'US Equities', capital: 11500 },
    { id: 's-5', name: 'Theta Gang Contrarian', is_active: true, win_rate: 0.86, total_return: 0.294, sharpe_ratio: 2.51, total_trades: 31, asset_class: 'US Equities', capital: 9800 },
    { id: 's-6', name: 'SmallCap Whisper v2', is_active: true, win_rate: 0.89, total_return: 0.278, sharpe_ratio: 2.63, total_trades: 38, asset_class: 'US Equities', capital: 8200 },
    { id: 's-7', name: 'WSB Momentum Decay', is_active: true, win_rate: 0.84, total_return: 0.245, sharpe_ratio: 2.31, total_trades: 56, asset_class: 'US Equities', capital: 7400 },
    { id: 's-8', name: 'Reddit Volume Spike Short', is_active: true, win_rate: 0.91, total_return: 0.231, sharpe_ratio: 2.87, total_trades: 72, asset_class: 'US Equities', capital: 6900 },
    { id: 's-9', name: 'Sentiment Divergence Alpha', is_active: true, win_rate: 0.82, total_return: 0.198, sharpe_ratio: 2.18, total_trades: 41, asset_class: 'US Equities', capital: 5600 },
    { id: 's-10', name: 'FOMO Fade v3', is_active: true, win_rate: 0.87, total_return: 0.186, sharpe_ratio: 2.42, total_trades: 64, asset_class: 'US Equities', capital: 5100 },
    { id: 's-11', name: 'Pennystocks Accumulation', is_active: true, win_rate: 0.85, total_return: 0.172, sharpe_ratio: 2.28, total_trades: 29, asset_class: 'US Equities', capital: 4800 },
    { id: 's-12', name: 'Cross-Sub Correlation', is_active: true, win_rate: 0.80, total_return: 0.164, sharpe_ratio: 2.15, total_trades: 47, asset_class: 'US Equities', capital: 3200 },
    { id: 's-13', name: 'Daytrading Signal Echo', is_active: true, win_rate: 0.83, total_return: 0.152, sharpe_ratio: 2.09, total_trades: 83, asset_class: 'US Equities', capital: 2800 },
    { id: 's-14', name: 'SPACs Chatter Tracker', is_active: true, win_rate: 0.78, total_return: 0.138, sharpe_ratio: 1.94, total_trades: 22, asset_class: 'US Equities', capital: 1900 },
    { id: 's-15', name: 'Options Flow Sentiment', is_active: true, win_rate: 0.81, total_return: 0.127, sharpe_ratio: 2.04, total_trades: 35, asset_class: 'US Equities', capital: 1500 },
    { id: 's-16', name: 'r/investing Contrarian', is_active: true, win_rate: 0.79, total_return: 0.115, sharpe_ratio: 1.88, total_trades: 28, asset_class: 'US Equities', capital: 1200 },
    { id: 's-17', name: 'Meme Reversal v4', is_active: true, win_rate: 0.76, total_return: 0.098, sharpe_ratio: 1.72, total_trades: 91, asset_class: 'US Equities', capital: 800 },
    { id: 's-18', name: 'Weekend Gap Scanner', is_active: true, win_rate: 0.74, total_return: 0.085, sharpe_ratio: 1.65, total_trades: 15, asset_class: 'US Equities', capital: 600 },
    { id: 's-19', name: 'After-Hours Chatter', is_active: true, win_rate: 0.82, total_return: 0.076, sharpe_ratio: 1.91, total_trades: 19, asset_class: 'US Equities', capital: 500 },
    { id: 's-20', name: 'Multi-Sub Confluence v2', is_active: true, win_rate: 0.88, total_return: 0.068, sharpe_ratio: 2.34, total_trades: 12, asset_class: 'US Equities', capital: 400 },
    { id: 's-21', name: 'Steady Chatter Breakout', is_active: true, win_rate: 0.85, total_return: 0.054, sharpe_ratio: 2.11, total_trades: 8, asset_class: 'US Equities', capital: 350 },
    { id: 's-22', name: 'Volume-Weighted Sentiment', is_active: true, win_rate: 0.81, total_return: 0.042, sharpe_ratio: 1.97, total_trades: 6, asset_class: 'US Equities', capital: 300 },
    { id: 's-23', name: 'Reddit Momentum Decay v1', is_active: true, win_rate: 0.77, total_return: 0.031, sharpe_ratio: 1.68, total_trades: 4, asset_class: 'US Equities', capital: 200 },
    { id: 's-24', name: 'Crypto Reddit Accumulator', is_active: false, win_rate: 0.72, total_return: 0.089, sharpe_ratio: 1.45, total_trades: 34, asset_class: 'Crypto', capital: 0 },
    { id: 's-25', name: 'Instagram Trend v1 (beta)', is_active: false, win_rate: 0.68, total_return: 0.042, sharpe_ratio: 1.12, total_trades: 12, asset_class: 'US Equities', capital: 0 },
    { id: 's-26', name: 'TikTok Viral Fade (beta)', is_active: false, win_rate: 0.65, total_return: 0.028, sharpe_ratio: 0.98, total_trades: 8, asset_class: 'US Equities', capital: 0 },
    { id: 's-27', name: 'FX Macro Sentiment (beta)', is_active: false, win_rate: 0.71, total_return: 0.055, sharpe_ratio: 1.32, total_trades: 18, asset_class: 'FX/Commodities', capital: 0 },
  ])

  const [filter, setFilter] = useState('all')
  const [backtestRunning, setBacktestRunning] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<typeof strategies[0] | null>(null)

  const filtered = strategies.filter(s => {
    if (filter === 'active') return s.is_active
    if (filter === 'top_sharpe') return s.sharpe_ratio >= 2.5
    if (filter === 'top_winrate') return s.win_rate >= 0.85
    return true
  })

  const totalCapital = strategies.reduce((sum, s) => sum + s.capital, 0)

  // Scatter plot: Win Rate vs Sharpe Ratio
  const scatterData = strategies.map(s => ({
    name: s.name.split(' ').slice(0, 3).join(' '),
    winRate: s.win_rate * 100,
    sharpe: s.sharpe_ratio,
    return: s.total_return * 100,
    active: s.is_active,
  }))

  const handleBacktest = () => {
    setBacktestRunning(true)
    addToast({ type: 'info', title: 'Backtest Running', message: 'Generating 5 new strategy variations...' })
    addAuditEntry({ user: auth.user?.name || 'system', action: 'Backtest initiated: 5 new variations', category: 'trade', severity: 'info' })
    setTimeout(() => {
      setBacktestRunning(false)
      addToast({ type: 'success', title: 'Backtest Complete', message: '5 new strategies generated. 2 passed quality threshold.' })
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-xl font-bold">
        Strategy Library
        {activeFund && <span className="text-terminal-text-dim text-sm font-normal ml-3">— {activeFund.name}</span>}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="metric-label">Total Strategies</p>
          <p className="metric-value text-terminal-text">{strategies.length}</p>
        </div>
        <div className="card">
          <p className="metric-label">Active</p>
          <p className="metric-value text-terminal-green">{strategies.filter(s => s.is_active).length}</p>
        </div>
        <div className="card">
          <p className="metric-label">Capital Deployed</p>
          <p className="metric-value text-terminal-text">${totalCapital.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="metric-label">Phase 1 Target</p>
          <p className="metric-value text-terminal-amber">100+</p>
          <p className="text-[10px] text-terminal-text-muted mt-1">{strategies.length}/100 built</p>
        </div>
      </div>

      {/* Strategy Scatter Plot */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">STRATEGY MAP: Win Rate vs Sharpe Ratio</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="winRate" name="Win Rate" unit="%" tick={{ fill: '#555', fontSize: 10 }} label={{ value: 'Win Rate %', position: 'bottom', fill: '#555', fontSize: 10 }} />
              <YAxis dataKey="sharpe" name="Sharpe" tick={{ fill: '#555', fontSize: 10 }} label={{ value: 'Sharpe', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-terminal-surface border border-terminal-border rounded px-2 py-1 text-xs">
                        <p className="text-terminal-text font-bold">{data.name}</p>
                        <p className="text-terminal-green">Win: {data.winRate.toFixed(0)}% | Sharpe: {data.sharpe}</p>
                        <p className="text-terminal-text-muted">Return: +{data.return.toFixed(1)}%</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Scatter data={scatterData} fill="#00ff88">
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={entry.active ? '#00ff88' : '#555555'} opacity={entry.active ? 0.8 : 0.4} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-terminal-text-muted mt-2">
          Green = active | Gray = backtesting | Upper-right = best performers
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'active', 'top_sharpe', 'top_winrate'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx('px-3 py-1 rounded text-xs font-bold',
              filter === f ? 'bg-terminal-green text-terminal-bg' : 'border border-terminal-border text-terminal-text-dim hover:border-terminal-green/50'
            )}
          >
            {f.replace('_', ' ').toUpperCase()}
            {f !== 'all' && (
              <span className="ml-1 opacity-70">
                ({strategies.filter(s => {
                  if (f === 'active') return s.is_active
                  if (f === 'top_sharpe') return s.sharpe_ratio >= 2.5
                  if (f === 'top_winrate') return s.win_rate >= 0.85
                  return true
                }).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Backtest Runner */}
      <div className="card border border-terminal-green/20">
        <h3 className="text-terminal-green text-sm font-bold mb-3">BACKTEST RUNNER - Meta Learner Suggestions</h3>
        <p className="text-xs text-terminal-text-dim mb-3">Strategy Engine + Meta Learner generate new backtest variations autonomously.</p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBacktest}
            disabled={backtestRunning}
            className={clsx('btn-primary text-xs', backtestRunning && 'opacity-50 cursor-not-allowed')}
          >
            {backtestRunning ? 'Running Backtest...' : 'Generate 5 New Variations'}
          </button>
          {backtestRunning && <span className="text-terminal-green text-xs animate-pulse">Generating strategy variations...</span>}
        </div>
        <div className="mt-3 flex gap-4 text-[10px] text-terminal-text-muted">
          <span>Last run: 2h ago</span>
          <span>Variations tested today: 23</span>
          <span>Deployed today: 2</span>
        </div>
      </div>

      {/* Strategy Table */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">STRATEGIES ({filtered.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-terminal-text-muted border-b border-terminal-border">
                <th className="text-left py-2">#</th>
                <th className="text-left py-2">Name</th>
                <th className="text-center py-2">Status</th>
                <th className="text-right py-2">Win Rate</th>
                <th className="text-right py-2">Return</th>
                <th className="text-right py-2">Sharpe</th>
                <th className="text-right py-2">Trades</th>
                <th className="text-right py-2 hidden md:table-cell">Capital</th>
                <th className="text-left py-2 hidden lg:table-cell">Asset</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className="border-b border-terminal-border/50 hover:bg-terminal-green/5 cursor-pointer" onClick={() => setSelectedStrategy(s)}>
                  <td className="py-2 text-terminal-text-muted text-xs">{i + 1}</td>
                  <td className="py-2 text-terminal-text">{s.name}</td>
                  <td className="py-2 text-center">
                    <span className={clsx('text-xs px-2 py-0.5 rounded',
                      s.is_active ? 'bg-terminal-green/20 text-terminal-green' : 'bg-terminal-text-muted/20 text-terminal-text-muted'
                    )}>
                      {s.is_active ? 'LIVE' : 'BACKTEST'}
                    </span>
                  </td>
                  <td className={clsx('py-2 text-right font-bold',
                    s.win_rate >= 0.9 ? 'text-terminal-green' : s.win_rate >= 0.8 ? 'text-terminal-text' : 'text-terminal-amber'
                  )}>
                    {(s.win_rate * 100).toFixed(1)}%
                  </td>
                  <td className={clsx('py-2 text-right font-bold', s.total_return >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                    +{(s.total_return * 100).toFixed(1)}%
                  </td>
                  <td className={clsx('py-2 text-right', s.sharpe_ratio >= 2.5 ? 'text-terminal-green font-bold' : 'text-terminal-text')}>
                    {s.sharpe_ratio.toFixed(2)}
                  </td>
                  <td className="py-2 text-right text-terminal-text-dim">{s.total_trades}</td>
                  <td className="py-2 text-right text-terminal-text-dim hidden md:table-cell">
                    {s.capital > 0 ? `$${s.capital.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-2 text-terminal-text-muted text-xs hidden lg:table-cell">{s.asset_class}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategy Detail Modal */}
      {selectedStrategy && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedStrategy(null)} />
          <div className="relative bg-terminal-surface border border-terminal-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-terminal-green font-bold text-lg">{selectedStrategy.name}</h3>
              <button onClick={() => setSelectedStrategy(null)} className="text-terminal-text-muted hover:text-terminal-text text-lg">✕</button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={clsx('text-xs px-2 py-0.5 rounded',
                selectedStrategy.is_active ? 'bg-terminal-green/20 text-terminal-green' : 'bg-terminal-text-muted/20 text-terminal-text-muted'
              )}>
                {selectedStrategy.is_active ? 'LIVE' : 'BACKTEST'}
              </span>
              <span className="text-terminal-text-dim text-xs">{selectedStrategy.asset_class}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-terminal-bg rounded p-3">
                <p className="text-[10px] text-terminal-text-muted uppercase">Win Rate</p>
                <p className={clsx('text-lg font-bold', selectedStrategy.win_rate >= 0.9 ? 'text-terminal-green' : 'text-terminal-text')}>
                  {(selectedStrategy.win_rate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-terminal-bg rounded p-3">
                <p className="text-[10px] text-terminal-text-muted uppercase">Total Return</p>
                <p className="text-lg font-bold text-terminal-green">+{(selectedStrategy.total_return * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-terminal-bg rounded p-3">
                <p className="text-[10px] text-terminal-text-muted uppercase">Sharpe Ratio</p>
                <p className={clsx('text-lg font-bold', selectedStrategy.sharpe_ratio >= 2.5 ? 'text-terminal-green' : 'text-terminal-text')}>
                  {selectedStrategy.sharpe_ratio.toFixed(2)}
                </p>
              </div>
              <div className="bg-terminal-bg rounded p-3">
                <p className="text-[10px] text-terminal-text-muted uppercase">Total Trades</p>
                <p className="text-lg font-bold text-terminal-text">{selectedStrategy.total_trades}</p>
              </div>
            </div>

            <div className="text-xs space-y-1 text-terminal-text-dim">
              <div className="flex justify-between">
                <span>Capital Allocated</span>
                <span className="text-terminal-text">{selectedStrategy.capital > 0 ? `$${selectedStrategy.capital.toLocaleString()}` : 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span>Risk per Trade</span>
                <span className="text-terminal-text">1-2% of allocated capital</span>
              </div>
              <div className="flex justify-between">
                <span>Signal Source</span>
                <span className="text-terminal-text">Reddit inverted signal logic</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
