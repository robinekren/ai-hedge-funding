"""
AI Hedge Funding — Data Store
Phase 1: In-memory store (Airtable-compatible).
Phase 2: Migrates to Supabase.
"""

import logging
from datetime import datetime

from backend.models.schemas import (
    SocialSignal, ChatterAnalysis, TradeProposal, Position,
    Strategy, BacktestResult, PortfolioSnapshot, RiskSnapshot,
    AgentState
)

logger = logging.getLogger(__name__)


class DataStore:
    """
    Central data store for the system.
    Phase 1: In-memory with Airtable persistence.
    Phase 2: Supabase migration.
    """

    def __init__(self):
        self.signals: list[SocialSignal] = []
        self.analyses: list[ChatterAnalysis] = []
        self.trade_proposals: list[TradeProposal] = []
        self.positions: list[Position] = []
        self.strategies: list[Strategy] = []
        self.backtest_results: list[BacktestResult] = []
        self.portfolio_snapshots: list[PortfolioSnapshot] = []
        self.risk_snapshots: list[RiskSnapshot] = []
        self.agent_states: list[AgentState] = []

    def add_signal(self, signal: SocialSignal):
        self.signals.append(signal)

    def add_analysis(self, analysis: ChatterAnalysis):
        self.analyses.append(analysis)

    def add_trade_proposal(self, proposal: TradeProposal):
        self.trade_proposals.append(proposal)

    def add_strategy(self, strategy: Strategy):
        self.strategies.append(strategy)

    def add_backtest_result(self, result: BacktestResult):
        self.backtest_results.append(result)

    def add_portfolio_snapshot(self, snapshot: PortfolioSnapshot):
        self.portfolio_snapshots.append(snapshot)

    def add_risk_snapshot(self, snapshot: RiskSnapshot):
        self.risk_snapshots.append(snapshot)

    def get_recent_signals(self, limit: int = 50) -> list[SocialSignal]:
        return sorted(self.signals, key=lambda s: s.timestamp, reverse=True)[:limit]

    def get_recent_analyses(self, limit: int = 50) -> list[ChatterAnalysis]:
        return sorted(self.analyses, key=lambda a: a.timestamp, reverse=True)[:limit]

    def get_pending_proposals(self) -> list[TradeProposal]:
        return [p for p in self.trade_proposals if p.status.value == "proposed"]

    def get_active_strategies(self) -> list[Strategy]:
        return [s for s in self.strategies if s.is_active]

    def get_latest_portfolio_snapshot(self) -> PortfolioSnapshot | None:
        if not self.portfolio_snapshots:
            return None
        return max(self.portfolio_snapshots, key=lambda s: s.timestamp)

    def get_latest_risk_snapshot(self) -> RiskSnapshot | None:
        if not self.risk_snapshots:
            return None
        return max(self.risk_snapshots, key=lambda s: s.timestamp)


# Global store instance
store = DataStore()
