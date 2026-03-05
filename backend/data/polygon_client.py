"""
AI Hedge Funding — Polygon API Client
Market data provider for Phase 1 + 2.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

from backend.config import settings

logger = logging.getLogger(__name__)


class PolygonClient:
    """
    Polygon.io API client for real-time and historical market data.
    Covers all Phase 1 + 2 needs: equities, crypto, FX.
    """

    def __init__(self):
        self.client = None

    def connect(self):
        """Initialize Polygon REST client."""
        try:
            from polygon import RESTClient
            self.client = RESTClient(api_key=settings.POLYGON_API_KEY)
            logger.info("Polygon API client initialized")
        except Exception as e:
            logger.error(f"Polygon connection failed: {e}")

    async def get_price(self, ticker: str) -> Optional[float]:
        """Get latest price for a ticker."""
        if not self.client:
            return None
        try:
            snapshot = self.client.get_snapshot_ticker("stocks", ticker)
            return float(snapshot.day.close) if snapshot.day else None
        except Exception as e:
            logger.error(f"Failed to get price for {ticker}: {e}")
            return None

    async def get_historical_bars(
        self,
        ticker: str,
        start_date: str,
        end_date: str,
        timespan: str = "day",
    ) -> list[dict]:
        """Get historical price bars."""
        if not self.client:
            return []
        try:
            bars = self.client.get_aggs(
                ticker=ticker,
                multiplier=1,
                timespan=timespan,
                from_=start_date,
                to=end_date,
            )
            return [
                {
                    "timestamp": b.timestamp,
                    "open": b.open,
                    "high": b.high,
                    "low": b.low,
                    "close": b.close,
                    "volume": b.volume,
                }
                for b in bars
            ]
        except Exception as e:
            logger.error(f"Failed to get bars for {ticker}: {e}")
            return []

    async def get_ticker_details(self, ticker: str) -> Optional[dict]:
        """Get ticker fundamentals (market cap, etc.)."""
        if not self.client:
            return None
        try:
            details = self.client.get_ticker_details(ticker)
            return {
                "name": details.name,
                "market_cap": details.market_cap,
                "description": details.description,
                "sector": getattr(details, "sic_description", None),
            }
        except Exception as e:
            logger.error(f"Failed to get details for {ticker}: {e}")
            return None
