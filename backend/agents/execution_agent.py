"""
AI Hedge Funding — Execution Agent
Role: Handles order routing, position sizing, entry and exit.
Edge: 50ms reaction on spike detection → immediate exit. Zero emotion.
"""

import logging
from datetime import datetime

from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentRole, TradeProposal, TradeAction, TradeStatus,
    ChatterAnalysis, Position
)
from backend.config import settings, ExecutionMode

logger = logging.getLogger(__name__)


class ExecutionAgent(BaseAgent):
    """
    Handles all trade execution.
    Phase 1: Proposes trades → waits for human approval.
    Phase 2: Executes autonomously with daily-loss kill switch.
    Phase 3: 100% autonomous, no human in the loop.
    """

    def __init__(self):
        super().__init__(AgentRole.EXECUTION_AGENT)
        self.pending_proposals: list[TradeProposal] = []
        self.approved_trades: list[TradeProposal] = []
        self.executed_trades: list[TradeProposal] = []
        self.positions: list[Position] = []
        self.broker = None  # Set by broker integration

    def create_proposal(
        self,
        analysis: ChatterAnalysis,
        strategy_id: str,
        portfolio_value: float,
    ) -> TradeProposal:
        """Create a trade proposal from an analysis."""
        # Position sizing based on confidence and portfolio value
        max_position = portfolio_value * settings.MAX_POSITION_SIZE_PCT
        position_value = max_position * analysis.confidence
        price_estimate = 100.0  # Will be replaced with live price from broker
        quantity = max(1, int(position_value / price_estimate))

        proposal = TradeProposal(
            ticker=analysis.ticker,
            action=analysis.recommended_action,
            quantity=quantity,
            strategy_id=strategy_id,
            signal_id=analysis.signal_id,
            analysis_id=analysis.id,
            confidence=analysis.confidence,
        )

        # In supervised mode, proposals await human approval
        if settings.EXECUTION_MODE == ExecutionMode.SUPERVISED:
            proposal.status = TradeStatus.PROPOSED
            self.pending_proposals.append(proposal)
            logger.info(
                f"Trade PROPOSED (awaiting approval): "
                f"{proposal.action.value} {proposal.quantity} {proposal.ticker}"
            )
        else:
            # Semi-autonomous or fully autonomous — auto-approve
            proposal.status = TradeStatus.APPROVED
            proposal.approved_at = datetime.utcnow()
            self.approved_trades.append(proposal)
            logger.info(
                f"Trade AUTO-APPROVED: "
                f"{proposal.action.value} {proposal.quantity} {proposal.ticker}"
            )

        return proposal

    def approve_trade(self, proposal_id: str) -> TradeProposal | None:
        """Owner approves a trade proposal (Phase 1)."""
        for p in self.pending_proposals:
            if p.id == proposal_id:
                p.status = TradeStatus.APPROVED
                p.approved_at = datetime.utcnow()
                self.pending_proposals.remove(p)
                self.approved_trades.append(p)
                logger.info(f"Trade APPROVED by owner: {p.action.value} {p.quantity} {p.ticker}")
                return p
        return None

    def reject_trade(self, proposal_id: str) -> TradeProposal | None:
        """Owner rejects a trade proposal."""
        for p in self.pending_proposals:
            if p.id == proposal_id:
                p.status = TradeStatus.REJECTED
                self.pending_proposals.remove(p)
                logger.info(f"Trade REJECTED: {p.action.value} {p.quantity} {p.ticker}")
                return p
        return None

    async def execute_trade(self, proposal: TradeProposal) -> TradeProposal:
        """Execute an approved trade via broker."""
        proposal.status = TradeStatus.EXECUTING

        try:
            if self.broker:
                # Execute via broker integration (Alpaca or IB)
                fill = await self.broker.submit_order(
                    ticker=proposal.ticker,
                    quantity=proposal.quantity,
                    side=proposal.action.value,
                )
                proposal.fill_price = fill.get("price", 0)
            else:
                # Paper mode — simulate fill
                proposal.fill_price = proposal.price or 100.0
                logger.warning("No broker connected — simulating fill")

            proposal.status = TradeStatus.FILLED
            proposal.executed_at = datetime.utcnow()
            self.executed_trades.append(proposal)

            # Create/update position
            if proposal.action in (TradeAction.BUY,):
                position = Position(
                    ticker=proposal.ticker,
                    quantity=proposal.quantity,
                    entry_price=proposal.fill_price,
                    current_price=proposal.fill_price,
                    unrealized_pnl=0.0,
                    strategy_id=proposal.strategy_id,
                )
                self.positions.append(position)

            logger.info(
                f"Trade FILLED: {proposal.action.value} {proposal.quantity} "
                f"{proposal.ticker} @ ${proposal.fill_price:.2f}"
            )

        except Exception as e:
            proposal.status = TradeStatus.FAILED
            logger.error(f"Trade FAILED: {e}")

        return proposal

    async def emergency_close_all(self) -> list[TradeProposal]:
        """Emergency stop — close all open positions immediately."""
        closed = []
        for pos in self.positions:
            close_proposal = TradeProposal(
                ticker=pos.ticker,
                action=TradeAction.CLOSE,
                quantity=pos.quantity,
                strategy_id=pos.strategy_id,
                signal_id="emergency",
                analysis_id="emergency",
                confidence=1.0,
                status=TradeStatus.APPROVED,
            )
            result = await self.execute_trade(close_proposal)
            closed.append(result)

        self.positions.clear()
        logger.critical("EMERGENCY STOP: All positions closed")
        return closed

    async def run_cycle(self) -> dict:
        """Execute all approved trades."""
        executed = []

        for trade in list(self.approved_trades):
            result = await self.execute_trade(trade)
            executed.append(result)
            self.approved_trades.remove(trade)

        return {
            "trades_executed": len(executed),
            "pending_proposals": len(self.pending_proposals),
            "open_positions": len(self.positions),
        }
