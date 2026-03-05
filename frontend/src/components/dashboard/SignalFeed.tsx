'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

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
  const [signals] = useState<any[]>([])

  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-xl font-bold">◉ Signal Feed</h2>

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
            'r/wallstreetbets', 'r/stocks', 'r/investing', 'r/options',
            'r/stockmarket', 'r/pennystocks', 'r/smallstreetbets',
            'r/Daytrading', 'r/thetagang', 'r/SPACs',
          ].map(sub => (
            <span
              key={sub}
              className="px-2 py-1 bg-terminal-green/10 text-terminal-green text-xs rounded border border-terminal-green/20"
            >
              {sub}
            </span>
          ))}
        </div>
      </div>

      {/* Live Signal Feed */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">LIVE SIGNALS</h3>
        {signals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-terminal-green animate-pulse text-2xl mb-2">◉</div>
            <p className="text-terminal-text-muted text-sm">Monitoring social channels...</p>
            <p className="text-terminal-text-muted text-xs mt-1">
              Signals will appear here when detected
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {signals.map((signal: any) => (
              <div
                key={signal.id}
                className="flex items-center justify-between py-3 border-b border-terminal-border/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-terminal-green font-bold">${signal.ticker}</span>
                  <span className={clsx('text-xs font-bold', SIGNAL_COLORS[signal.signal_type])}>
                    {SIGNAL_LABELS[signal.signal_type]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-terminal-text-dim">
                  <span>{signal.mention_count} mentions</span>
                  <span>{signal.spike_ratio?.toFixed(1)}x baseline</span>
                  <span>Quality: {(signal.signal_quality * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
