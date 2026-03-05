"""
AI Hedge Funding — Alpaca Broker Integration
Phase 1: Paper trading and testing. API-first, zero cost.
"""

import logging
from typing import Optional

from backend.config import settings

logger = logging.getLogger(__name__)


class AlpacaBroker:
    """
    Alpaca integration for Phase 1 paper trading.
    API-first broker with zero-cost paper trading environment.
    """

    def __init__(self):
        self.client = None
        self.trading_client = None

    async def connect(self):
        """Initialize Alpaca API clients."""
        try:
            from alpaca.trading.client import TradingClient
            from alpaca.data.historical import StockHistoricalDataClient

            self.trading_client = TradingClient(
                api_key=settings.ALPACA_API_KEY,
                secret_key=settings.ALPACA_SECRET_KEY,
                paper=True,  # Phase 1: always paper trading
            )
            self.client = StockHistoricalDataClient(
                api_key=settings.ALPACA_API_KEY,
                secret_key=settings.ALPACA_SECRET_KEY,
            )
            logger.info("Alpaca broker connected (paper trading mode)")
        except Exception as e:
            logger.error(f"Alpaca connection failed: {e}")
            raise

    async def get_account(self) -> dict:
        """Get account info."""
        if not self.trading_client:
            return {"error": "Not connected"}
        try:
            account = self.trading_client.get_account()
            return {
                "equity": float(account.equity),
                "cash": float(account.cash),
                "buying_power": float(account.buying_power),
                "portfolio_value": float(account.portfolio_value),
            }
        except Exception as e:
            logger.error(f"Failed to get account: {e}")
            return {"error": str(e)}

    async def submit_order(
        self,
        ticker: str,
        quantity: int,
        side: str,
        order_type: str = "market",
        limit_price: Optional[float] = None,
    ) -> dict:
        """Submit a trade order."""
        if not self.trading_client:
            logger.warning("Alpaca not connected — simulating order")
            return {"price": limit_price or 100.0, "status": "simulated"}

        try:
            from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest
            from alpaca.trading.enums import OrderSide, TimeInForce

            order_side = OrderSide.BUY if side == "buy" else OrderSide.SELL

            if order_type == "market":
                request = MarketOrderRequest(
                    symbol=ticker,
                    qty=quantity,
                    side=order_side,
                    time_in_force=TimeInForce.DAY,
                )
            else:
                request = LimitOrderRequest(
                    symbol=ticker,
                    qty=quantity,
                    side=order_side,
                    time_in_force=TimeInForce.DAY,
                    limit_price=limit_price,
                )

            order = self.trading_client.submit_order(request)
            logger.info(f"Order submitted: {side} {quantity} {ticker}")

            return {
                "order_id": str(order.id),
                "status": str(order.status),
                "price": float(order.filled_avg_price) if order.filled_avg_price else 0.0,
            }
        except Exception as e:
            logger.error(f"Order failed: {e}")
            return {"error": str(e)}

    async def get_positions(self) -> list[dict]:
        """Get all open positions."""
        if not self.trading_client:
            return []
        try:
            positions = self.trading_client.get_all_positions()
            return [
                {
                    "ticker": p.symbol,
                    "quantity": int(p.qty),
                    "current_price": float(p.current_price),
                    "entry_price": float(p.avg_entry_price),
                    "unrealized_pnl": float(p.unrealized_pl),
                    "market_value": float(p.market_value),
                }
                for p in positions
            ]
        except Exception as e:
            logger.error(f"Failed to get positions: {e}")
            return []

    async def close_all_positions(self) -> dict:
        """Emergency: close all positions."""
        if not self.trading_client:
            return {"status": "not_connected"}
        try:
            self.trading_client.close_all_positions(cancel_orders=True)
            logger.critical("ALL POSITIONS CLOSED via Alpaca")
            return {"status": "all_closed"}
        except Exception as e:
            logger.error(f"Failed to close all: {e}")
            return {"error": str(e)}
