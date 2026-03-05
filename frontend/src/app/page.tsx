'use client'

import { useEffect } from 'react'
import { useStore, Screen } from '@/store/useStore'
import LoginScreen from '@/components/auth/LoginScreen'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import ToastContainer from '@/components/ui/ToastContainer'
import CommandPalette from '@/components/ui/CommandPalette'
import Onboarding from '@/components/ui/Onboarding'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import ConnectionBanner from '@/components/ui/ConnectionBanner'
import TickerModal from '@/components/ui/TickerModal'
import { useWebSocket } from '@/hooks/useWebSocket'
import PortfolioOverview from '@/components/dashboard/PortfolioOverview'
import LiveTrades from '@/components/dashboard/LiveTrades'
import SignalFeed from '@/components/dashboard/SignalFeed'
import AgentStatus from '@/components/dashboard/AgentStatus'
import RiskMonitor from '@/components/dashboard/RiskMonitor'
import OwnerControls from '@/components/dashboard/OwnerControls'
import StrategyLibrary from '@/components/dashboard/StrategyLibrary'
import InvestorPortal from '@/components/dashboard/InvestorPortal'
import AuditLog from '@/components/dashboard/AuditLog'

export default function Dashboard() {
  const {
    auth,
    logout,
    activeScreen,
    setActiveScreen,
    sidebarOpen,
    setSidebarOpen,
    onboardingComplete,
    commandPaletteOpen,
    setCommandPaletteOpen,
    selectedTicker,
    setSelectedTicker,
  } = useStore()

  // WebSocket connection
  useWebSocket()

  // Session timeout check
  useEffect(() => {
    const checkSession = () => {
      if (auth.isAuthenticated && auth.sessionExpiry && Date.now() > auth.sessionExpiry) {
        logout()
      }
    }
    const interval = setInterval(checkSession, 30000)
    checkSession()
    return () => clearInterval(interval)
  }, [auth.isAuthenticated, auth.sessionExpiry, logout])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const screenMap: Record<string, Screen> = {
        '1': 'portfolio', '2': 'trades', '3': 'signals', '4': 'agents',
        '5': 'risk', '6': 'controls', '7': 'strategies', '8': 'investor', '9': 'audit',
      }

      if (screenMap[e.key] && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setActiveScreen(screenMap[e.key])
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActiveScreen, commandPaletteOpen, setCommandPaletteOpen])

  // Auth guard
  if (!auth.isAuthenticated) {
    return <LoginScreen />
  }

  const renderScreen = () => {
    if (auth.user?.role === 'investor') {
      if (activeScreen === 'investor') return <InvestorPortal />
      return <PortfolioOverview />
    }

    switch (activeScreen) {
      case 'portfolio': return <PortfolioOverview />
      case 'trades': return <LiveTrades />
      case 'signals': return <SignalFeed />
      case 'agents': return <AgentStatus />
      case 'risk': return <RiskMonitor />
      case 'controls': return <OwnerControls />
      case 'strategies': return <StrategyLibrary />
      case 'investor': return <InvestorPortal />
      case 'audit': return <AuditLog />
      default: return <PortfolioOverview />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <ConnectionBanner />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <ErrorBoundary fallbackLabel={activeScreen}>
            {renderScreen()}
          </ErrorBoundary>
        </main>
      </div>

      <ToastContainer />
      <CommandPalette />
      <TickerModal ticker={selectedTicker} onClose={() => setSelectedTicker(null)} />
      {!onboardingComplete && <Onboarding />}
    </div>
  )
}
