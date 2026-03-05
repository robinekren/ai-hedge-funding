'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import PortfolioOverview from '@/components/dashboard/PortfolioOverview'
import LiveTrades from '@/components/dashboard/LiveTrades'
import SignalFeed from '@/components/dashboard/SignalFeed'
import AgentStatus from '@/components/dashboard/AgentStatus'
import RiskMonitor from '@/components/dashboard/RiskMonitor'
import OwnerControls from '@/components/dashboard/OwnerControls'
import StrategyLibrary from '@/components/dashboard/StrategyLibrary'
import InvestorPortal from '@/components/dashboard/InvestorPortal'

type Screen =
  | 'portfolio'
  | 'trades'
  | 'signals'
  | 'agents'
  | 'risk'
  | 'controls'
  | 'strategies'
  | 'investor'

export default function Dashboard() {
  const [activeScreen, setActiveScreen] = useState<Screen>('portfolio')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderScreen = () => {
    switch (activeScreen) {
      case 'portfolio':
        return <PortfolioOverview />
      case 'trades':
        return <LiveTrades />
      case 'signals':
        return <SignalFeed />
      case 'agents':
        return <AgentStatus />
      case 'risk':
        return <RiskMonitor />
      case 'controls':
        return <OwnerControls />
      case 'strategies':
        return <StrategyLibrary />
      case 'investor':
        return <InvestorPortal />
      default:
        return <PortfolioOverview />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar — Primary navigation */}
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar — 5 Trillionaire Metrics */}
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Screen Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {renderScreen()}
        </main>
      </div>
    </div>
  )
}
