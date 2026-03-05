'use client'

import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'

interface TopBarProps {
  onMenuToggle: () => void
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { backendConnected, setBackendConnected, setLastDataUpdate, emergencyActive, activeFundId, funds } = useStore()
  const activeFund = funds.find(f => f.id === activeFundId)

  const [metrics, setMetrics] = useState({
    total_return_pct: 34.72,
    aum: 134720,
    win_rate_today: 0.875,
    system_status: 'green',
    daily_pnl: 1847.33,
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const fundParam = activeFundId ? `?fund_id=${encodeURIComponent(activeFundId)}` : ''
        const res = await fetch(`http://localhost:8000/api/dashboard/metrics${fundParam}`)
        if (res.ok) {
          const data = await res.json()
          if (data.aum > 0) {
            setMetrics(data)
            setBackendConnected(true)
            setLastDataUpdate(Date.now())
          }
        }
      } catch {
        setBackendConnected(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 10000)
    return () => clearInterval(interval)
  }, [setBackendConnected, setLastDataUpdate, activeFundId])

  const isGreen = !emergencyActive && metrics.system_status === 'green'

  return (
    <header className={clsx(
      'bg-terminal-surface border-b px-4 py-3',
      emergencyActive ? 'border-terminal-red' : 'border-terminal-border'
    )}>
      <div className="flex items-center justify-between">
        <button onClick={onMenuToggle} className="lg:hidden text-terminal-text-dim hover:text-terminal-green mr-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto flex-1">
          {/* Total Return */}
          <div className="flex flex-col min-w-fit">
            <span className="metric-label">Total Return</span>
            <span className={clsx('metric-value text-lg md:text-2xl', metrics.total_return_pct >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
              {metrics.total_return_pct >= 0 ? '+' : ''}{metrics.total_return_pct.toFixed(2)}%
            </span>
          </div>

          {/* AUM */}
          <div className="flex flex-col min-w-fit">
            <span className="metric-label">AUM</span>
            <span className="metric-value text-lg md:text-2xl text-terminal-text">
              ${metrics.aum >= 1000000 ? (metrics.aum / 1000000).toFixed(2) + 'M' : (metrics.aum / 1000).toFixed(1) + 'K'}
            </span>
          </div>

          {/* Win Rate */}
          <div className="flex flex-col min-w-fit">
            <span className="metric-label">Win Rate</span>
            <span className={clsx('metric-value text-lg md:text-2xl',
              metrics.win_rate_today >= 0.7 ? 'text-terminal-green' : metrics.win_rate_today >= 0.5 ? 'text-terminal-amber' : 'text-terminal-red'
            )}>
              {(metrics.win_rate_today * 100).toFixed(0)}%
            </span>
          </div>

          {/* System Status */}
          <div className="flex flex-col min-w-fit">
            <span className="metric-label">System</span>
            <div className="flex items-center gap-2">
              <div className={clsx('w-3 h-3 rounded-full animate-pulse', isGreen ? 'bg-terminal-green shadow-green-glow' : 'bg-terminal-red shadow-red-glow')} />
              <span className={clsx('metric-value text-lg md:text-2xl', isGreen ? 'text-terminal-green' : 'text-terminal-red')}>
                {emergencyActive ? 'HALT' : isGreen ? 'LIVE' : 'HALT'}
              </span>
            </div>
          </div>

          {/* Daily P&L */}
          <div className="flex flex-col min-w-fit">
            <span className="metric-label">Daily P&L</span>
            <span className={clsx('metric-value text-lg md:text-2xl', metrics.daily_pnl >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
              {metrics.daily_pnl >= 0 ? '+' : ''}${metrics.daily_pnl.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Fund name + Connection indicator */}
        <div className="hidden md:flex items-center gap-3 ml-4">
          {activeFund && (
            <span className="text-[10px] text-terminal-text-dim font-semibold">
              {activeFund.name}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <div className={clsx('w-1.5 h-1.5 rounded-full', backendConnected ? 'bg-terminal-green' : 'bg-terminal-amber')} />
            <span className="text-[10px] text-terminal-text-muted">
              {backendConnected ? 'API' : 'DEMO'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
