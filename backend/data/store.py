"""
AI Hedge Funding — Data Store
Phase 1: In-memory store (Airtable-compatible).
Phase 2: Migrates to Supabase.

Multi-fund aware: all fund-scoped data is filtered by fund_id.
Signals and analyses are global (shared across funds).
"""

import logging
from datetime import datetime

from backend.models.schemas import (
    Fund, SocialSignal, ChatterAnalysis, TradeProposal, Position,
    Strategy, BacktestResult, PortfolioSnapshot, RiskSnapshot,
    AgentState
)

logger = logging.getLogger(__name__)

# Default fund — backwards compatible
DEFAULT_FUND = Fund(
    id="fund_default",
    name="AI Hedge Funding",
    color="#00ff88",
    starting_capital=100000.0,
    phase="phase_1",
    execution_mode="supervised",
    daily_loss_limit=1000.0,
)


class DataStore:
    """
    Central data store for the system.
    Phase 1: In-memory with Airtable persistence.
    Phase 2: Supabase migration.

    Multi-fund: Funds, positions, trades, strategies, snapshots are fund-scoped.
    Signals and analyses are global (Reddit doesn't know about funds).
    """

    def __init__(self):
        # ─── Fund Registry ─────────────────────────────────
        self.funds: dict[str, Fund] = {
            DEFAULT_FUND.id: DEFAULT_FUND,
        }

        # ─── Global data (shared across funds) ─────────────
        self.signals: list[SocialSignal] = []
        self.analyses: list[ChatterAnalysis] = []
        self.agent_states: list[AgentState] = []

        # ─── Fund-scoped data ──────────────────────────────
        self.trade_proposals: list[TradeProposal] = []
        self.positions: list[Position] = []
        self.strategies: list[Strategy] = []
        self.backtest_results: list[BacktestResult] = []
        self.portfolio_snapshots: list[PortfolioSnapshot] = []
        self.risk_snapshots: list[RiskSnapshot] = []

    # ─── Fund Management ────────────────────────────────────

    def add_fund(self, fund: Fund):
        self.funds[fund.id] = fund

    def get_fund(self, fund_id: str) -> Fund | None:
        return self.funds.get(fund_id)

    def get_all_funds(self) -> list[Fund]:
        return list(self.funds.values())

    # ─── Global: Signals & Analyses ─────────────────────────

    def add_signal(self, signal: SocialSignal):
        self.signals.append(signal)

    def add_analysis(self, analysis: ChatterAnalysis):
        self.analyses.append(analysis)

    def get_recent_signals(self, limit: int = 50) -> list[SocialSignal]:
        return sorted(self.signals, key=lambda s: s.timestamp, reverse=True)[:limit]

    def get_recent_analyses(self, limit: int = 50) -> list[ChatterAnalysis]:
        return sorted(self.analyses, key=lambda a: a.timestamp, reverse=True)[:limit]

    # ─── Fund-Scoped: Trade Proposals ───────────────────────

    def add_trade_proposal(self, proposal: TradeProposal):
        self.trade_proposals.append(proposal)

    def get_pending_proposals(self, fund_id: str = "") -> list[TradeProposal]:
        return [
            p for p in self.trade_proposals
            if p.status.value == "proposed"
            and (not fund_id or p.fund_id == fund_id)
        ]

    # ─── Fund-Scoped: Positions ─────────────────────────────

    def get_positions(self, fund_id: str = "") -> list[Position]:
        if not fund_id:
            return self.positions
        return [p for p in self.positions if p.fund_id == fund_id]

    # ─── Fund-Scoped: Strategies ────────────────────────────

    def add_strategy(self, strategy: Strategy):
        self.strategies.append(strategy)

    def get_active_strategies(self, fund_id: str = "") -> list[Strategy]:
        return [
            s for s in self.strategies
            if s.is_active
            and (not fund_id or s.fund_id == fund_id)
        ]

    def get_strategies(self, fund_id: str = "") -> list[Strategy]:
        if not fund_id:
            return self.strategies
        return [s for s in self.strategies if s.fund_id == fund_id]

    # ─── Fund-Scoped: Backtest Results ──────────────────────

    def add_backtest_result(self, result: BacktestResult):
        self.backtest_results.append(result)

    # ─── Fund-Scoped: Portfolio Snapshots ───────────────────

    def add_portfolio_snapshot(self, snapshot: PortfolioSnapshot):
        self.portfolio_snapshots.append(snapshot)

    def get_latest_portfolio_snapshot(self, fund_id: str = "") -> PortfolioSnapshot | None:
        filtered = [
            s for s in self.portfolio_snapshots
            if not fund_id or s.fund_id == fund_id
        ]
        if not filtered:
            return None
        return max(filtered, key=lambda s: s.timestamp)

    # ─── Fund-Scoped: Risk Snapshots ────────────────────────

    def add_risk_snapshot(self, snapshot: RiskSnapshot):
        self.risk_snapshots.append(snapshot)

    def get_latest_risk_snapshot(self, fund_id: str = "") -> RiskSnapshot | None:
        filtered = [
            s for s in self.risk_snapshots
            if not fund_id or s.fund_id == fund_id
        ]
        if not filtered:
            return None
        return max(filtered, key=lambda s: s.timestamp)


# Global store instance
store = DataStore()
