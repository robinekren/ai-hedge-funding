'use client'

import { clsx } from 'clsx'

interface TickerInfo {
  ticker: string
  current_price: number
  change_pct: number
  position_qty: number | null
  entry_price: number | null
  unrealized_pnl: number | null
  signal_type: string | null
  mention_count: number | null
  strategy: string | null
  sector: string
  avg_volume: string
}

const TICKER_DATA: Record<string, TickerInfo> = {
  PLTR: { ticker: 'PLTR', current_price: 27.85, change_pct: 14.6, position_qty: 150, entry_price: 24.30, unrealized_pnl: 532.50, signal_type: 'steady_chatter', mention_count: 567, strategy: 'WSB Steady Accumulator v3', sector: 'Technology', avg_volume: '32M' },
  SOFI: { ticker: 'SOFI', current_price: 9.72, change_pct: 15.0, position_qty: 300, entry_price: 8.45, unrealized_pnl: 381.00, signal_type: 'steady_chatter', mention_count: 189, strategy: 'Penny Chatter Reversal', sector: 'Fintech', avg_volume: '28M' },
  NVDA: { ticker: 'NVDA', current_price: 921.50, change_pct: 5.3, position_qty: 20, entry_price: 875.20, unrealized_pnl: 926.00, signal_type: 'steady_chatter', mention_count: 890, strategy: 'r/stocks Momentum Alpha', sector: 'Technology', avg_volume: '45M' },
  AMD: { ticker: 'AMD', current_price: 168.90, change_pct: 4.0, position_qty: 80, entry_price: 162.40, unrealized_pnl: 520.00, signal_type: null, mention_count: null, strategy: 'Spike Exit Sniper v2', sector: 'Technology', avg_volume: '52M' },
  RIVN: { ticker: 'RIVN', current_price: 16.85, change_pct: -4.3, position_qty: 200, entry_price: 17.60, unrealized_pnl: -150.00, signal_type: 'cooling', mention_count: 85, strategy: 'Penny Chatter Reversal', sector: 'EV/Green Energy', avg_volume: '18M' },
  AAPL: { ticker: 'AAPL', current_price: 193.20, change_pct: 2.0, position_qty: 40, entry_price: 189.50, unrealized_pnl: 148.00, signal_type: null, mention_count: null, strategy: 'r/stocks Momentum Alpha', sector: 'Technology', avg_volume: '65M' },
  MARA: { ticker: 'MARA', current_price: 24.75, change_pct: 12.0, position_qty: 250, entry_price: 22.10, unrealized_pnl: 662.50, signal_type: 'steady_chatter', mention_count: 234, strategy: 'WSB Steady Accumulator v3', sector: 'Crypto/Blockchain', avg_volume: '15M' },
  TSLA: { ticker: 'TSLA', current_price: 251.30, change_pct: 3.5, position_qty: 15, entry_price: 242.80, unrealized_pnl: 127.50, signal_type: 'mass_excitement', mention_count: 42100, strategy: 'Theta Gang Contrarian', sector: 'EV/Green Energy', avg_volume: '78M' },
  COIN: { ticker: 'COIN', current_price: 218.40, change_pct: -3.2, position_qty: 35, entry_price: 225.60, unrealized_pnl: -252.00, signal_type: 'steady_chatter', mention_count: 445, strategy: 'Spike Exit Sniper v2', sector: 'Crypto/Blockchain', avg_volume: '8M' },
  RKLB: { ticker: 'RKLB', current_price: 7.45, change_pct: 9.2, position_qty: 400, entry_price: 6.82, unrealized_pnl: 252.00, signal_type: 'steady_chatter', mention_count: 278, strategy: 'Penny Chatter Reversal', sector: 'Space/Defense', avg_volume: '3M' },
  META: { ticker: 'META', current_price: 515.80, change_pct: 2.7, position_qty: 18, entry_price: 502.30, unrealized_pnl: 243.00, signal_type: null, mention_count: null, strategy: 'r/stocks Momentum Alpha', sector: 'Technology', avg_volume: '22M' },
  IONQ: { ticker: 'IONQ', current_price: 13.15, change_pct: 6.0, position_qty: 180, entry_price: 12.40, unrealized_pnl: 135.00, signal_type: 'steady_chatter', mention_count: 156, strategy: 'WSB Steady Accumulator v3', sector: 'Technology', avg_volume: '4M' },
  SMCI: { ticker: 'SMCI', current_price: 43.20, change_pct: 2.1, position_qty: null, entry_price: null, unrealized_pnl: null, signal_type: 'steady_chatter', mention_count: 342, strategy: null, sector: 'Technology', avg_volume: '12M' },
  GME: { ticker: 'GME', current_price: 28.50, change_pct: -1.8, position_qty: null, entry_price: null, unrealized_pnl: null, signal_type: 'spike', mention_count: 14720, strategy: null, sector: 'Retail', avg_volume: '6M' },
  HOOD: { ticker: 'HOOD', current_price: 18.90, change_pct: 3.4, position_qty: null, entry_price: null, unrealized_pnl: null, signal_type: 'steady_chatter', mention_count: 189, strategy: null, sector: 'Fintech', avg_volume: '9M' },
  AMC: { ticker: 'AMC', current_price: 5.82, change_pct: -2.5, position_qty: null, entry_price: null, unrealized_pnl: null, signal_type: 'mass_excitement', mention_count: 28400, strategy: null, sector: 'Entertainment', avg_volume: '25M' },
  BBBY: { ticker: 'BBBY', current_price: 0.42, change_pct: -8.7, position_qty: null, entry_price: null, unrealized_pnl: null, signal_type: 'spike', mention_count: 9340, strategy: null, sector: 'Retail', avg_volume: '2M' },
  UPST: { ticker: 'UPST', current_price: 32.80, change_pct: 1.2, position_qty: null, entry_price: null, unrealized_pnl: null, signal_type: 'spike', mention_count: 5670, strategy: null, sector: 'Fintech', avg_volume: '5M' },
  WISH: { ticker: 'WISH', current_price: 6.10, change_pct: -0.5, position_qty: null, entry_price: null, unrealized_pnl: null, signal_type: 'cooling', mention_count: 42, strategy: null, sector: 'E-Commerce', avg_volume: '1M' },
}

const SIGNAL_LABELS: Record<string, { label: string; color: string }> = {
  steady_chatter: { label: 'STEADY → BUY', color: 'text-terminal-green' },
  spike: { label: 'SPIKE → SELL', color: 'text-terminal-red' },
  mass_excitement: { label: 'VIRAL → AVOID', color: 'text-terminal-red' },
  cooling: { label: 'COOLING → WAIT', color: 'text-terminal-amber' },
}

interface TickerModalProps {
  ticker: string | null
  onClose: () => void
}

export default function TickerModal({ ticker, onClose }: TickerModalProps) {
  if (!ticker) return null
  const data = TICKER_DATA[ticker]
  if (!data) return null

  const signal = data.signal_type ? SIGNAL_LABELS[data.signal_type] : null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-terminal-surface border border-terminal-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-terminal-green font-bold text-2xl">${data.ticker}</span>
            <span className="text-terminal-text-dim text-xs">{data.sector}</span>
          </div>
          <button onClick={onClose} className="text-terminal-text-muted hover:text-terminal-text text-lg">✕</button>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-terminal-text text-xl font-bold">${data.current_price.toLocaleString()}</span>
          <span className={clsx('text-sm font-bold', data.change_pct >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
            {data.change_pct >= 0 ? '+' : ''}{data.change_pct.toFixed(1)}%
          </span>
        </div>

        {/* Signal */}
        {signal && (
          <div className="bg-terminal-bg rounded p-3 mb-4">
            <p className="text-[10px] text-terminal-text-muted uppercase mb-1">Reddit Signal</p>
            <p className={clsx('text-sm font-bold', signal.color)}>{signal.label}</p>
            {data.mention_count && (
              <p className="text-terminal-text-dim text-xs mt-1">{data.mention_count.toLocaleString()} mentions</p>
            )}
          </div>
        )}

        {/* Position */}
        {data.position_qty !== null ? (
          <div className="border border-terminal-green/20 rounded p-3 mb-4">
            <p className="text-[10px] text-terminal-text-muted uppercase mb-2">Open Position</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-terminal-text-muted text-xs">Quantity</span>
                <p className="text-terminal-text font-bold">{data.position_qty}</p>
              </div>
              <div>
                <span className="text-terminal-text-muted text-xs">Entry Price</span>
                <p className="text-terminal-text font-bold">${data.entry_price?.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-terminal-text-muted text-xs">Market Value</span>
                <p className="text-terminal-text font-bold">${(data.position_qty * data.current_price).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-terminal-text-muted text-xs">Unrealized P&L</span>
                <p className={clsx('font-bold', (data.unrealized_pnl ?? 0) >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                  {(data.unrealized_pnl ?? 0) >= 0 ? '+' : ''}${data.unrealized_pnl?.toFixed(2)}
                </p>
              </div>
            </div>
            {data.strategy && (
              <p className="text-terminal-text-dim text-[10px] mt-2">Strategy: {data.strategy}</p>
            )}
          </div>
        ) : (
          <div className="border border-terminal-border rounded p-3 mb-4">
            <p className="text-terminal-text-muted text-xs">No open position</p>
          </div>
        )}

        {/* Details */}
        <div className="text-xs space-y-1 text-terminal-text-dim">
          <div className="flex justify-between">
            <span>Avg. Volume</span>
            <span className="text-terminal-text">{data.avg_volume}</span>
          </div>
          <div className="flex justify-between">
            <span>Sector</span>
            <span className="text-terminal-text">{data.sector}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export { TICKER_DATA }
