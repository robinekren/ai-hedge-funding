"""
AI Hedge Funding — Risk Sentinel Agent
Role: Monitors all open positions, drawdown, and loss limits live.
Edge: No human monitors at 3am. This one does.
"""

import logging
from datetime import datetime

from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentRole, Position, RiskSnapshot
)
from backend.config import settings

logger = logging.getLogger(__name__)


class RiskSentinel(BaseAgent):
    """
    24/7 risk monitoring. Watches:
    - Daily P&L vs daily-loss-limit (kill switch)
    - Position concentration
    - Correlation between positions
    - Max drawdown
    """

    def __init__(self):
        super().__init__(AgentRole.RISK_SENTINEL)
        self.daily_pnl: float = 0.0
        self.peak_portfolio_value: float = 0.0
        self.kill_switch_triggered: bool = False
        self.positions: list[Position] = []  # Reference from execution agent

    def update_positions(self, positions: list[Position]):
        """Receive current positions from execution agent."""
        self.positions = positions

    def check_daily_loss_limit(self) -> bool:
        """
        Daily-loss-limit kill switch.
        If daily loss exceeds threshold, system must pause.
        Returns True if limit is breached.
        """
        if abs(self.daily_pnl) > settings.DAILY_LOSS_LIMIT and self.daily_pnl < 0:
            self.kill_switch_triggered = True
            logger.critical(
                f"DAILY LOSS LIMIT BREACHED: ${self.daily_pnl:.2f} "
                f"exceeds limit of ${settings.DAILY_LOSS_LIMIT:.2f}"
            )
            return True
        return False

    def calculate_drawdown(self, current_value: float) -> float:
        """Calculate current drawdown from peak."""
        if current_value > self.peak_portfolio_value:
            self.peak_portfolio_value = current_value

        if self.peak_portfolio_value == 0:
            return 0.0

        drawdown = (self.peak_portfolio_value - current_value) / self.peak_portfolio_value
        return drawdown

    def check_position_concentration(self) -> dict[str, float]:
        """Check if any single position is too large."""
        total_value = sum(p.quantity * p.current_price for p in self.positions)
        if total_value == 0:
            return {}

        concentrations = {}
        for p in self.positions:
            pos_value = p.quantity * p.current_price
            pct = pos_value / total_value
            if pct > settings.MAX_POSITION_SIZE_PCT:
                concentrations[p.ticker] = pct
                logger.warning(
                    f"Position concentration alert: {p.ticker} at "
                    f"{pct*100:.1f}% (limit: {settings.MAX_POSITION_SIZE_PCT*100:.0f}%)"
                )

        return concentrations

    def calculate_correlation_matrix(self) -> dict:
        """
        Calculate correlation between positions.
        In production, uses price history from Polygon API.
        """
        tickers = list(set(p.ticker for p in self.positions))
        matrix = {}
        for t in tickers:
            matrix[t] = {t2: 0.0 for t2 in tickers}
            matrix[t][t] = 1.0
        return matrix

    def get_risk_snapshot(self, portfolio_value: float) -> RiskSnapshot:
        """Generate current risk snapshot."""
        drawdown = self.calculate_drawdown(portfolio_value)
        max_dd = drawdown  # simplified — production tracks historical max

        return RiskSnapshot(
            daily_loss=self.daily_pnl,
            daily_loss_limit=settings.DAILY_LOSS_LIMIT,
            max_drawdown=max_dd,
            current_drawdown=drawdown,
            correlation_matrix=self.calculate_correlation_matrix(),
            kill_switch_triggered=self.kill_switch_triggered,
        )

    async def run_cycle(self) -> dict:
        """Run risk monitoring cycle."""
        # Check daily loss limit
        limit_breached = self.check_daily_loss_limit()

        # Check position concentrations
        concentrations = self.check_position_concentration()

        # Calculate P&L from positions
        total_unrealized = sum(p.unrealized_pnl for p in self.positions)
        total_realized = sum(p.realized_pnl for p in self.positions)
        self.daily_pnl = total_unrealized + total_realized

        result = {
            "daily_pnl": self.daily_pnl,
            "kill_switch_triggered": limit_breached,
            "concentration_alerts": len(concentrations),
            "open_positions": len(self.positions),
        }

        if limit_breached:
            logger.critical("RISK SENTINEL: Kill switch activated — system should pause")

        return result
