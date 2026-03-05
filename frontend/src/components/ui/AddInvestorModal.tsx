'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'

const PRESET_COLORS = ['#ffd700', '#00bfff', '#ff6b9d', '#a78bfa', '#f97316', '#22d3ee', '#84cc16', '#ec4899']

interface AddInvestorModalProps {
  open: boolean
  onClose: () => void
}

export default function AddInvestorModal({ open, onClose }: AddInvestorModalProps) {
  const { addFund } = useStore()
  const [name, setName] = useState('')
  const [capital, setCapital] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [lossLimit, setLossLimit] = useState('')

  const handleSubmit = () => {
    const capitalNum = parseFloat(capital)
    if (!name.trim() || isNaN(capitalNum) || capitalNum <= 0) return

    const lossLimitNum = parseFloat(lossLimit) || capitalNum * 0.01

    addFund({
      name: name.trim(),
      color,
      starting_capital: capitalNum,
      phase: 'phase_1',
      execution_mode: 'supervised',
      daily_loss_limit: lossLimitNum,
      max_position_size_pct: 0.05,
      emergency_active: false,
    })

    // Reset
    setName('')
    setCapital('')
    setLossLimit('')
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)])
    onClose()
  }

  if (!open) return null

  const capitalNum = parseFloat(capital)
  const isValid = name.trim().length > 0 && !isNaN(capitalNum) && capitalNum > 0

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-terminal-surface border border-terminal-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-terminal-green font-bold text-lg">Add Investor</h3>
          <button onClick={onClose} className="text-terminal-text-muted hover:text-terminal-text text-lg">✕</button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-terminal-text-dim text-xs block mb-1.5">Investor / Fund Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sheikh Abdullah Fund"
              className="w-full bg-terminal-bg border border-terminal-border rounded-lg px-3 py-2.5 text-terminal-text text-sm placeholder-terminal-text-muted/40 focus:border-terminal-green outline-none"
              autoFocus
            />
          </div>

          {/* Capital */}
          <div>
            <label className="text-terminal-text-dim text-xs block mb-1.5">Starting Capital ($)</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              placeholder="e.g. 5000000"
              className="w-full bg-terminal-bg border border-terminal-border rounded-lg px-3 py-2.5 text-terminal-green font-mono text-sm placeholder-terminal-text-muted/40 focus:border-terminal-green outline-none"
            />
            {capitalNum > 0 && (
              <p className="text-[10px] text-terminal-text-muted mt-1">
                ${capitalNum.toLocaleString()} USD
              </p>
            )}
          </div>

          {/* Daily Loss Limit */}
          <div>
            <label className="text-terminal-text-dim text-xs block mb-1.5">Daily Loss Limit ($)</label>
            <input
              type="number"
              value={lossLimit}
              onChange={(e) => setLossLimit(e.target.value)}
              placeholder={capitalNum > 0 ? `Default: ${(capitalNum * 0.01).toLocaleString()} (1%)` : 'Auto: 1% of capital'}
              className="w-full bg-terminal-bg border border-terminal-border rounded-lg px-3 py-2.5 text-terminal-amber font-mono text-sm placeholder-terminal-text-muted/40 focus:border-terminal-green outline-none"
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-terminal-text-dim text-xs block mb-1.5">Fund Color</label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={clsx(
                    'w-7 h-7 rounded-full transition-all',
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-terminal-surface scale-110' : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {name && (
            <div className="bg-terminal-bg rounded-lg p-3 border border-terminal-border/50">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <div>
                  <p className="text-terminal-text text-sm font-semibold">{name}</p>
                  <p className="text-terminal-text-muted text-[10px]">
                    {capitalNum > 0 ? `$${capitalNum.toLocaleString()} Capital` : 'Enter capital amount'}
                    {' · Phase 1 · Supervised'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={clsx(
              'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all',
              isValid
                ? 'bg-terminal-green text-terminal-bg hover:brightness-110'
                : 'bg-terminal-border text-terminal-text-muted cursor-not-allowed'
            )}
          >
            Add Investor
          </button>
          <button onClick={onClose} className="btn-outline flex-1 text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
