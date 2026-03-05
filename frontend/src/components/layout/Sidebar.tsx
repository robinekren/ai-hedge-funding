'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'

const NAV_ITEMS = [
  { id: 'portfolio', label: 'Portfolio', icon: '[P]', section: 'Phase 1', shortcut: '1' },
  { id: 'trades', label: 'Live Trades', icon: '[T]', section: 'Phase 1', shortcut: '2' },
  { id: 'signals', label: 'Signal Feed', icon: '[S]', section: 'Phase 1', shortcut: '3' },
  { id: 'agents', label: 'Agent Status', icon: '[A]', section: 'Phase 1', shortcut: '4' },
  { id: 'risk', label: 'Risk Monitor', icon: '[R]', section: 'Phase 1', shortcut: '5' },
  { id: 'strategies', label: 'Strategies', icon: '[#]', section: 'Phase 2', shortcut: '7' },
  { id: 'controls', label: 'Controls', icon: '[C]', section: 'Owner', shortcut: '6' },
  { id: 'investor', label: 'Investor Portal', icon: '[I]', section: 'LP', shortcut: '8' },
  { id: 'audit', label: 'Activity Log', icon: '[L]', section: 'System', shortcut: '9' },
]

interface SidebarProps {
  activeScreen: string
  onNavigate: (screen: any) => void
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ activeScreen, onNavigate, isOpen, onToggle }: SidebarProps) {
  const { auth, logout, theme, toggleTheme, funds, activeFundId, setActiveFund } = useStore()
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [fundDropdownOpen, setFundDropdownOpen] = useState(false)
  let currentSection = ''

  const activeFund = funds.find(f => f.id === activeFundId) || funds[0]

  const formatCapital = (val: number) =>
    val >= 1_000_000_000 ? (val / 1_000_000_000).toFixed(1) + 'B'
    : val >= 1_000_000 ? (val / 1_000_000).toFixed(1) + 'M'
    : (val / 1_000).toFixed(0) + 'K'

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onToggle} />
      )}

      <aside className={clsx(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-terminal-surface border-r border-terminal-border',
        'flex flex-col transition-transform duration-200',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-terminal-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-terminal-green/20 flex items-center justify-center">
              <span className="text-terminal-green font-bold text-lg">A</span>
            </div>
            {isOpen && (
              <div>
                <h1 className="text-terminal-green font-bold text-sm">AI HEDGE FUNDING</h1>
                <p className="text-terminal-text-muted text-[10px]">Eko Growth LLC</p>
              </div>
            )}
          </div>
        </div>

        {/* Fund Selector */}
        {isOpen && funds.length > 0 && (
          <div className="mx-3 mt-3 relative">
            <button
              onClick={() => setFundDropdownOpen(!fundDropdownOpen)}
              className={clsx(
                'w-full bg-terminal-bg border rounded-lg px-3 py-2.5 flex items-center gap-2.5 transition-colors',
                fundDropdownOpen
                  ? 'border-terminal-green/50 shadow-green-glow'
                  : 'border-terminal-border hover:border-terminal-text-muted'
              )}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: activeFund?.color || '#00ff88' }}
              />
              <div className="flex-1 text-left min-w-0">
                <span className="text-terminal-text text-[11px] font-semibold block truncate">
                  {activeFund?.name || 'Select Fund'}
                </span>
                <span className="text-terminal-text-muted text-[10px] block">
                  ${formatCapital(activeFund?.starting_capital || 0)} Capital
                </span>
              </div>
              <span className={clsx(
                'text-[10px] transition-transform',
                fundDropdownOpen ? 'text-terminal-green rotate-180' : 'text-terminal-text-muted'
              )}>
                ▼
              </span>
            </button>

            {/* Dropdown */}
            {fundDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-terminal-surface border border-terminal-border rounded-lg overflow-hidden z-50 shadow-lg shadow-black/50">
                {funds.map((fund) => (
                  <button
                    key={fund.id}
                    onClick={() => {
                      setActiveFund(fund.id)
                      setFundDropdownOpen(false)
                    }}
                    className={clsx(
                      'w-full px-3 py-2.5 flex items-center gap-2.5 transition-colors text-left',
                      'border-b border-terminal-border/50 last:border-b-0',
                      fund.id === activeFundId
                        ? 'bg-terminal-green/10'
                        : 'hover:bg-terminal-green/5'
                    )}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: fund.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className={clsx(
                        'text-[11px] font-semibold block truncate',
                        fund.id === activeFundId ? 'text-terminal-green' : 'text-terminal-text'
                      )}>
                        {fund.name}
                      </span>
                      <span className="text-terminal-text-muted text-[10px] block">
                        {fund.phase === 'phase_1' ? 'Phase 1' : fund.phase === 'phase_2' ? 'Phase 2' : 'Phase 3'}
                        {' · $'}
                        {formatCapital(fund.starting_capital)}
                      </span>
                    </div>
                    {fund.emergency_active && (
                      <span className="text-terminal-red text-[9px] font-bold">HALT</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            // Only show investor tab for investors, hide controls for investors
            if (auth.user?.role === 'investor' && !['portfolio', 'investor'].includes(item.id)) return null
            if (auth.user?.role === 'investor' && item.id === 'controls') return null

            const showSection = item.section !== currentSection
            if (showSection) currentSection = item.section

            return (
              <div key={item.id}>
                {showSection && isOpen && (
                  <div className="px-4 py-2 mt-2">
                    <span className="text-terminal-text-muted text-[10px] uppercase tracking-widest">
                      {item.section}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => onNavigate(item.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all',
                    'hover:bg-terminal-green-glow hover:text-terminal-green',
                    activeScreen === item.id
                      ? 'text-terminal-green bg-terminal-green-glow border-r-2 border-terminal-green'
                      : 'text-terminal-text-dim'
                  )}
                >
                  <span className="text-xs w-6 text-center font-mono">{item.icon}</span>
                  {isOpen && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <kbd className="text-[10px] text-terminal-text-muted bg-terminal-bg px-1 py-0.5 rounded">
                        {item.shortcut}
                      </kbd>
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </nav>

        {/* Bottom: User + Theme + Logout */}
        {isOpen && (
          <div className="p-4 border-t border-terminal-border space-y-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-2 text-xs text-terminal-text-muted hover:text-terminal-green transition-colors"
            >
              <span>{theme === 'dark' ? '[D]' : '[L]'}</span>
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>

            {/* User info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-terminal-green text-xs font-bold">{auth.user?.name || 'Guest'}</p>
                <p className="text-terminal-text-muted text-[10px]">{auth.user?.role === 'owner' ? 'Fund Manager' : 'Investor'}</p>
              </div>
              {logoutConfirm ? (
                <div className="flex items-center gap-1">
                  <button onClick={logout} className="text-terminal-red text-xs font-bold">Confirm</button>
                  <button onClick={() => setLogoutConfirm(false)} className="text-terminal-text-muted text-xs">Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => setLogoutConfirm(true)}
                  className="text-terminal-text-muted hover:text-terminal-red text-xs transition-colors"
                >
                  Sign out
                </button>
              )}
            </div>

            <p className="text-terminal-text-muted text-[10px]">Ctrl+K: Command Palette</p>
          </div>
        )}
      </aside>
    </>
  )
}
