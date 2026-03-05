"""
AI Hedge Funding — Signal Harvester Agent
Role: Scrapes Reddit, Instagram, TikTok 24/7 across millions of profiles.
Edge: 10x data sources vs. any human analyst team. Never sleeps.
Phase 1: Reddit only. Phase 2: Instagram + TikTok.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentRole, SocialSignal, SignalType, AssetClass
)
from backend.config import settings

logger = logging.getLogger(__name__)

# Subreddits to monitor for stock signals
MONITORED_SUBREDDITS = [
    "wallstreetbets", "stocks", "investing", "options",
    "stockmarket", "pennystocks", "smallstreetbets",
    "Daytrading", "thetagang", "SPACs",
]

# Minimum signal quality threshold — no signal, no trade
SIGNAL_QUALITY_THRESHOLD = 0.6


class SignalHarvester(BaseAgent):
    """
    Scrapes social media platforms 24/7 for stock mentions.
    Phase 1: Reddit (via PRAW).
    Phase 2: Adds Instagram mass profile scraping + TikTok trend detection.
    """

    def __init__(self):
        super().__init__(AgentRole.SIGNAL_HARVESTER)
        self.reddit_client = None
        self.mention_history: dict[str, list[dict]] = {}  # ticker → [{count, timestamp}]

    async def initialize_reddit(self):
        """Initialize Reddit API client via PRAW."""
        try:
            import praw
            self.reddit_client = praw.Reddit(
                client_id=settings.REDDIT_CLIENT_ID,
                client_secret=settings.REDDIT_CLIENT_SECRET,
                user_agent=settings.REDDIT_USER_AGENT,
            )
            logger.info("Reddit client initialized successfully")
        except Exception as e:
            self.set_error(f"Failed to initialize Reddit: {e}")

    def _calculate_signal_type(self, ticker: str, current_count: int) -> tuple[SignalType, float]:
        """
        Core alpha logic — the inverted signal:
        - Steady chatter = accumulation → BUY
        - Spike = peak → SELL immediately
        - Mass excitement = worst entry → AVOID
        - Cooling after spike = WAIT
        """
        history = self.mention_history.get(ticker, [])

        if len(history) < 3:
            # Not enough data points yet
            return SignalType.STEADY_CHATTER, 0.3

        recent_avg = sum(h["count"] for h in history[-7:]) / min(len(history), 7)
        baseline_avg = sum(h["count"] for h in history) / len(history)

        if baseline_avg == 0:
            baseline_avg = 1.0

        spike_ratio = current_count / baseline_avg

        if spike_ratio > 10:
            # Mass viral excitement — worst possible entry
            return SignalType.MASS_EXCITEMENT, spike_ratio
        elif spike_ratio > 3:
            # Spike detected — peak signal → SELL
            return SignalType.SPIKE, spike_ratio
        elif spike_ratio < 0.5 and len(history) > 14:
            # Cooling after a spike — wait
            return SignalType.COOLING, spike_ratio
        else:
            # Steady, consistent chatter — accumulation → BUY
            return SignalType.STEADY_CHATTER, spike_ratio

    def _calculate_signal_quality(
        self, signal_type: SignalType, spike_ratio: float, data_points: int
    ) -> float:
        """Signal quality filter — only high-quality signals pass through."""
        quality = 0.5

        # More data points = higher quality
        if data_points > 30:
            quality += 0.2
        elif data_points > 14:
            quality += 0.1

        # Steady chatter signals are highest quality
        if signal_type == SignalType.STEADY_CHATTER and spike_ratio > 1.2:
            quality += 0.2
        elif signal_type == SignalType.SPIKE and spike_ratio > 5:
            quality += 0.15

        return min(quality, 1.0)

    async def scrape_subreddit(self, subreddit_name: str) -> list[SocialSignal]:
        """Scrape a subreddit for stock ticker mentions."""
        signals = []

        if not self.reddit_client:
            logger.warning("Reddit client not initialized — returning empty signals")
            return signals

        try:
            subreddit = self.reddit_client.subreddit(subreddit_name)
            ticker_counts: dict[str, int] = {}

            for submission in subreddit.hot(limit=100):
                text = f"{submission.title} {submission.selftext}".upper()
                # Extract $TICKER patterns
                import re
                tickers = re.findall(r'\$([A-Z]{1,5})\b', text)
                for t in tickers:
                    ticker_counts[t] = ticker_counts.get(t, 0) + 1

            for ticker, count in ticker_counts.items():
                signal_type, spike_ratio = self._calculate_signal_type(ticker, count)
                data_points = len(self.mention_history.get(ticker, []))
                quality = self._calculate_signal_quality(signal_type, spike_ratio, data_points)

                # Update history
                if ticker not in self.mention_history:
                    self.mention_history[ticker] = []
                self.mention_history[ticker].append({
                    "count": count,
                    "timestamp": datetime.utcnow().isoformat()
                })

                # Only pass through signals above quality threshold
                if quality >= SIGNAL_QUALITY_THRESHOLD:
                    signal = SocialSignal(
                        ticker=ticker,
                        source="reddit",
                        signal_type=signal_type,
                        mention_count=count,
                        avg_mentions_baseline=sum(
                            h["count"] for h in self.mention_history[ticker]
                        ) / len(self.mention_history[ticker]),
                        spike_ratio=spike_ratio,
                        signal_quality=quality,
                        subreddit=subreddit_name,
                    )
                    signals.append(signal)

        except Exception as e:
            logger.error(f"Error scraping r/{subreddit_name}: {e}")

        return signals

    async def run_cycle(self) -> dict:
        """Execute one harvest cycle across all monitored subreddits."""
        all_signals = []

        for sub in MONITORED_SUBREDDITS:
            signals = await self.scrape_subreddit(sub)
            all_signals.extend(signals)

        logger.info(f"Signal Harvester: collected {len(all_signals)} signals")
        return {
            "signals_collected": len(all_signals),
            "signals": all_signals,
            "subreddits_scanned": len(MONITORED_SUBREDDITS),
        }
