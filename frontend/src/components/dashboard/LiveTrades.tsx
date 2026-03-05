'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

/**
 * Live Trades Screen
 * All open positions with real-time P&L.
 */
export default function LiveTrades() {
  const [positions] = useState<any[]>([])
  const [pendingProposals] = useState<any[]>([])
  const [recentFills] = useState<any[]>([])

  return (
    <div className="space-y-6">
      <h2 className="text-terminal-green text-xl font-bold">⟐ Live Trades</h2>

      {/* Pending Proposals (Phase 1: Supervised) */}
      <div className="card">
        <h3 className="text-terminal-amber text-sm font-bold mb-4">
          PENDING PROPOSALS — Awaiting Approval
        </h3>
        {pendingProposals.length === 0 ? (
          <p className="text-terminal-text-muted text-sm">No pending proposals</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-terminal-text-muted border-b border-terminal-border">
                  <th className="text-left py-2">Ticker</th>
                  <th className="text-left py-2">Action</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Confidence</th>
                  <th className="text-center py-2">Approve</th>
                </tr>
              </thead>
              <tbody>
                {pendingProposals.map((p: any) => (
                  <tr key={p.id} className="border-b border-terminal-border/50">
                    <td className="py-2 text-terminal-green font-bold">${p.ticker}</td>
                    <td className={clsx(
                      'py-2',
                      p.action === 'buy' ? 'text-terminal-green' : 'text-terminal-red'
                    )}>
                      {p.action.toUpperCase()}
                    </td>
                    <td className="py-2 text-right">{p.quantity}</td>
                    <td className="py-2 text-right">{(p.confidence * 100).toFixed(0)}%</td>
                    <td className="py-2 text-center">
                      <button className="btn-primary text-xs mr-2">Approve</button>
                      <button className="btn-danger text-xs">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Open Positions */}
      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">OPEN POSITIONS</h3>
        {positions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-terminal-text-muted text-sm">No open positions</p>
            <p className="text-terminal-text-muted text-xs mt-1">
              System is monitoring signals...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-terminal-text-muted border-b border-terminal-border">
                  <th className="text-left py-2">Ticker</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Entry</th>
                  <th className="text-right py-2">Current</th>
                  <th className="text-right py-2">P&L</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos: any) => (
                  <tr key={pos.id} className="border-b border-terminal-border/50">
                    <td className="py-2 text-terminal-green font-bold">${pos.ticker}</td>
                    <td className="py-2 text-right">{pos.quantity}</td>
                    <td className="py-2 text-right">${pos.entry_price.toFixed(2)}</td>
                    <td className="py-2 text-right">${pos.current_price.toFixed(2)}</td>
                    <td className={clsx(
                      'py-2 text-right font-bold',
                      pos.unrealized_pnl >= 0 ? 'text-terminal-green' : 'text-terminal-red'
                    )}>
                      {pos.unrealized_pnl >= 0 ? '+' : ''}${pos.unrealized_pnl.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Fills */}
      <div className="card">
        <h3 className="text-terminal-text-dim text-sm font-bold mb-4">RECENT FILLS</h3>
        {recentFills.length === 0 ? (
          <p className="text-terminal-text-muted text-sm">No recent fills</p>
        ) : (
          <div className="space-y-2">
            {recentFills.map((fill: any) => (
              <div key={fill.id} className="flex justify-between items-center py-2 border-b border-terminal-border/50 text-sm">
                <span className={clsx(
                  fill.action === 'buy' ? 'text-terminal-green' : 'text-terminal-red'
                )}>
                  {fill.action.toUpperCase()} {fill.quantity} ${fill.ticker}
                </span>
                <span className="text-terminal-text-dim">@ ${fill.fill_price?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
