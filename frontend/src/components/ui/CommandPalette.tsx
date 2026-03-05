'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { clsx } from 'clsx'
import { useStore, Screen } from '@/store/useStore'

interface Command {
  id: string
  label: string
  category: string
  shortcut?: string
  action: () => void
}

export default function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveScreen,
    toggleTheme,
    theme,
    logout,
  } = useStore()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: Command[] = [
    { id: 'nav-portfolio', label: 'Go to Portfolio', category: 'Navigation', shortcut: '1', action: () => setActiveScreen('portfolio') },
    { id: 'nav-trades', label: 'Go to Live Trades', category: 'Navigation', shortcut: '2', action: () => setActiveScreen('trades') },
    { id: 'nav-signals', label: 'Go to Signal Feed', category: 'Navigation', shortcut: '3', action: () => setActiveScreen('signals') },
    { id: 'nav-agents', label: 'Go to Agent Status', category: 'Navigation', shortcut: '4', action: () => setActiveScreen('agents') },
    { id: 'nav-risk', label: 'Go to Risk Monitor', category: 'Navigation', shortcut: '5', action: () => setActiveScreen('risk') },
    { id: 'nav-controls', label: 'Go to Controls', category: 'Navigation', shortcut: '6', action: () => setActiveScreen('controls') },
    { id: 'nav-strategies', label: 'Go to Strategies', category: 'Navigation', shortcut: '7', action: () => setActiveScreen('strategies') },
    { id: 'nav-investor', label: 'Go to Investor Portal', category: 'Navigation', shortcut: '8', action: () => setActiveScreen('investor') },
    { id: 'nav-audit', label: 'Go to Audit Log', category: 'Navigation', shortcut: '9', action: () => setActiveScreen('audit') },
    { id: 'theme-toggle', label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, category: 'Settings', action: toggleTheme },
    { id: 'auth-logout', label: 'Sign Out', category: 'Account', action: logout },
    // Ticker search
    ...['PLTR', 'SOFI', 'NVDA', 'AMD', 'RIVN', 'TSLA', 'META', 'AAPL', 'MARA', 'COIN', 'RKLB', 'IONQ'].map(t => ({
      id: `ticker-${t}`,
      label: `$${t} — View Position`,
      category: 'Tickers',
      action: () => setActiveScreen('trades'),
    })),
  ]

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands

  const execute = useCallback(
    (cmd: Command) => {
      cmd.action()
      setCommandPaletteOpen(false)
      setQuery('')
      setSelectedIndex(0)
    },
    [setCommandPaletteOpen]
  )

  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [commandPaletteOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false)
        setQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      execute(filtered[selectedIndex])
    }
  }

  if (!commandPaletteOpen) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => {
          setCommandPaletteOpen(false)
          setQuery('')
        }}
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg bg-terminal-surface border border-terminal-border rounded-xl shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-terminal-border">
          <span className="text-terminal-text-muted text-sm">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-terminal-text font-mono text-sm outline-none placeholder:text-terminal-text-muted"
            placeholder="Search commands, tickers, pages..."
          />
          <kbd className="text-[10px] text-terminal-text-muted bg-terminal-bg px-1.5 py-0.5 rounded border border-terminal-border">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-terminal-text-muted text-sm">
              No results found
            </div>
          ) : (
            (() => {
              let lastCategory = ''
              return filtered.map((cmd, i) => {
                const showCategory = cmd.category !== lastCategory
                lastCategory = cmd.category
                return (
                  <div key={cmd.id}>
                    {showCategory && (
                      <div className="px-4 py-1">
                        <span className="text-terminal-text-muted text-[10px] uppercase tracking-wider">
                          {cmd.category}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => execute(cmd)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={clsx(
                        'w-full flex items-center justify-between px-4 py-2 text-sm transition-colors',
                        i === selectedIndex
                          ? 'bg-terminal-green/10 text-terminal-green'
                          : 'text-terminal-text hover:bg-terminal-green/5'
                      )}
                    >
                      <span>{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="text-[10px] text-terminal-text-muted bg-terminal-bg px-1.5 py-0.5 rounded border border-terminal-border">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  </div>
                )
              })
            })()
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-terminal-border text-[10px] text-terminal-text-muted">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  )
}
