'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'

const WARNING_THRESHOLD = 5 * 60 * 1000 // 5 minutes before expiry

export default function SessionExpiryWarning() {
  const { auth, logout } = useStore()
  const [showWarning, setShowWarning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  const extendSession = () => {
    // Extend session by another 24h
    const store = useStore.getState()
    useStore.setState({
      auth: {
        ...store.auth,
        sessionExpiry: Date.now() + 24 * 60 * 60 * 1000,
      },
    })
    setShowWarning(false)
  }

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.sessionExpiry) return

    const checkExpiry = () => {
      const now = Date.now()
      const timeLeft = (auth.sessionExpiry || 0) - now

      if (timeLeft <= 0) {
        logout()
        return
      }

      if (timeLeft <= WARNING_THRESHOLD) {
        setShowWarning(true)
        setRemainingSeconds(Math.ceil(timeLeft / 1000))
      } else {
        setShowWarning(false)
      }
    }

    checkExpiry()
    const interval = setInterval(checkExpiry, 1000)
    return () => clearInterval(interval)
  }, [auth.isAuthenticated, auth.sessionExpiry, logout])

  if (!showWarning) return null

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-terminal-surface border-2 border-terminal-amber rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h3 className="text-terminal-amber font-bold text-lg mb-2">Session Expiring</h3>
        <p className="text-terminal-text text-sm mb-1">
          Your session expires in{' '}
          <span className="text-terminal-amber font-bold font-mono">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </p>
        <p className="text-terminal-text-dim text-xs mb-4">
          You will be logged out automatically. Extend to continue working.
        </p>
        <div className="flex gap-3">
          <button onClick={extendSession} className="btn-primary flex-1 text-sm">
            Extend Session
          </button>
          <button onClick={logout} className="btn-outline flex-1 text-sm">
            Logout Now
          </button>
        </div>
      </div>
    </div>
  )
}
