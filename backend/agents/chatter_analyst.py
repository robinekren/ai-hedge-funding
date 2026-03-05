"""
AI Hedge Funding — Chatter Analyst Agent
Role: Distinguishes steady accumulation from spike peaks in real-time.
Edge: The core alpha engine. The logic no competitor has.
"""

import logging
from datetime import datetime

from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentRole, SocialSignal, SignalType, ChatterAnalysis, TradeAction
)

logger = logging.getLogger(__name__)


class ChatterAnalyst(BaseAgent):
    """
    The core alpha engine.
    Analyzes social signals to distinguish accumulation from spike peaks.
    Applies the inverted signal logic that no competitor uses.
    """

    def __init__(self):
        super().__init__(AgentRole.CHATTER_ANALYST)
        self.pending_signals: list[SocialSignal] = []
        self.analyses: list[ChatterAnalysis] = []

    def queue_signal(self, signal: SocialSignal):
        """Queue a signal for analysis."""
        self.pending_signals.append(signal)

    def analyze_signal(self, signal: SocialSignal) -> ChatterAnalysis:
        """
        Core analysis — the inverted signal logic:
        - Steady chatter → BUY (accumulation phase)
        - Spike → SELL (peak reached)
        - Mass excitement → AVOID (worst entry)
        - Cooling → HOLD/WAIT
        """
        action = TradeAction.HOLD
        confidence = 0.0
        reasoning = ""

        if signal.signal_type == SignalType.STEADY_CHATTER:
            action = TradeAction.BUY
            confidence = min(signal.signal_quality * 0.9, 0.95)
            reasoning = (
                f"Steady, consistent mentions of ${signal.ticker} detected over time. "
                f"Spike ratio {signal.spike_ratio:.2f}x baseline across "
                f"{signal.mention_count} mentions in r/{signal.subreddit}. "
                f"This pattern indicates accumulation phase — BUY signal."
            )

        elif signal.signal_type == SignalType.SPIKE:
            action = TradeAction.SELL
            confidence = min(0.7 + (signal.spike_ratio / 20), 0.98)
            reasoning = (
                f"SPIKE detected for ${signal.ticker}: {signal.spike_ratio:.1f}x "
                f"above baseline. {signal.mention_count} mentions surging in "
                f"r/{signal.subreddit}. Peak signal — crowd has arrived, "
                f"smart money exiting. SELL immediately."
            )

        elif signal.signal_type == SignalType.MASS_EXCITEMENT:
            action = TradeAction.SELL
            confidence = 0.95
            reasoning = (
                f"MASS EXCITEMENT for ${signal.ticker}: {signal.spike_ratio:.1f}x "
                f"baseline. {signal.mention_count} viral mentions. This is the "
                f"worst possible entry point — late majority FOMO. SELL all positions."
            )

        elif signal.signal_type == SignalType.COOLING:
            action = TradeAction.HOLD
            confidence = 0.5
            reasoning = (
                f"Chatter cooling for ${signal.ticker}: {signal.spike_ratio:.2f}x "
                f"baseline. Post-spike cooldown. Wait for new accumulation phase."
            )

        analysis = ChatterAnalysis(
            signal_id=signal.id,
            ticker=signal.ticker,
            signal_type=signal.signal_type,
            recommended_action=action,
            confidence=confidence,
            reasoning=reasoning,
        )

        return analysis

    async def run_cycle(self) -> dict:
        """Process all pending signals."""
        cycle_analyses = []

        while self.pending_signals:
            signal = self.pending_signals.pop(0)
            analysis = self.analyze_signal(signal)
            cycle_analyses.append(analysis)
            self.analyses.append(analysis)

        logger.info(f"Chatter Analyst: produced {len(cycle_analyses)} analyses")
        return {
            "analyses_produced": len(cycle_analyses),
            "analyses": cycle_analyses,
        }
