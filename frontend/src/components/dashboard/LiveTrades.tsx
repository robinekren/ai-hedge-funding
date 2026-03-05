'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'

export default function LiveTrades() {
  const { addToast, addAuditEntry, auth } = useStore()
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'approve' | 'reject'; proposal: typeof pendingProposals[0] } | null>(null)

  const [positions] = useState([
    { id: 'pos-1', ticker: 'PLTR', quantity: 150, entry_price: 24.30, current_price: 27.85, unrealized_pnl: 532.50, strategy: 'WSB Steady Accumulator v3', change_pct: 14.6 },
    { id: 'pos-2', ticker: 'SOFI', quantity: 300, entry_price: 8.45, current_price: 9.72, unrealized_pnl: 381.00, strategy: 'Penny Chatter Reversal', change_pct: 15.0 },
    { id: 'pos-3', ticker: 'NVDA', quantity: 20, entry_price: 875.20, current_price: 921.50, unrealized_pnl: 926.00, strategy: 'r/stocks Momentum Alpha', change_pct: 5.3 },
    { id: 'pos-4', ticker: 'AMD', quantity: 80, entry_price: 162.40, current_price: 168.90, unrealized_pnl: 520.00, strategy: 'Spike Exit Sniper v2', change_pct: 4.0 },
    { id: 'pos-5', ticker: 'RIVN', quantity: 200, entry_price: 17.60, current_price: 16.85, unrealized_pnl: -150.00, strategy: 'Penny Chatter Reversal', change_pct: -4.3 },
    { id: 'pos-6', ticker: 'AAPL', quantity: 40, entry_price: 189.50, current_price: 193.20, unrealized_pnl: 148.00, strategy: 'r/stocks Momentum Alpha', change_pct: 2.0 },
    { id: 'pos-7', ticker: 'MARA', quantity: 250, entry_price: 22.10, current_price: 24.75, unrealized_pnl: 662.50, strategy: 'WSB Steady Accumulator v3', change_pct: 12.0 },
    { id: 'pos-8', ticker: 'TSLA', quantity: 15, entry_price: 242.80, current_price: 251.30, unrealized_pnl: 127.50, strategy: 'Theta Gang Contrarian', change_pct: 3.5 },
    { id: 'pos-9', ticker: 'COIN', quantity: 35, entry_price: 225.60, current_price: 218.40, unrealized_pnl: -252.00, strategy: 'Spike Exit Sniper v2', change_pct: -3.2 },
    { id: 'pos-10', ticker: 'RKLB', quantity: 400, entry_price: 6.82, current_price: 7.45, unrealized_pnl: 252.00, strategy: 'Penny Chatter Reversal', change_pct: 9.2 },
    { id: 'pos-11', ticker: 'META', quantity: 18, entry_price: 502.30, current_price: 515.80, unrealized_pnl: 243.00, strategy: 'r/stocks Momentum Alpha', change_pct: 2.7 },
    { id: 'pos-12', ticker: 'IONQ', quantity: 180, entry_price: 12.40, current_price: 13.15, unrealized_pnl: 135.00, strategy: 'WSB Steady Accumulator v3', change_pct: 6.0 },
  ])

  const [pendingProposals, setPendingProposals] = useState([
    { id: 'prop-1', ticker: 'SMCI', action: 'buy', quantity: 45, confidence: 0.92, price: 43.20, signal: 'Steady chatter 18 days - r/wallstreetbets' },
    { id: 'prop-2', ticker: 'GME', action: 'sell', quantity: 100, confidence: 0.96, price: 28.50, signal: 'Spike detected - 47x baseline mentions' },
    { id: 'prop-3', ticker: 'HOOD', action: 'buy', quantity: 200, confidence: 0.84, price: 18.90, signal: 'Steady chatter 12 days - r/stocks' },
  ])

  const [recentFills] = useState([
    { id: 'fill-1', action: 'buy', quantity: 150, ticker: 'PLTR', fill_price: 24.30, time: '14:32:08', pnl: null as number | null },
    { id: 'fill-2', action: 'sell', quantity: 120, ticker: 'AMC', fill_price: 5.82, time: '14:18:44', pnl: 247.20 },
    { id: 'fill-3', action: 'buy', quantity: 180, ticker: 'IONQ', fill_price: 12.40, time: '13:55:21', pnl: null },
    { id: 'fill-4', action: 'sell', quantity: 75, ticker: 'MSTR', fill_price: 1720.00, time: '13:22:07', pnl: 1635.00 },
    { id: 'fill-5', action: 'buy', quantity: 300, ticker: 'SOFI', fill_price: 8.45, time: '12:48:33', pnl: null },
    { id: 'fill-6', action: 'sell', quantity: 60, ticker: 'UPST', fill_price: 32.80, time: '12:15:19', pnl: -89.40 },
    { id: 'fill-7', action: 'buy', quantity: 35, ticker: 'COIN', fill_price: 225.60, time: '11:42:55', pnl: null },
    { id: 'fill-8', action: 'sell', quantity: 500, ticker: 'BBBY', fill_price: 0.42, time: '11:08:12', pnl: 385.00 },
    { id: 'fill-9', action: 'buy', quantity: 20, ticker: 'NVDA', fill_price: 875.20, time: '10:31:47', pnl: null },
    { id: 'fill-10', action: 'sell', quantity: 200, ticker: 'WISH', fill_price: 6.10, time: '10:02:33', pnl: 320.00 },
  ])

  const totalUnrealizedPnl = positions.reduce((sum, p) => sum + p.unrealized_pnl, 0)

  const handleApprove = (proposal: typeof pendingProposals[0]) => {
    setConfirmDialog({ type: 'approve', proposal })
  }

  const handleReject = (proposal: typeof pendingProposals[0]) => {
    setConfirmDialog({ type: 'reject', proposal })
  }

  const confirmAction = () => {
    if (!confirmDialog) return
    const { type, proposal } = confirmDialog
    setPendingProposals(prev => prev.filter(p => p.id !== proposal.id))
    if (type === 'approve') {
      addToast({ type: 'success', title: `${proposal.action.toUpperCase()} Approved`, message: `${proposal.quantity} $${proposal.ticker} @ $${proposal.price}` })
      addAuditEntry({ user: auth.user?.name || 'system', action: `Approved ${proposal.action.toUpperCase()} ${proposal.quantity} $${proposal.ticker} @ $${proposal.price}`, category: 'trade', severity: 'info' })
    } else {
      addToast({ type: 'warning', title: 'Trade Rejected', message: `$${proposal.ticker}` })
      addAuditEntry({ user: auth.user?.name || 'system', action: `Rejected ${proposal.action.toUpperCase()} $${proposal.ticker}`, category: 'trade', severity: 'warning' })
    }
    setConfirmDialog(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-terminal-green text-xl font-bold">Live Trades</h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-terminal-text-dim">{positions.length} positions</span>
          <span className={clsx('font-bold', totalUnrealizedPnl >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
            {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)} unrealized
          </span>
        </div>
      </div>

      {pendingProposals.length > 0 && (
        <div className="card border border-terminal-amber/30">
          <h3 className="text-terminal-amber text-sm font-bold mb-4">PENDING PROPOSALS - Awaiting Approval ({pendingProposals.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-terminal-text-muted border-b border-terminal-border">
                  <th className="text-left py-2">Ticker</th>
                  <th className="text-left py-2">Action</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Confidence</th>
                  <th className="text-left py-2 hidden md:table-cell">Signal</th>
                  <th className="text-center py-2">Approve</th>
                </tr>
              </thead>
              <tbody>
                {pendingProposals.map((p) => (
                  <tr key={p.id} className="border-b border-terminal-border/50">
                    <td className="py-2 text-terminal-green font-bold">${p.ticker}</td>
                    <td className={clsx('py-2 font-bold', p.action === 'buy' ? 'text-terminal-green' : 'text-terminal-red')}>{p.action.toUpperCase()}</td>
                    <td className="py-2 text-right text-terminal-text">{p.quantity}</td>
                    <td className="py-2 text-right text-terminal-text">${p.price.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <span className={clsx('font-bold', p.confidence >= 0.9 ? 'text-terminal-green' : 'text-terminal-amber')}>{(p.confidence * 100).toFixed(0)}%</span>
                    </td>
                    <td className="py-2 text-terminal-text-dim text-xs hidden md:table-cell">{p.signal}</td>
                    <td className="py-2 text-center">
                      <button onClick={() => handleApprove(p)} className="btn-primary text-xs mr-2">Approve</button>
                      <button onClick={() => handleReject(p)} className="btn-danger text-xs">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-terminal-green text-sm font-bold mb-4">OPEN POSITIONS ({positions.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-terminal-text-muted border-b border-terminal-border">
                <th className="text-left py-2">Ticker</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Entry</th>
                <th className="text-right py-2">Current</th>
                <th className="text-right py-2">Change</th>
                <th className="text-right py-2">P&L</th>
                <th className="text-left py-2 hidden md:table-cell">Strategy</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr key={pos.id} className="border-b border-terminal-border/50 hover:bg-terminal-green/5">
                  <td className="py-2 text-terminal-green font-bold">${pos.ticker}</td>
                  <td className="py-2 text-right text-terminal-text">{pos.quantity}</td>
                  <td className="py-2 text-right text-terminal-text-dim">${pos.entry_price.toFixed(2)}</td>
                  <td className="py-2 text-right text-terminal-text">${pos.current_price.toFixed(2)}</td>
                  <td className={clsx('py-2 text-right text-xs', pos.change_pct >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                    {pos.change_pct >= 0 ? '+' : ''}{pos.change_pct.toFixed(1)}%
                  </td>
                  <td className={clsx('py-2 text-right font-bold', pos.unrealized_pnl >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                    {pos.unrealized_pnl >= 0 ? '+' : ''}${pos.unrealized_pnl.toFixed(2)}
                  </td>
                  <td className="py-2 text-terminal-text-dim text-xs hidden md:table-cell">{pos.strategy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="text-terminal-text-dim text-sm font-bold mb-4">RECENT FILLS - Today</h3>
        <div className="space-y-2">
          {recentFills.map((fill) => (
            <div key={fill.id} className="flex justify-between items-center py-2 border-b border-terminal-border/50 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-terminal-text-muted text-xs font-mono">{fill.time}</span>
                <span className={clsx('font-bold', fill.action === 'buy' ? 'text-terminal-green' : 'text-terminal-red')}>
                  {fill.action.toUpperCase()} {fill.quantity} ${fill.ticker}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-terminal-text-dim">@ ${fill.fill_price.toFixed(2)}</span>
                {fill.pnl !== null && (
                  <span className={clsx('text-xs font-bold', fill.pnl >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                    {fill.pnl >= 0 ? '+' : ''}${fill.pnl.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDialog(null)} />
          <div className="relative bg-terminal-surface border border-terminal-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className={clsx('font-bold text-lg mb-2', confirmDialog.type === 'approve' ? 'text-terminal-green' : 'text-terminal-red')}>
              {confirmDialog.type === 'approve' ? 'Confirm Trade Approval' : 'Confirm Rejection'}
            </h3>
            <p className="text-terminal-text text-sm mb-1">
              {confirmDialog.proposal.action.toUpperCase()} {confirmDialog.proposal.quantity} <span className="text-terminal-green font-bold">${confirmDialog.proposal.ticker}</span> @ ${confirmDialog.proposal.price.toFixed(2)}
            </p>
            <p className="text-terminal-text-dim text-xs mb-4">
              {confirmDialog.type === 'approve' ? 'This will execute the trade.' : 'This will discard the proposal.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDialog(null)} className="btn-outline text-xs">Cancel</button>
              <button onClick={confirmAction} className={clsx('text-xs font-bold px-4 py-2 rounded', confirmDialog.type === 'approve' ? 'btn-primary' : 'btn-danger')}>
                {confirmDialog.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
