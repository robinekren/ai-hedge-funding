'use client'

import { useState, useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'

const SIGNAL_COLORS: Record<string, string> = {
  steady_chatter: 'text-terminal-green',
  spike: 'text-terminal-red',
  mass_excitement: 'text-terminal-red',
  cooling: 'text-terminal-amber',
}

const SIGNAL_LABELS: Record<string, string> = {
  steady_chatter: 'STEADY → BUY',
  spike: 'SPIKE → SELL',
  mass_excitement: 'VIRAL → AVOID',
  cooling: 'COOLING → WAIT',
}

/**
 * Signal Feed Screen
 * Live Reddit signals — what the system is watching right now.
 */
export default function SignalFeed() {
  const { addToast, addAuditEntry, setSelectedTicker } = useStore()
  const alertedRef = useRef<Set<string>>(new Set())

  const [signals] = useState([
    { id: 'sig-1', ticker: 'SMCI', signal_type: 'steady_chatter', mention_count: 342, spike_ratio: 1.3, signal_quality: 0.92, source: 'r/wallstreetbets', time: '2m ago' },
    { id: 'sig-2', ticker: 'GME', signal_type: 'spike', mention_count: 14720, spike_ratio: 47.2, signal_quality: 0.96, source: 'r/wallstreetbets', time: '4m ago' },
    { id: 'sig-3', ticker: 'HOOD', signal_type: 'steady_chatter', mention_count: 189, spike_ratio: 1.1, signal_quality: 0.84, source: 'r/stocks', time: '7m ago' },
    { id: 'sig-4', ticker: 'AMC', signal_type: 'mass_excitement', mention_count: 28400, spike_ratio: 112.5, signal_quality: 0.98, source: 'r/wallstreetbets', time: '8m ago' },
    { id: 'sig-5', ticker: 'PLTR', signal_type: 'steady_chatter', mention_count: 567, spike_ratio: 1.4, signal_quality: 0.89, source: 'r/stocks', time: '12m ago' },
    { id: 'sig-6', ticker: 'RIVN', signal_type: 'cooling', mention_count: 85, spike_ratio: 0.6, signal_quality: 0.71, source: 'r/investing', time: '15m ago' },
    { id: 'sig-7', ticker: 'NVDA', signal_type: 'steady_chatter', mention_count: 890, spike_ratio: 1.2, signal_quality: 0.87, source: 'r/stocks', time: '18m ago' },
    { id: 'sig-8', ticker: 'BBBY', signal_type: 'spike', mention_count: 9340, spike_ratio: 38.7, signal_quality: 0.94, source: 'r/wallstreetbets', time: '21m ago' },
    { id: 'sig-9', ticker: 'MARA', signal_type: 'steady_chatter', mention_count: 234, spike_ratio: 1.5, signal_quality: 0.86, source: 'r/pennystocks', time: '25m ago' },
    { id: 'sig-10', ticker: 'TSLA', signal_type: 'mass_excitement', mention_count: 42100, spike_ratio: 89.3, signal_quality: 0.97, source: 'r/wallstreetbets', time: '28m ago' },
    { id: 'sig-11', ticker: 'IONQ', signal_type: 'steady_chatter', mention_count: 156, spike_ratio: 1.2, signal_quality: 0.81, source: 'r/pennystocks', time: '33m ago' },
    { id: 'sig-12', ticker: 'RKLB', signal_type: 'steady_chatter', mention_count: 278, spike_ratio: 1.6, signal_quality: 0.88, source: 'r/smallstreetbets', time: '37m ago' },
    { id: 'sig-13', ticker: 'WISH', signal_type: 'cooling', mention_count: 42, spike_ratio: 0.3, signal_quality: 0.65, source: 'r/wallstreetbets', time: '41m ago' },
    { id: 'sig-14', ticker: 'COIN', signal_type: 'steady_chatter', mention_count: 445, spike_ratio: 1.3, signal_quality: 0.83, source: 'r/stocks', time: '45m ago' },
    { id: 'sig-15', ticker: 'UPST', signal_type: 'spike', mention_count: 5670, spike_ratio: 22.1, signal_quality: 0.91, source: 'r/wallstreetbets', time: '52m ago' },
  ])

  const signalCounts = {
    steady: signals.filter(s => s.signal_type === 'steady_chatter').length,
    spike: signals.filter(s => s.signal_type === 'spike').length,
    viral: signals.filter(s => s.signal_type === 'mass_excitement').length,
    cooling: signals.filter(s => s.signal_type === 'cooling').length,
  }

  // Alert on spike/viral signals
  useEffect(() => {
    signals.forEach((s) => {
      if (alertedRef.current.has(s.id)) return
      if (s.signal_type === 'spike') {
        alertedRef.current.add(s.id)
        addToast({ type: 'warning', title: `Spike: $${s.ticker}`, message: `${s.mention_count.toLocaleString()} mentions (${s.spike_ratio}x) — SELL signal` })
        addAuditEntry({ user: 'system', action: `Spike detected: $${s.ticker} — ${s.mention_count.toLocaleString()} mentions, ${s.spike_ratio}x baseline`, category: 'trade', severity: 'warning' })
      } else if (s.signal_type === 'mass_excitement') {
        alertedRef.current.add(s.id)
        addToast({ type: 'error', title: `Viral Alert: $${s.ticker}`, message: `${s.mention_count.toLocaleString()} mentions (${s.spike_ratio}x) — AVOID`, autoDismiss: false })
        addAuditEntry({ user: 'system', action: `Viral alert: $${s.ticker} — ${s.mention_count.toLocaleString()} mentions, ${s.spike_ratio}x baseline`, category: 'trade', severity: 'critical' })
      }
    })
  }, [signals, addToast, addAuditEntry])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-terminal-green text-xl font-bold">◉ Signal Feed</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
          <span className="text-terminal-green text-xs">LIVE — Scanning</span>
        </div>
      </div>

      {/* Signal Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card border border-terminal-green/30">
          <p className="metric-label">Buy Signals</p>
          <p className="metric-value text-terminal-green">{signalCounts.steady}</p>
          <p className="text-[10px] text-terminal-text-muted">Steady chatter</p>
        </div>
        <div className="card border border-terminal-red/30">
          <p className="metric-label">Sell Signals</p>
          <p className="metric-value text-terminal-red">{signalCounts.spike}</p>
          <p className="text-[10px] text-terminal-text-muted">Spike detected</p>
        </div>
        <div className="card border border-terminal-red/20">
          <p className="metric-label">Avoid</p>
          <p className="metric-value text-terminal-red">{signalCounts.viral}</p>
          <p className="text-[10px] text-terminal-text-muted">Mass excitement</p>
        </div>
        <div className="card border border-terminal-amber/30">
          <p className="metric-label">Waiting</p>
          <p className="metric-value text-terminal-amber">{signalCounts.cooling}</p>
          <p className="text-[10px] text-terminal-text-muted">Post-spike cooling</p>
        </div>
      </div>

      {/* Signal Explanation */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-3">INVERTED SIGNAL LOGIC</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terminal-green" />
            <span className="text-terminal-text-dim">Steady chatter = Accumulation → <span className="text-terminal-green font-bold">BUY</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terminal-red" />
            <span className="text-terminal-text-dim">Spike in mentions = Peak → <span className="text-terminal-red font-bold">SELL</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terminal-red" />
            <span className="text-terminal-text-dim">Mass excitement = Late majority → <span className="text-terminal-red font-bold">AVOID</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terminal-amber" />
            <span className="text-terminal-text-dim">Cooling after spike → <span className="text-terminal-amber font-bold">WAIT</span></span>
          </div>
        </div>
      </div>

      {/* Monitored Subreddits */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-3">MONITORED SOURCES</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'r/wallstreetbets', signals: 847 },
            { name: 'r/stocks', signals: 423 },
            { name: 'r/investing', signals: 312 },
            { name: 'r/options', signals: 189 },
            { name: 'r/stockmarket', signals: 156 },
            { name: 'r/pennystocks', signals: 278 },
            { name: 'r/smallstreetbets', signals: 134 },
            { name: 'r/Daytrading', signals: 98 },
            { name: 'r/thetagang', signals: 67 },
            { name: 'r/SPACs', signals: 45 },
          ].map(sub => (
            <span
              key={sub.name}
              className="px-2 py-1 bg-terminal-green/10 text-terminal-green text-xs rounded border border-terminal-green/20"
            >
              {sub.name} <span className="text-terminal-text-muted ml-1">({sub.signals})</span>
            </span>
          ))}
        </div>
        <p className="text-[10px] text-terminal-text-muted mt-2">2,549 total signals processed today</p>
      </div>

      {/* Live Signal Feed */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">LIVE SIGNALS</h3>
        <div className="space-y-3">
          {signals.map((signal) => (
            <div
              key={signal.id}
              onClick={() => setSelectedTicker(signal.ticker)}
              className={clsx(
                'flex items-center justify-between py-3 border-b border-terminal-border/50 cursor-pointer hover:bg-terminal-green/5',
                signal.signal_type === 'spike' && 'bg-terminal-red/5 -mx-3 px-3 rounded hover:bg-terminal-red/10',
                signal.signal_type === 'mass_excitement' && 'bg-terminal-red/5 -mx-3 px-3 rounded hover:bg-terminal-red/10',
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-terminal-text-muted text-[10px] w-14">{signal.time}</span>
                <span className="text-terminal-green font-bold w-12">${signal.ticker}</span>
                <span className={clsx('text-xs font-bold', SIGNAL_COLORS[signal.signal_type])}>
                  {SIGNAL_LABELS[signal.signal_type]}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-terminal-text-dim">
                <span className="hidden md:inline">{signal.source}</span>
                <span>{signal.mention_count.toLocaleString()} mentions</span>
                <span className={clsx(
                  signal.spike_ratio > 10 ? 'text-terminal-red font-bold' : ''
                )}>
                  {signal.spike_ratio.toFixed(1)}x
                </span>
                <span className={clsx(
                  signal.signal_quality >= 0.9 ? 'text-terminal-green' : 'text-terminal-text-dim'
                )}>
                  Q:{(signal.signal_quality * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
