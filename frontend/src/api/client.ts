/**
 * AI Hedge Funding — API Client
 * Connects dashboard to FastAPI backend.
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
  async getMetrics() {
    return this.request('/dashboard/metrics')
  }

  // Portfolio Overview
  async getPortfolioOverview() {
    return this.request('/portfolio/overview')
  }

  // Live Trades
  async getLiveTrades() {
    return this.request('/trades/live')
  }

  // Signal Feed
  async getSignalFeed() {
    return this.request('/signals/feed')
  }

  // Agent Status
  async getAgentStatus() {
    return this.request('/agents/status')
  }

  // Risk Monitor
  async getRiskMonitor() {
    return this.request('/risk/monitor')
  }

  // Strategy Library
  async getStrategyLibrary() {
    return this.request('/strategies/library')
  }

  // Backtest Runner
  async runBacktest(variations: number = 5) {
    return this.request('/strategies/backtest', {
      method: 'POST',
      body: JSON.stringify({ variations }),
    })
  }

  // Owner Controls
  async phaseTransition(target: string) {
    return this.request(`/controls/phase-transition?target=${target}`, { method: 'POST' })
  }

  async setDailyLossLimit(limit: number) {
    return this.request(`/controls/daily-loss-limit?limit=${limit}`, { method: 'POST' })
  }

  async pauseAgent(role: string) {
    return this.request(`/controls/agent/${role}/pause`, { method: 'POST' })
  }

  async startAgent(role: string) {
    return this.request(`/controls/agent/${role}/start`, { method: 'POST' })
  }

  async emergencyStop() {
    return this.request('/controls/emergency-stop', { method: 'POST' })
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
  async getInvestorPortfolio() {
    return this.request('/investor/portfolio')
  }

  async getInvestorPerformance() {
    return this.request('/investor/performance')
  }

  // System Info
  async getSystemInfo() {
    return this.request('/system/info')
  }
}

export const api = new APIClient()
export default api
