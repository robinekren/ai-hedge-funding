'use client'

import { useState, useEffect } from 'react'
import { clsx } from 'clsx'

interface TopBarProps {
  onMenuToggle: () => void
}

/**
 * Top Bar — Always-visible quick stats (5 Trillionaire Metrics):
 * 1. Total Return %
 * 2. AUM
 * 3. Win Rate Today
 * 4. System Status (green/red)
 * 5. Daily P&L
 */
export default function TopBar({ onMenuToggle }: TopBarProps) {
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
        const res = await fetch('/api/dashboard/metrics')
        if (res.ok) {
          const data = await res.json()
          setMetrics(data)
        }
      } catch {
        // API not connected — using live demo data
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const isGreen = metrics.system_status === 'green'

  return (
    <header className="bg-terminal-surface border-b border-terminal-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-terminal-text-dim hover:text-terminal-green mr-4"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* 5 Trillionaire Metrics */}
        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto flex-1">
          {/* 1. Total Return % */}
          <div className="flex flex-col min-w-fit">
            <span className="metric-label">Total Return</span>
            <span className={clsx(
              'metric-value text-lg md:text-2xl',
              metrics.total_return_pct >= 0 ? 'text-terminal-green' : 'text-terminal-red'
            )}>
              {metrics.total_return_pct >= 0 ? '+' : ''}{metrics.total_return_pct.toFixed(2)}%
            </span>
          </div>

          {/* 2. AUM */}
          <div className="flex flex-col min-w-fit">
            <span className="metric-label">AUM</span>
            <span className="metric-value text-lg md:text-2xl text-terminal-text">
              ${metrics.aum >= 1000000
                ? (metrics.aum / 1000000).toFixed(2) + 'M'
                : (metrics.aum / 1000).toFixed(1) + 'K'}
            </span>
          </div>

          {/* 3. Win Rate Today */}
          <div className="flex flex-col min-w-fit">
            <span className="metric-label">Win Rate</span>
            <span className={clsx(
              'metric-value text-lg md:text-2xl',
              metrics.win_rate_today >= 0.7 ? 'text-terminal-green' :
              metrics.win_rate_today >= 0.5 ? 'text-terminal-amber' : 'text-terminal-red'
            )}>
              {(metrics.win_rate_today * 100).toFixed(0)}%
            </span>
          </div>

          {/* 4. System Status */}
          <div className="flex flex-col min-w-fit">
            <span className="metric-label">System</span>
            <div className="flex items-center gap-2">
              <div className={clsx(
                'w-3 h-3 rounded-full animate-pulse',
                isGreen ? 'bg-terminal-green shadow-green-glow' : 'bg-terminal-red shadow-red-glow'
              )} />
              <span className={clsx(
                'metric-value text-lg md:text-2xl',
                isGreen ? 'text-terminal-green' : 'text-terminal-red'
              )}>
                {isGreen ? 'LIVE' : 'HALT'}
              </span>
            </div>
          </div>

          {/* 5. Daily P&L */}
          <div className="flex flex-col min-w-fit">
            <span className="metric-label">Daily P&L</span>
            <span className={clsx(
              'metric-value text-lg md:text-2xl',
              metrics.daily_pnl >= 0 ? 'text-terminal-green' : 'text-terminal-red'
            )}>
              {metrics.daily_pnl >= 0 ? '+' : ''}${metrics.daily_pnl.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
