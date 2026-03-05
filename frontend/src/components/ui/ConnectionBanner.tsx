'use client'

import { useStore } from '@/store/useStore'

export default function ConnectionBanner() {
  const { backendConnected } = useStore()

  if (backendConnected) return null

  return (
    <div className="bg-terminal-red/20 border-b border-terminal-red/40 px-4 py-2 flex items-center justify-center gap-2">
      <div className="w-2 h-2 rounded-full bg-terminal-red animate-pulse" />
      <span className="text-terminal-red text-xs font-bold">
        BACKEND DISCONNECTED — Running in demo mode with cached data
      </span>
    </div>
  )
}
