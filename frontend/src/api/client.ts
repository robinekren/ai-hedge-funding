/**
 * AI Hedge Funding — API Client
 * Connects dashboard to FastAPI backend.
 * Multi-fund aware: all fund-scoped endpoints accept fundId parameter.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class APIClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`)
    }

    return res.json()
  }

  private fundQuery(fundId?: string): string {
    return fundId ? `?fund_id=${encodeURIComponent(fundId)}` : ''
  }

  // Fund Management
  async getFunds() {
    return this.request('/funds')
  }

  async getFund(fundId: string) {
    return this.request(`/funds/${fundId}`)
  }

  // Auth
  async login(username: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    this.token = data.token
    return data
  }

  // Dashboard Metrics (Top Bar — 5 Trillionaire Metrics)
  async getMetrics(fundId?: string) {
    return this.request(`/dashboard/metrics${this.fundQuery(fundId)}`)
  }

  // Portfolio Overview
  async getPortfolioOverview(fundId?: string) {
    return this.request(`/portfolio/overview${this.fundQuery(fundId)}`)
  }

  // Live Trades
  async getLiveTrades(fundId?: string) {
    return this.request(`/trades/live${this.fundQuery(fundId)}`)
  }

  // Signal Feed (global — no fund_id needed)
  async getSignalFeed() {
    return this.request('/signals/feed')
  }

  // Agent Status (global — no fund_id needed)
  async getAgentStatus() {
    return this.request('/agents/status')
  }

  // Risk Monitor
  async getRiskMonitor(fundId?: string) {
    return this.request(`/risk/monitor${this.fundQuery(fundId)}`)
  }

  // Strategy Library
  async getStrategyLibrary(fundId?: string) {
    return this.request(`/strategies/library${this.fundQuery(fundId)}`)
  }

  // Backtest Runner
  async runBacktest(variations: number = 5, fundId?: string) {
    return this.request(`/strategies/backtest${this.fundQuery(fundId)}`, {
      method: 'POST',
      body: JSON.stringify({ variations }),
    })
  }

  // Owner Controls
  async phaseTransition(target: string, fundId?: string) {
    const q = fundId ? `?target=${target}&fund_id=${encodeURIComponent(fundId)}` : `?target=${target}`
    return this.request(`/controls/phase-transition${q}`, { method: 'POST' })
  }

  async setDailyLossLimit(limit: number, fundId?: string) {
    const q = fundId ? `?limit=${limit}&fund_id=${encodeURIComponent(fundId)}` : `?limit=${limit}`
    return this.request(`/controls/daily-loss-limit${q}`, { method: 'POST' })
  }

  async pauseAgent(role: string) {
    return this.request(`/controls/agent/${role}/pause`, { method: 'POST' })
  }

  async startAgent(role: string) {
    return this.request(`/controls/agent/${role}/start`, { method: 'POST' })
  }

  async emergencyStop(fundId?: string) {
    return this.request(`/controls/emergency-stop${this.fundQuery(fundId)}`, { method: 'POST' })
  }

  // Trade Approval (Phase 1)
  async approveTrade(proposalId: string) {
    return this.request(`/trades/${proposalId}/approve`, { method: 'POST' })
  }

  async rejectTrade(proposalId: string) {
    return this.request(`/trades/${proposalId}/reject`, { method: 'POST' })
  }

  // Meta Learner
  async getMetaLearnerPending() {
    return this.request('/meta-learner/pending')
  }

  async approveMetaDeployment(strategyId: string) {
    return this.request(`/meta-learner/approve/${strategyId}`, { method: 'POST' })
  }

  // Autonomy Protocol
  async getAutonomyStatus() {
    return this.request('/autonomy/status')
  }

  // Investor Portal (Read-Only)
  async getInvestorPortfolio(fundId?: string) {
    return this.request(`/investor/portfolio${this.fundQuery(fundId)}`)
  }

  async getInvestorPerformance(fundId?: string) {
    return this.request(`/investor/performance${this.fundQuery(fundId)}`)
  }

  // System Info
  async getSystemInfo() {
    return this.request('/system/info')
  }
}

export const api = new APIClient()
export default api
