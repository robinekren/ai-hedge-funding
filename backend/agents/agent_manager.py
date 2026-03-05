"""
AI Hedge Funding — Agent Manager
Orchestrates all 8 AI agents and manages the autonomy protocol.
"""

import asyncio
import logging
from datetime import datetime

from backend.agents.base_agent import BaseAgent
from backend.agents.signal_harvester import SignalHarvester
from backend.agents.chatter_analyst import ChatterAnalyst
from backend.agents.strategy_engine import StrategyEngine
from backend.agents.execution_agent import ExecutionAgent
from backend.agents.risk_sentinel import RiskSentinel
from backend.agents.portfolio_conductor import PortfolioConductor
from backend.agents.meta_learner import MetaLearner
from backend.agents.compliance_capital import ComplianceCapital
from backend.models.schemas import (
    AgentRole, AgentStatus, AgentState, DashboardMetrics
)
from backend.config import settings, Phase, ExecutionMode, MetaLearnerMode

logger = logging.getLogger(__name__)


class AgentManager:
    """
    Central orchestrator for all 8 AI agents.
    Manages lifecycle, inter-agent communication, and autonomy protocol.
    """

    def __init__(self):
        self.signal_harvester = SignalHarvester()
        self.chatter_analyst = ChatterAnalyst()
        self.strategy_engine = StrategyEngine()
        self.execution_agent = ExecutionAgent()
        self.risk_sentinel = RiskSentinel()
        self.portfolio_conductor = PortfolioConductor()
        self.meta_learner = MetaLearner()
        self.compliance_capital = ComplianceCapital()

        self._agents: dict[AgentRole, BaseAgent] = {
            AgentRole.SIGNAL_HARVESTER: self.signal_harvester,
            AgentRole.CHATTER_ANALYST: self.chatter_analyst,
            AgentRole.STRATEGY_ENGINE: self.strategy_engine,
            AgentRole.EXECUTION_AGENT: self.execution_agent,
            AgentRole.RISK_SENTINEL: self.risk_sentinel,
            AgentRole.PORTFOLIO_CONDUCTOR: self.portfolio_conductor,
            AgentRole.META_LEARNER: self.meta_learner,
            AgentRole.COMPLIANCE_CAPITAL: self.compliance_capital,
        }

        self.portfolio_value: float = 100000.0  # Starting capital
        self.emergency_stopped: bool = False

    # ─── Agent Lifecycle ─────────────────────────────────

    def start_all(self):
        """Start all 8 agents."""
        for agent in self._agents.values():
            agent.start()
        logger.info("All 8 agents started")

    def stop_all(self):
        """Stop all agents."""
        for agent in self._agents.values():
            agent.stop()
        logger.info("All agents stopped")

    def pause_agent(self, role: AgentRole):
        """Pause a specific agent without stopping others."""
        agent = self._agents.get(role)
        if agent:
            agent.pause()

    def start_agent(self, role: AgentRole):
        """Restart a paused agent."""
        agent = self._agents.get(role)
        if agent:
            agent.start()

    def get_all_states(self) -> list[AgentState]:
        """Get status of all 8 agents."""
        return [agent.get_state() for agent in self._agents.values()]

    # ─── Phase Transition ────────────────────────────────

    def transition_phase(self, target_phase: Phase) -> bool:
        """
        Manually transition to next phase (requires owner approval).
        Phase 1 → 2: Supervised → Semi-Autonomous
        Phase 2 → 3: Semi-Autonomous → Fully Autonomous
        """
        current = settings.CURRENT_PHASE

        if target_phase == Phase.PHASE_2 and current == Phase.PHASE_1:
            settings.CURRENT_PHASE = Phase.PHASE_2
            settings.EXECUTION_MODE = ExecutionMode.SEMI_AUTONOMOUS
            settings.META_LEARNER_MODE = MetaLearnerMode.AUTONOMOUS
            logger.info("PHASE TRANSITION: Phase 1 → Phase 2 (Semi-Autonomous)")
            return True

        elif target_phase == Phase.PHASE_3 and current == Phase.PHASE_2:
            settings.CURRENT_PHASE = Phase.PHASE_3
            settings.EXECUTION_MODE = ExecutionMode.FULLY_AUTONOMOUS
            logger.info("PHASE TRANSITION: Phase 2 → Phase 3 (Fully Autonomous)")
            return True

        logger.warning(f"Invalid phase transition: {current} → {target_phase}")
        return False

    # ─── Daily Loss Limit ────────────────────────────────

    def set_daily_loss_limit(self, limit: float):
        """Adjust the kill-switch threshold in real-time."""
        settings.DAILY_LOSS_LIMIT = limit
        logger.info(f"Daily loss limit updated to ${limit:,.2f}")

    # ─── Emergency Stop ──────────────────────────────────

    async def emergency_stop(self) -> dict:
        """
        Immediately close all open trades and halt all execution.
        This is the nuclear button.
        """
        self.emergency_stopped = True
        settings.EMERGENCY_STOP = True

        # Close all positions
        closed = await self.execution_agent.emergency_close_all()

        # Pause all agents
        for agent in self._agents.values():
            agent.pause()

        logger.critical(
            f"EMERGENCY STOP ACTIVATED: {len(closed)} positions closed, "
            f"all agents paused"
        )

        return {
            "positions_closed": len(closed),
            "agents_paused": len(self._agents),
        }

    # ─── Dashboard Metrics ───────────────────────────────

    def get_dashboard_metrics(self) -> DashboardMetrics:
        """Get the 5 Trillionaire Metrics for the top bar."""
        snapshot = self.portfolio_conductor.get_snapshot(
            daily_pnl=self.risk_sentinel.daily_pnl,
        )

        # System status: green if all agents running, red if any error
        all_running = all(
            a.state.status in (AgentStatus.RUNNING, AgentStatus.PAUSED)
            for a in self._agents.values()
        )
        system_status = "green" if all_running and not self.emergency_stopped else "red"

        return DashboardMetrics(
            total_return_pct=snapshot.total_return_pct,
            aum=snapshot.aum,
            win_rate_today=snapshot.win_rate_today,
            system_status=system_status,
            daily_pnl=snapshot.daily_pnl,
        )

    # ─── Main Orchestration Cycle ────────────────────────

    async def run_orchestration_cycle(self) -> dict:
        """
        One full cycle of the AI hedge fund:
        1. Signal Harvester scrapes social media
        2. Chatter Analyst processes signals
        3. Strategy Engine evaluates strategies
        4. Execution Agent proposes/executes trades
        5. Risk Sentinel monitors risk
        6. Portfolio Conductor rebalances
        7. Meta Learner improves system
        8. Compliance handles reporting
        """
        if self.emergency_stopped:
            return {"status": "emergency_stopped"}

        results = {}

        # 1. Harvest signals
        harvest_result = await self.signal_harvester.run_cycle()
        results["signal_harvester"] = harvest_result

        # 2. Analyze signals
        for signal in harvest_result.get("signals", []):
            self.chatter_analyst.queue_signal(signal)
        analysis_result = await self.chatter_analyst.run_cycle()
        results["chatter_analyst"] = analysis_result

        # 3. Run strategy engine
        strategy_result = await self.strategy_engine.run_cycle()
        results["strategy_engine"] = strategy_result

        # 4. Create trade proposals from analyses
        for analysis in analysis_result.get("analyses", []):
            if analysis.confidence > 0.7:
                strategies = self.strategy_engine.get_top_strategies(1)
                strategy_id = strategies[0].id if strategies else "default"
                self.execution_agent.create_proposal(
                    analysis=analysis,
                    strategy_id=strategy_id,
                    portfolio_value=self.portfolio_value,
                )

        # 5. Execute approved trades
        exec_result = await self.execution_agent.run_cycle()
        results["execution_agent"] = exec_result

        # 6. Monitor risk
        self.risk_sentinel.update_positions(self.execution_agent.positions)
        risk_result = await self.risk_sentinel.run_cycle()
        results["risk_sentinel"] = risk_result

        # Check kill switch
        if risk_result.get("kill_switch_triggered"):
            await self.emergency_stop()
            results["emergency_stop"] = True

        # 7. Rebalance portfolio
        self.portfolio_conductor.set_strategies(self.strategy_engine.strategies)
        self.portfolio_conductor.total_capital = self.portfolio_value
        portfolio_result = await self.portfolio_conductor.run_cycle()
        results["portfolio_conductor"] = portfolio_result

        # 8. Meta learner
        self.meta_learner.set_strategies(self.strategy_engine.strategies)
        meta_result = await self.meta_learner.run_cycle()
        results["meta_learner"] = meta_result

        # 9. Compliance
        compliance_result = await self.compliance_capital.run_cycle()
        results["compliance_capital"] = compliance_result

        return results
