"""
AI Hedge Funding — Three-Phase Autonomy Protocol

The system earns its autonomy through proven performance.
No role operates at full autonomy from day one.

Phase 1 — Supervised:
  Execution: AI proposes → Robin approves → Execution
  Meta Learner: Proposes backtest variations → Robin approves

Phase 2 — Semi-Autonomous:
  Execution: AI executes autonomously. Daily-Loss-Limit kill switch.
  Meta Learner: Auto-deploys after N consecutive successes.

Phase 3 — Fully Autonomous:
  Execution: 100% autonomous. No human in the loop.
  Meta Learner: Full autonomous operation.
"""

import logging
from datetime import datetime

from backend.config import settings, Phase, ExecutionMode, MetaLearnerMode

logger = logging.getLogger(__name__)


class AutonomyProtocol:
    """
    Manages the trust escalation protocol.
    Mirrors onboarding an exceptional employee:
    supervised first, autonomous after consistent proven results.
    """

    def __init__(self):
        self.phase_history: list[dict] = []
        self.escalation_metrics: dict = {
            "consecutive_profitable_days": 0,
            "total_trades_executed": 0,
            "win_rate_30d": 0.0,
            "max_drawdown_30d": 0.0,
            "meta_learner_successes": 0,
        }

    @property
    def current_phase(self) -> Phase:
        return settings.CURRENT_PHASE

    @property
    def execution_mode(self) -> ExecutionMode:
        return settings.EXECUTION_MODE

    @property
    def meta_learner_mode(self) -> MetaLearnerMode:
        return settings.META_LEARNER_MODE

    def get_phase_rules(self) -> dict:
        """Return current rules for execution and meta learner."""
        rules = {
            Phase.PHASE_1: {
                "execution": "AI proposes trades → Robin approves → Execution. Full human oversight.",
                "meta_learner": "Meta Learner proposes new backtest variations. Robin approves before deployment.",
                "execution_mode": ExecutionMode.SUPERVISED,
                "meta_learner_mode": MetaLearnerMode.SUPERVISED,
            },
            Phase.PHASE_2: {
                "execution": "AI executes autonomously. Daily-Loss-Limit acts as kill switch. System pauses on breach.",
                "meta_learner": "After N consecutive successful deployments, Meta Learner auto-deploys new strategies.",
                "execution_mode": ExecutionMode.SEMI_AUTONOMOUS,
                "meta_learner_mode": MetaLearnerMode.AUTONOMOUS,
            },
            Phase.PHASE_3: {
                "execution": "100% autonomous execution. No human in the loop. System manages all decisions.",
                "meta_learner": "Full autonomous operation.",
                "execution_mode": ExecutionMode.FULLY_AUTONOMOUS,
                "meta_learner_mode": MetaLearnerMode.AUTONOMOUS,
            },
        }
        return rules[self.current_phase]

    def can_escalate(self) -> tuple[bool, str]:
        """
        Check if the system has earned escalation to the next phase.
        Returns (can_escalate, reason).
        """
        metrics = self.escalation_metrics

        if self.current_phase == Phase.PHASE_1:
            # Criteria for Phase 1 → 2
            if (
                metrics["consecutive_profitable_days"] >= 30
                and metrics["win_rate_30d"] >= 0.70
                and metrics["max_drawdown_30d"] <= 0.10
                and metrics["total_trades_executed"] >= 100
            ):
                return True, "Phase 1 graduation criteria met: 30 consecutive profitable days, 70%+ win rate, <10% drawdown"
            return False, (
                f"Not ready: {metrics['consecutive_profitable_days']}/30 profitable days, "
                f"{metrics['win_rate_30d']:.0%} win rate (need 70%), "
                f"{metrics['max_drawdown_30d']:.0%} drawdown (need <10%), "
                f"{metrics['total_trades_executed']}/100 trades"
            )

        elif self.current_phase == Phase.PHASE_2:
            # Criteria for Phase 2 → 3
            if (
                metrics["consecutive_profitable_days"] >= 90
                and metrics["win_rate_30d"] >= 0.80
                and metrics["max_drawdown_30d"] <= 0.05
                and metrics["meta_learner_successes"] >= 10
            ):
                return True, "Phase 2 graduation criteria met: 90 consecutive profitable days, 80%+ win rate, <5% drawdown, 10+ ML successes"
            return False, (
                f"Not ready: {metrics['consecutive_profitable_days']}/90 profitable days, "
                f"{metrics['win_rate_30d']:.0%} win rate (need 80%), "
                f"{metrics['max_drawdown_30d']:.0%} drawdown (need <5%), "
                f"{metrics['meta_learner_successes']}/10 ML successes"
            )

        return False, "Already at Phase 3 — maximum autonomy"

    def request_escalation(self) -> dict:
        """
        Request phase escalation. Returns status for owner review.
        Phase transitions always require manual owner approval.
        """
        can_do, reason = self.can_escalate()

        if self.current_phase == Phase.PHASE_1:
            target = Phase.PHASE_2
        elif self.current_phase == Phase.PHASE_2:
            target = Phase.PHASE_3
        else:
            return {"approved": False, "reason": "Already at maximum autonomy"}

        return {
            "current_phase": self.current_phase.value,
            "target_phase": target.value,
            "eligible": can_do,
            "reason": reason,
            "requires_owner_approval": True,
        }

    def confirm_escalation(self, target_phase: Phase) -> bool:
        """Owner confirms phase transition."""
        can_do, reason = self.can_escalate()

        if not can_do:
            logger.warning(f"Escalation denied: {reason}")
            return False

        # Record history
        self.phase_history.append({
            "from": self.current_phase.value,
            "to": target_phase.value,
            "timestamp": datetime.utcnow().isoformat(),
            "reason": reason,
        })

        # Apply transition
        if target_phase == Phase.PHASE_2:
            settings.CURRENT_PHASE = Phase.PHASE_2
            settings.EXECUTION_MODE = ExecutionMode.SEMI_AUTONOMOUS
            settings.META_LEARNER_MODE = MetaLearnerMode.AUTONOMOUS
        elif target_phase == Phase.PHASE_3:
            settings.CURRENT_PHASE = Phase.PHASE_3
            settings.EXECUTION_MODE = ExecutionMode.FULLY_AUTONOMOUS

        logger.info(f"PHASE ESCALATION: → {target_phase.value}")
        return True

    def update_metrics(
        self,
        daily_profitable: bool,
        win_rate: float,
        drawdown: float,
        trades_today: int,
        ml_success: bool = False,
    ):
        """Update escalation metrics daily."""
        if daily_profitable:
            self.escalation_metrics["consecutive_profitable_days"] += 1
        else:
            self.escalation_metrics["consecutive_profitable_days"] = 0

        self.escalation_metrics["win_rate_30d"] = win_rate
        self.escalation_metrics["max_drawdown_30d"] = drawdown
        self.escalation_metrics["total_trades_executed"] += trades_today

        if ml_success:
            self.escalation_metrics["meta_learner_successes"] += 1
