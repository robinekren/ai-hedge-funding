'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'

export default function LoginScreen() {
  const { login, verify2FA, auth } = useStore()
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800))

    const success = login(username, password)
    setLoading(false)

    if (success) {
      setStep('2fa')
    } else {
      setError('Invalid credentials')
    }
  }

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise((r) => setTimeout(r, 600))

    const success = verify2FA(code)
    setLoading(false)

    if (!success) {
      setError('Invalid 2FA code. Enter any 6-digit number.')
    }
  }

  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center p-4">
      {/* Background grid effect */}
      <div className="fixed inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-terminal-green/20 flex items-center justify-center mx-auto mb-4 shadow-green-glow">
            <span className="text-terminal-green font-bold text-3xl">A</span>
          </div>
          <h1 className="text-terminal-green font-bold text-2xl tracking-wider">
            AI HEDGE FUNDING
          </h1>
          <p className="text-terminal-text-muted text-xs mt-2">
            Eko Growth LLC — Wyoming
          </p>
        </div>

        {/* Login Card */}
        <div className="card border border-terminal-green/20 shadow-green-glow">
          {step === 'credentials' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-terminal-text font-bold text-sm">SECURE LOGIN</h2>
                <p className="text-terminal-text-muted text-[10px] mt-1">
                  Authorized personnel only
                </p>
              </div>

              <div>
                <label className="metric-label block mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2.5 text-terminal-green font-mono text-sm focus:border-terminal-green outline-none transition-colors"
                  placeholder="Enter username"
                  autoFocus
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="metric-label block mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2.5 text-terminal-green font-mono text-sm focus:border-terminal-green outline-none transition-colors"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="bg-terminal-red/10 border border-terminal-red/30 rounded px-3 py-2">
                  <p className="text-terminal-red text-xs">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !username || !password}
                className={clsx(
                  'w-full btn-primary py-3 text-sm',
                  (loading || !username || !password) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-terminal-bg border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="text-center">
                <p className="text-terminal-text-muted text-[10px]">
                  Demo: robin / eko2026 (Owner) | investor / lp2026 (LP)
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handle2FA} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-terminal-text font-bold text-sm">TWO-FACTOR AUTHENTICATION</h2>
                <p className="text-terminal-text-muted text-[10px] mt-1">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex items-center justify-center gap-1">
                {/* 6 digit input */}
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setCode(val)
                  }}
                  className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-3 text-terminal-green font-mono text-2xl text-center tracking-[0.5em] focus:border-terminal-green outline-none transition-colors"
                  placeholder="000000"
                  autoFocus
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="bg-terminal-red/10 border border-terminal-red/30 rounded px-3 py-2">
                  <p className="text-terminal-red text-xs">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className={clsx(
                  'w-full btn-primary py-3 text-sm',
                  (loading || code.length !== 6) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-terminal-bg border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify & Enter'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('credentials')
                  setCode('')
                  setError('')
                }}
                className="w-full text-terminal-text-muted text-xs hover:text-terminal-green transition-colors"
              >
                Back to login
              </button>

              <div className="text-center">
                <p className="text-terminal-text-muted text-[10px]">
                  Demo: enter any 6-digit number
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Security Notice */}
        <div className="text-center mt-6">
          <p className="text-terminal-text-muted text-[10px]">
            256-bit encrypted · Session expires in 24h · All access logged
          </p>
        </div>
      </div>
    </div>
  )
}
