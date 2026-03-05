"""
AI Hedge Funding — Strategy Engine Agent
Role: Auto-backtests new strategy variations continuously.
Edge: Generates thousands of strategy variations autonomously.
Phase 1 target: 100+ strategies. Phase 2 target: 315+.
"""

import logging
from datetime import datetime
from uuid import uuid4

from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentRole, Strategy, BacktestResult, AssetClass
)
from backend.config import settings

logger = logging.getLogger(__name__)

# Strategy parameter ranges for variation generation
PARAMETER_RANGES = {
    "lookback_days": [7, 14, 21, 30, 60, 90],
    "spike_threshold": [2.0, 3.0, 5.0, 7.0, 10.0],
    "steady_threshold": [1.1, 1.3, 1.5, 2.0],
    "min_mentions": [5, 10, 20, 50, 100],
    "position_size_pct": [0.01, 0.02, 0.03, 0.05],
    "stop_loss_pct": [0.02, 0.03, 0.05, 0.07, 0.10],
    "take_profit_pct": [0.05, 0.10, 0.15, 0.20, 0.30],
    "hold_days_max": [1, 3, 5, 10, 20],
}


class StrategyEngine(BaseAgent):
    """
    Generates, backtests, and evaluates strategy variations autonomously.
    Target: 100+ strategies in Phase 1, 315+ in Phase 2.
    """

    def __init__(self):
        super().__init__(AgentRole.STRATEGY_ENGINE)
        self.strategies: list[Strategy] = []
        self.backtest_results: list[BacktestResult] = []
        self._variation_counter = 0

    def generate_variation(self) -> Strategy:
        """Generate a new strategy variation by combining parameters."""
        import random

        params = {}
        for key, values in PARAMETER_RANGES.items():
            params[key] = random.choice(values)

        self._variation_counter += 1
        strategy = Strategy(
            name=f"SentimentArb_v{self._variation_counter}",
            description=(
                f"Social sentiment arbitrage strategy. "
                f"Lookback: {params['lookback_days']}d, "
                f"Spike threshold: {params['spike_threshold']}x, "
                f"Stop loss: {params['stop_loss_pct']*100:.0f}%"
            ),
            asset_class=AssetClass.US_EQUITIES,
            parameters=params,
        )
        return strategy

    async def backtest_strategy(self, strategy: Strategy) -> BacktestResult:
        """
        Run backtest for a strategy variation.
        In production, this connects to historical data via Polygon API.
        """
        import random

        # Simulated backtest — production version uses Polygon historical data
        total_trades = random.randint(50, 500)
        win_rate = random.uniform(0.45, 0.95)
        winning = int(total_trades * win_rate)
        losing = total_trades - winning

        result = BacktestResult(
            strategy_id=strategy.id,
            start_date="2023-01-01",
            end_date="2025-12-31",
            total_return=random.uniform(-0.3, 3.0),
            sharpe_ratio=random.uniform(-0.5, 4.0),
            max_drawdown=random.uniform(0.02, 0.4),
            win_rate=win_rate,
            total_trades=total_trades,
            winning_trades=winning,
            losing_trades=losing,
        )

        # Update strategy metrics from backtest
        strategy.win_rate = win_rate
        strategy.total_return = result.total_return
        strategy.sharpe_ratio = result.sharpe_ratio
        strategy.total_trades = total_trades
        strategy.winning_trades = winning

        return result

    def get_top_strategies(self, n: int = 10) -> list[Strategy]:
        """Return top N strategies by Sharpe ratio."""
        return sorted(
            self.strategies,
            key=lambda s: s.sharpe_ratio,
            reverse=True,
        )[:n]

    async def run_cycle(self) -> dict:
        """Generate and backtest a batch of new strategy variations."""
        batch_size = 5
        new_strategies = []
        new_results = []

        for _ in range(batch_size):
            strategy = self.generate_variation()
            result = await self.backtest_strategy(strategy)

            # Only keep strategies that meet minimum quality bar
            if result.sharpe_ratio > 1.0 and result.win_rate > 0.55:
                strategy.is_active = True
                new_strategies.append(strategy)
                new_results.append(result)
                self.strategies.append(strategy)
                self.backtest_results.append(result)

        logger.info(
            f"Strategy Engine: generated {batch_size} variations, "
            f"{len(new_strategies)} passed quality filter. "
            f"Total strategies: {len(self.strategies)}"
        )

        return {
            "variations_generated": batch_size,
            "strategies_passed": len(new_strategies),
            "total_strategies": len(self.strategies),
            "target": settings.PHASE_1_STRATEGY_TARGET,
        }
