'use client'

import { useState, useEffect } from 'react'

const SHORTCUTS = [
  { key: '1', desc: 'Portfolio Overview' },
  { key: '2', desc: 'Live Trades' },
  { key: '3', desc: 'Signal Feed' },
  { key: '4', desc: 'Agent Status' },
  { key: '5', desc: 'Risk Monitor' },
  { key: '6', desc: 'Owner Controls' },
  { key: '7', desc: 'Strategy Library' },
  { key: '8', desc: 'Investor Portal' },
  { key: '9', desc: 'Activity Log' },
  { key: 'Ctrl+K', desc: 'Command Palette' },
  { key: '?', desc: 'Show this help' },
]

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-terminal-surface border border-terminal-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-terminal-green font-bold text-lg">Keyboard Shortcuts</h3>
          <button onClick={() => setOpen(false)} className="text-terminal-text-muted hover:text-terminal-text text-lg">
            ✕
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1.5 border-b border-terminal-border/50">
              <span className="text-terminal-text-dim text-sm">{s.desc}</span>
              <kbd className="bg-terminal-bg border border-terminal-border rounded px-2 py-0.5 text-xs text-terminal-green font-mono">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-terminal-text-muted text-[10px] mt-4 text-center">
          Press <kbd className="bg-terminal-bg border border-terminal-border rounded px-1 text-[10px]">?</kbd> or <kbd className="bg-terminal-bg border border-terminal-border rounded px-1 text-[10px]">Esc</kbd> to close
        </p>
      </div>
    </div>
  )
}
