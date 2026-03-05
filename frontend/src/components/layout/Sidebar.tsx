'use client'

import { clsx } from 'clsx'

interface SidebarProps {
  activeScreen: string
  onNavigate: (screen: any) => void
  isOpen: boolean
  onToggle: () => void
}

const NAV_ITEMS = [
  { id: 'portfolio', label: 'Portfolio', icon: '◈', section: 'Phase 1' },
  { id: 'trades', label: 'Live Trades', icon: '⟐', section: 'Phase 1' },
  { id: 'signals', label: 'Signal Feed', icon: '◉', section: 'Phase 1' },
  { id: 'agents', label: 'Agent Status', icon: '⬡', section: 'Phase 1' },
  { id: 'risk', label: 'Risk Monitor', icon: '△', section: 'Phase 1' },
  { id: 'strategies', label: 'Strategies', icon: '⧫', section: 'Phase 2' },
  { id: 'controls', label: 'Controls', icon: '⚙', section: 'Owner' },
  { id: 'investor', label: 'Investor Portal', icon: '◇', section: 'LP' },
]

export default function Sidebar({ activeScreen, onNavigate, isOpen, onToggle }: SidebarProps) {
  let currentSection = ''

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-terminal-surface border-r border-terminal-border',
          'flex flex-col transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
        )}
      >
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

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
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
                  <span className="text-base w-6 text-center">{item.icon}</span>
                  {isOpen && <span>{item.label}</span>}
                </button>
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        {isOpen && (
          <div className="p-4 border-t border-terminal-border">
            <p className="text-terminal-text-muted text-[10px]">Robin · Felix</p>
            <p className="text-terminal-text-muted text-[10px]">Wyoming LLC · 2026</p>
          </div>
        )}
      </aside>
    </>
  )
}
