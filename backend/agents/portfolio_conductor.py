"""
AI Hedge Funding — Portfolio Conductor Agent
Role: Dynamically allocates capital across all live strategies.
Edge: No static allocation. Capital flows to what performs, daily.
"""

import logging
from datetime import datetime

from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentRole, Strategy, PortfolioSnapshot
)

logger = logging.getLogger(__name__)


class PortfolioConductor(BaseAgent):
    """
    Dynamic capital allocation across strategies.
    Capital flows to what performs. Under-performers get capital reduced.
    Rebalances daily based on Sharpe ratio and win rate.
    """

    def __init__(self):
        super().__init__(AgentRole.PORTFOLIO_CONDUCTOR)
        self.strategies: list[Strategy] = []
        self.total_capital: float = 0.0
        self.cash: float = 0.0
        self.snapshots: list[PortfolioSnapshot] = []

    def set_strategies(self, strategies: list[Strategy]):
        """Receive active strategies from strategy engine."""
        self.strategies = [s for s in strategies if s.is_active]

    def allocate_capital(self, total_capital: float) -> dict[str, float]:
        """
        Dynamic capital allocation based on strategy performance.
        Higher Sharpe + higher win rate = more capital.
        """
        self.total_capital = total_capital
        allocations: dict[str, float] = {}

        if not self.strategies:
            self.cash = total_capital
            return allocations

        # Score each strategy by Sharpe * win_rate
        scores = {}
        total_score = 0.0
        for s in self.strategies:
            score = max(s.sharpe_ratio, 0.1) * max(s.win_rate, 0.1)
            scores[s.id] = score
            total_score += score

        if total_score == 0:
            total_score = 1.0

        # Allocate proportionally to score
        invested = 0.0
        for s in self.strategies:
            pct = scores[s.id] / total_score
            allocation = total_capital * pct * 0.95  # Keep 5% cash reserve
            allocations[s.id] = allocation
            s.capital_allocated = allocation
            invested += allocation

        self.cash = total_capital - invested

        logger.info(
            f"Portfolio Conductor: allocated ${invested:,.2f} across "
            f"{len(self.strategies)} strategies. Cash: ${self.cash:,.2f}"
        )

        return allocations

    def get_snapshot(
        self,
        daily_pnl: float = 0.0,
        win_rate_today: float = 0.0,
    ) -> PortfolioSnapshot:
        """Generate portfolio snapshot."""
        invested = self.total_capital - self.cash
        total_return = 0.0
        if self.total_capital > 0:
            total_return = sum(s.total_return for s in self.strategies) / max(len(self.strategies), 1)

        snapshot = PortfolioSnapshot(
            total_value=self.total_capital,
            cash=self.cash,
            invested=invested,
            total_return_pct=total_return * 100,
            daily_pnl=daily_pnl,
            win_rate_today=win_rate_today,
            aum=self.total_capital,
            positions_count=sum(1 for s in self.strategies if s.capital_allocated > 0),
            strategies_active=len(self.strategies),
        )

        self.snapshots.append(snapshot)
        return snapshot

    async def run_cycle(self) -> dict:
        """Rebalance capital allocation."""
        allocations = self.allocate_capital(self.total_capital)

        return {
            "strategies_allocated": len(allocations),
            "total_invested": sum(allocations.values()),
            "cash_reserve": self.cash,
        }
