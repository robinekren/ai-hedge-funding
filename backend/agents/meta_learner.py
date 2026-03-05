"""
AI Hedge Funding — Meta Learner Agent
Role: Identifies dying strategies, weakening signals, new patterns.
Edge: The system becomes smarter every month without human input.

Autonomy:
  Phase 1 — Supervised: Proposes new backtest variations. Robin approves.
  Phase 2 — Autonomous: After N consecutive successful deployments, auto-deploys.
"""

import logging
from datetime import datetime

from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentRole, Strategy, BacktestResult
)
from backend.config import settings, MetaLearnerMode

logger = logging.getLogger(__name__)

# Number of consecutive successes needed before autonomous deployment
AUTONOMOUS_DEPLOYMENT_THRESHOLD = 10


class MetaLearner(BaseAgent):
    """
    Self-improving system intelligence.
    Identifies dying strategies, discovers new patterns,
    and suggests/deploys new strategy variations.
    """

    def __init__(self):
        super().__init__(AgentRole.META_LEARNER)
        self.strategies: list[Strategy] = []
        self.proposed_deployments: list[Strategy] = []
        self.consecutive_successes: int = 0
        self.total_deployments: int = 0

    def set_strategies(self, strategies: list[Strategy]):
        """Receive current strategy list."""
        self.strategies = strategies

    def identify_dying_strategies(self) -> list[Strategy]:
        """Identify strategies with declining performance."""
        dying = []
        for s in self.strategies:
            if s.is_active and s.total_trades > 20:
                # Strategy is dying if Sharpe < 0.5 or win rate < 50%
                if s.sharpe_ratio < 0.5 or s.win_rate < 0.5:
                    dying.append(s)
                    logger.info(
                        f"Meta Learner: Strategy {s.name} identified as dying "
                        f"(Sharpe: {s.sharpe_ratio:.2f}, WR: {s.win_rate:.1%})"
                    )
        return dying

    def propose_improvement(self, dying_strategy: Strategy) -> Strategy:
        """Generate an improved variation of a dying strategy."""
        import random

        new_params = dict(dying_strategy.parameters)

        # Mutate parameters slightly
        if "spike_threshold" in new_params:
            new_params["spike_threshold"] *= random.uniform(0.8, 1.2)
        if "lookback_days" in new_params:
            new_params["lookback_days"] = max(
                7, int(new_params["lookback_days"] * random.uniform(0.7, 1.3))
            )
        if "stop_loss_pct" in new_params:
            new_params["stop_loss_pct"] *= random.uniform(0.8, 1.2)

        improved = Strategy(
            name=f"{dying_strategy.name}_evolved",
            description=f"Evolved from {dying_strategy.name} by Meta Learner",
            asset_class=dying_strategy.asset_class,
            parameters=new_params,
        )

        return improved

    def should_auto_deploy(self) -> bool:
        """Check if Meta Learner has earned autonomous deployment rights."""
        if settings.META_LEARNER_MODE == MetaLearnerMode.AUTONOMOUS:
            return self.consecutive_successes >= AUTONOMOUS_DEPLOYMENT_THRESHOLD
        return False

    def deploy_strategy(self, strategy: Strategy, approved: bool = False) -> bool:
        """
        Deploy a new strategy.
        Phase 1: Must be approved by owner (Robin).
        Phase 2: Auto-deploys after proven track record.
        """
        if settings.META_LEARNER_MODE == MetaLearnerMode.SUPERVISED and not approved:
            self.proposed_deployments.append(strategy)
            logger.info(
                f"Meta Learner: Strategy {strategy.name} proposed for deployment "
                f"(awaiting owner approval)"
            )
            return False

        if settings.META_LEARNER_MODE == MetaLearnerMode.AUTONOMOUS or approved:
            strategy.is_active = True
            self.strategies.append(strategy)
            self.total_deployments += 1
            logger.info(f"Meta Learner: Strategy {strategy.name} DEPLOYED to live portfolio")
            return True

        return False

    def record_deployment_result(self, success: bool):
        """Track deployment success for autonomy escalation."""
        if success:
            self.consecutive_successes += 1
        else:
            self.consecutive_successes = 0

        logger.info(
            f"Meta Learner: Consecutive successes: {self.consecutive_successes}/"
            f"{AUTONOMOUS_DEPLOYMENT_THRESHOLD}"
        )

    async def run_cycle(self) -> dict:
        """Run meta-learning cycle."""
        dying = self.identify_dying_strategies()
        proposed = []

        for d in dying:
            improved = self.propose_improvement(d)
            proposed.append(improved)

            if self.should_auto_deploy():
                self.deploy_strategy(improved, approved=True)
            else:
                self.deploy_strategy(improved, approved=False)

        # Deactivate dying strategies
        for d in dying:
            d.is_active = False

        return {
            "dying_strategies": len(dying),
            "improvements_proposed": len(proposed),
            "auto_deploy_ready": self.should_auto_deploy(),
            "consecutive_successes": self.consecutive_successes,
            "pending_approvals": len(self.proposed_deployments),
        }
