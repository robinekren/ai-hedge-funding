"""
AI Hedge Funding — Compliance & Capital Agent
Role: LP reporting, regulatory compliance, tax optimization globally.
Edge: Scales from $100k to $100M with zero additional overhead.
"""

import logging
from datetime import datetime

from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentRole, InvestorPortfolioView, PortfolioSnapshot
)

logger = logging.getLogger(__name__)


class ComplianceCapital(BaseAgent):
    """
    Handles:
    - LP investor reporting (Phase 2)
    - Regulatory compliance
    - Tax optimization
    - Capital structure management
    - Wyoming LLC → LP structure transition
    """

    def __init__(self):
        super().__init__(AgentRole.COMPLIANCE_CAPITAL)
        self.investors: list[dict] = []  # {name, capital, join_date}
        self.monthly_returns: list[float] = []
        self.total_fund_return: float = 0.0
        self.aum: float = 0.0

    def add_investor(self, name: str, capital: float):
        """Add LP investor (Phase 2)."""
        self.investors.append({
            "name": name,
            "capital": capital,
            "join_date": datetime.utcnow().isoformat(),
        })
        self.aum += capital
        logger.info(f"New investor added: {name}, capital: ${capital:,.2f}")

    def record_monthly_return(self, return_pct: float):
        """Record monthly performance for LP reporting."""
        self.monthly_returns.append(return_pct)

    def generate_investor_report(self) -> InvestorPortfolioView:
        """
        Generate read-only investor portal data.
        Shows: total fund return, capital deployed, monthly performance.
        """
        return InvestorPortfolioView(
            total_fund_return=self.total_fund_return,
            capital_deployed=self.aum,
            monthly_performance=self.monthly_returns[-12:],  # Last 12 months
        )

    def calculate_fees(self, profit: float) -> dict:
        """
        Cohen Model fee calculation:
        50% carry (performance fee) + 3% management fee.
        """
        management_fee = self.aum * 0.03  # 3% of AUM
        carry = max(0, profit * 0.50)      # 50% of profits

        return {
            "management_fee": management_fee,
            "carry": carry,
            "total_fees": management_fee + carry,
            "net_to_investors": profit - carry,
        }

    async def run_cycle(self) -> dict:
        """Run compliance cycle."""
        report = self.generate_investor_report()

        return {
            "aum": self.aum,
            "total_return": self.total_fund_return,
            "investors": len(self.investors),
            "months_reported": len(self.monthly_returns),
        }
