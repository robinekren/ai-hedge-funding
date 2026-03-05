'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ───────────────────────────────────────────────────────────────────

export type Screen =
  | 'portfolio' | 'trades' | 'signals' | 'agents'
  | 'risk' | 'controls' | 'strategies' | 'investor' | 'audit'

export type Theme = 'dark' | 'light'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  timestamp: number
  autoDismiss?: boolean
}

export interface AuditEntry {
  id: string
  timestamp: number
  user: string
  action: string
  category: 'trade' | 'agent' | 'risk' | 'system' | 'auth' | 'phase'
  details?: string
  severity: 'info' | 'warning' | 'critical'
}

export interface AuthState {
  isAuthenticated: boolean
  user: { name: string; role: 'owner' | 'investor' } | null
  twoFactorRequired: boolean
  twoFactorVerified: boolean
  sessionExpiry: number | null
}

export interface Fund {
  id: string
  name: string
  color: string
  starting_capital: number
  phase: string
  execution_mode: string
  daily_loss_limit: number
  max_position_size_pct: number
  emergency_active: boolean
  created_at: string
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface AppState {
  // Auth
  auth: AuthState
  login: (user: string, password: string) => boolean
  verify2FA: (code: string) => boolean
  logout: () => void

  // Funds
  funds: Fund[]
  activeFundId: string | null
  setFunds: (funds: Fund[]) => void
  setActiveFund: (fundId: string) => void
  addFund: (fund: Omit<Fund, 'id' | 'created_at'>) => void
  removeFund: (fundId: string) => void

  // Navigation
  activeScreen: Screen
  setActiveScreen: (screen: Screen) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // Theme
  theme: Theme
  toggleTheme: () => void

  // Command Palette
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void

  // Toasts
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void
  removeToast: (id: string) => void

  // Audit Log
  auditLog: AuditEntry[]
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void

  // Onboarding
  onboardingComplete: boolean
  setOnboardingComplete: (complete: boolean) => void
  onboardingStep: number
  setOnboardingStep: (step: number) => void

  // Controls State (persisted)
  currentPhase: string
  setCurrentPhase: (phase: string) => void
  dailyLossLimit: number
  setDailyLossLimit: (limit: number) => void
  agentStates: Record<string, string>
  setAgentState: (agent: string, state: string) => void
  setAllAgentStates: (states: Record<string, string>) => void
  emergencyActive: boolean
  setEmergencyActive: (active: boolean) => void

  // Ticker Modal
  selectedTicker: string | null
  setSelectedTicker: (ticker: string | null) => void

  // Toasts bulk
  clearAllToasts: () => void

  // Connection
  backendConnected: boolean
  setBackendConnected: (connected: boolean) => void
  lastDataUpdate: number | null
  setLastDataUpdate: (ts: number) => void
}

let toastCounter = 0
let auditCounter = 0

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ─── Auth ──────────────────────────────────────────────────
      auth: {
        isAuthenticated: false,
        user: null,
        twoFactorRequired: true,
        twoFactorVerified: false,
        sessionExpiry: null,
      },
      login: (user: string, password: string) => {
        // Demo credentials — in production this would hit the API
        const validUsers: Record<string, { pw: string; role: 'owner' | 'investor' }> = {
          robin: { pw: 'eko2026', role: 'owner' },
          felix: { pw: 'eko2026', role: 'owner' },
          investor: { pw: 'lp2026', role: 'investor' },
        }
        const entry = validUsers[user.toLowerCase()]
        if (entry && entry.pw === password) {
          set({
            auth: {
              isAuthenticated: false, // need 2FA still
              user: { name: user, role: entry.role },
              twoFactorRequired: true,
              twoFactorVerified: false,
              sessionExpiry: Date.now() + 24 * 60 * 60 * 1000,
            },
          })
          get().addAuditEntry({
            user,
            action: 'Login attempt — credentials verified',
            category: 'auth',
            severity: 'info',
          })
          return true
        }
        get().addAuditEntry({
          user: user || 'unknown',
          action: `Failed login attempt`,
          category: 'auth',
          severity: 'warning',
        })
        return false
      },
      verify2FA: (code: string) => {
        // Demo: any 6-digit code works
        if (/^\d{6}$/.test(code)) {
          const auth = get().auth
          set({
            auth: {
              ...auth,
              isAuthenticated: true,
              twoFactorVerified: true,
              sessionExpiry: Date.now() + 24 * 60 * 60 * 1000,
            },
          })
          get().addAuditEntry({
            user: auth.user?.name || 'unknown',
            action: '2FA verified — session started',
            category: 'auth',
            severity: 'info',
          })
          return true
        }
        return false
      },
      logout: () => {
        const user = get().auth.user?.name || 'unknown'
        get().addAuditEntry({
          user,
          action: 'Logged out',
          category: 'auth',
          severity: 'info',
        })
        set({
          auth: {
            isAuthenticated: false,
            user: null,
            twoFactorRequired: true,
            twoFactorVerified: false,
            sessionExpiry: null,
          },
        })
      },

      // ─── Funds ──────────────────────────────────────────────────
      funds: [
        {
          id: 'fund_default',
          name: 'AI Hedge Funding',
          color: '#00ff88',
          starting_capital: 100000,
          phase: 'phase_1',
          execution_mode: 'supervised',
          daily_loss_limit: 1000,
          max_position_size_pct: 0.05,
          emergency_active: false,
          created_at: '2025-10-01T00:00:00.000Z',
        },
        {
          id: 'fund_sheikh_a',
          name: 'Sheikh Abdullah Fund',
          color: '#ffd700',
          starting_capital: 5000000,
          phase: 'phase_2',
          execution_mode: 'semi_autonomous',
          daily_loss_limit: 50000,
          max_position_size_pct: 0.03,
          emergency_active: false,
          created_at: '2025-11-15T00:00:00.000Z',
        },
        {
          id: 'fund_sheikh_b',
          name: 'Sheikh Rashid Fund',
          color: '#00bfff',
          starting_capital: 10000000,
          phase: 'phase_1',
          execution_mode: 'supervised',
          daily_loss_limit: 100000,
          max_position_size_pct: 0.02,
          emergency_active: false,
          created_at: '2025-12-01T00:00:00.000Z',
        },
        {
          id: 'fund_sheikh_c',
          name: 'Sheikh Mansour Fund',
          color: '#ff6b9d',
          starting_capital: 25000000,
          phase: 'phase_1',
          execution_mode: 'supervised',
          daily_loss_limit: 250000,
          max_position_size_pct: 0.02,
          emergency_active: false,
          created_at: '2026-01-10T00:00:00.000Z',
        },
      ],
      activeFundId: 'fund_default',
      setFunds: (funds) => {
        set({ funds })
        // If active fund not in new list, select first
        const state = get()
        if (!funds.find(f => f.id === state.activeFundId) && funds.length > 0) {
          set({ activeFundId: funds[0].id })
        }
      },
      addFund: (fund) => {
        const id = `fund_${Date.now()}`
        const newFund: Fund = { ...fund, id, created_at: new Date().toISOString() }
        set((s) => ({ funds: [...s.funds, newFund] }))
        set({ activeFundId: id })
        get().addToast({ type: 'success', title: 'Investor Added', message: `${fund.name} — $${fund.starting_capital.toLocaleString()}` })
        get().addAuditEntry({
          user: get().auth.user?.name || 'system',
          action: `New investor fund created: ${fund.name}`,
          category: 'system',
          severity: 'info',
        })
      },
      removeFund: (fundId) => {
        const fund = get().funds.find(f => f.id === fundId)
        set((s) => ({ funds: s.funds.filter(f => f.id !== fundId) }))
        if (get().activeFundId === fundId) {
          const remaining = get().funds
          if (remaining.length > 0) set({ activeFundId: remaining[0].id })
        }
        if (fund) {
          get().addAuditEntry({
            user: get().auth.user?.name || 'system',
            action: `Investor fund removed: ${fund.name}`,
            category: 'system',
            severity: 'warning',
          })
        }
      },
      setActiveFund: (fundId) => {
        set({ activeFundId: fundId })
        const fund = get().funds.find(f => f.id === fundId)
        if (fund) {
          // Sync per-fund controls to store
          set({
            currentPhase: fund.phase,
            dailyLossLimit: fund.daily_loss_limit,
            emergencyActive: fund.emergency_active,
          })
        }
        get().addAuditEntry({
          user: get().auth.user?.name || 'system',
          action: `Switched to fund: ${fund?.name || fundId}`,
          category: 'system',
          severity: 'info',
        })
      },

      // ─── Navigation ────────────────────────────────────────────
      activeScreen: 'portfolio',
      setActiveScreen: (screen) => set({ activeScreen: screen }),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // ─── Theme ─────────────────────────────────────────────────
      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      // ─── Command Palette ───────────────────────────────────────
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // ─── Toasts ────────────────────────────────────────────────
      toasts: [],
      addToast: (toast) => {
        const id = `toast-${++toastCounter}-${Date.now()}`
        const newToast: Toast = { ...toast, id, timestamp: Date.now(), autoDismiss: toast.autoDismiss ?? true }
        set((s) => ({ toasts: [...s.toasts.slice(-9), newToast] }))
        if (newToast.autoDismiss) {
          setTimeout(() => get().removeToast(id), 5000)
        }
      },
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      // ─── Audit Log ─────────────────────────────────────────────
      auditLog: [],
      addAuditEntry: (entry) => {
        const id = `audit-${++auditCounter}-${Date.now()}`
        const newEntry: AuditEntry = { ...entry, id, timestamp: Date.now() }
        set((s) => ({ auditLog: [newEntry, ...s.auditLog].slice(0, 500) }))
      },

      // ─── Onboarding ───────────────────────────────────────────
      onboardingComplete: false,
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
      onboardingStep: 0,
      setOnboardingStep: (step) => set({ onboardingStep: step }),

      // ─── Controls State ────────────────────────────────────────
      currentPhase: 'phase_1',
      setCurrentPhase: (phase) => {
        set({ currentPhase: phase })
        get().addAuditEntry({
          user: get().auth.user?.name || 'system',
          action: `Phase transition to ${phase}`,
          category: 'phase',
          severity: 'critical',
        })
      },
      dailyLossLimit: 1000,
      setDailyLossLimit: (limit) => {
        set({ dailyLossLimit: limit })
        get().addAuditEntry({
          user: get().auth.user?.name || 'system',
          action: `Daily loss limit changed to $${limit.toLocaleString()}`,
          category: 'risk',
          severity: 'warning',
        })
      },
      agentStates: {
        signal_harvester: 'running',
        chatter_analyst: 'running',
        strategy_engine: 'running',
        execution_agent: 'running',
        risk_sentinel: 'running',
        portfolio_conductor: 'running',
        meta_learner: 'running',
        compliance_capital: 'running',
      },
      setAgentState: (agent, state) => {
        set((s) => ({ agentStates: { ...s.agentStates, [agent]: state } }))
        get().addAuditEntry({
          user: get().auth.user?.name || 'system',
          action: `Agent ${agent} set to ${state}`,
          category: 'agent',
          severity: state === 'paused' ? 'warning' : 'info',
        })
      },
      setAllAgentStates: (states) => set({ agentStates: states }),
      emergencyActive: false,
      setEmergencyActive: (active) => {
        set({ emergencyActive: active })
        if (active) {
          get().addAuditEntry({
            user: get().auth.user?.name || 'system',
            action: 'EMERGENCY STOP ACTIVATED — All agents paused, positions closing',
            category: 'system',
            severity: 'critical',
          })
          get().addToast({
            type: 'error',
            title: 'EMERGENCY STOP',
            message: 'All trading halted. All agents paused.',
            autoDismiss: false,
          })
        }
      },

      // ─── Ticker Modal ──────────────────────────────────────────
      selectedTicker: null,
      setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),

      // ─── Toasts bulk ─────────────────────────────────────────
      clearAllToasts: () => set({ toasts: [] }),

      // ─── Connection ────────────────────────────────────────────
      backendConnected: false,
      setBackendConnected: (connected) => set({ backendConnected: connected }),
      lastDataUpdate: null,
      setLastDataUpdate: (ts) => set({ lastDataUpdate: ts }),
    }),
    {
      name: 'ai-hedge-fund-storage',
      partialize: (state) => ({
        auth: state.auth,
        theme: state.theme,
        funds: state.funds,
        activeFundId: state.activeFundId,
        onboardingComplete: state.onboardingComplete,
        currentPhase: state.currentPhase,
        dailyLossLimit: state.dailyLossLimit,
        agentStates: state.agentStates,
        auditLog: state.auditLog.slice(0, 100),
      }),
    }
  )
)
