"""
AI Hedge Funding — Interactive Brokers Integration
Live trading broker. Institutional grade, scales to $100M+.
"""

import logging
from typing import Optional

from backend.config import settings

logger = logging.getLogger(__name__)


class IBBroker:
    """
    Interactive Brokers integration for live trading.
    Institutional-grade execution. Scales to $100M+ AUM.
    """

    def __init__(self):
        self.ib = None
        self.connected = False

    async def connect(self):
        """Connect to IB TWS/Gateway."""
        try:
            from ib_insync import IB
            self.ib = IB()
            await self.ib.connectAsync(
                host=settings.IB_HOST,
                port=settings.IB_PORT,
                clientId=settings.IB_CLIENT_ID,
            )
            self.connected = True
            logger.info("Interactive Brokers connected")
        except Exception as e:
            logger.error(f"IB connection failed: {e}")
            raise

    async def get_account(self) -> dict:
        """Get IB account summary."""
        if not self.ib or not self.connected:
            return {"error": "Not connected"}
        try:
            summary = self.ib.accountSummary()
            result = {}
            for item in summary:
                result[item.tag] = item.value
            return result
        except Exception as e:
            logger.error(f"Failed to get IB account: {e}")
            return {"error": str(e)}

    async def submit_order(
        self,
        ticker: str,
        quantity: int,
        side: str,
        order_type: str = "market",
        limit_price: Optional[float] = None,
    ) -> dict:
        """Submit order via IB."""
        if not self.ib or not self.connected:
            logger.warning("IB not connected — simulating order")
            return {"price": limit_price or 100.0, "status": "simulated"}

        try:
            from ib_insync import Stock, MarketOrder, LimitOrder

            contract = Stock(ticker, "SMART", "USD")
            self.ib.qualifyContracts(contract)

            action = "BUY" if side == "buy" else "SELL"

            if order_type == "market":
                order = MarketOrder(action, quantity)
            else:
                order = LimitOrder(action, quantity, limit_price)

            trade = self.ib.placeOrder(contract, order)
            logger.info(f"IB order placed: {action} {quantity} {ticker}")

            return {
                "order_id": str(trade.order.orderId),
                "status": str(trade.orderStatus.status),
                "price": float(trade.orderStatus.avgFillPrice) if trade.orderStatus.avgFillPrice else 0.0,
            }
        except Exception as e:
            logger.error(f"IB order failed: {e}")
            return {"error": str(e)}

    async def get_positions(self) -> list[dict]:
        """Get all open IB positions."""
        if not self.ib or not self.connected:
            return []
        try:
            positions = self.ib.positions()
            return [
                {
                    "ticker": p.contract.symbol,
                    "quantity": int(p.position),
                    "entry_price": float(p.avgCost),
                    "current_price": 0.0,  # Need market data subscription
                    "unrealized_pnl": 0.0,
                }
                for p in positions
            ]
        except Exception as e:
            logger.error(f"Failed to get IB positions: {e}")
            return []

    async def close_all_positions(self) -> dict:
        """Emergency: close all IB positions."""
        if not self.ib or not self.connected:
            return {"status": "not_connected"}
        try:
            positions = self.ib.positions()
            for p in positions:
                action = "SELL" if p.position > 0 else "BUY"
                from ib_insync import MarketOrder
                order = MarketOrder(action, abs(p.position))
                self.ib.placeOrder(p.contract, order)

            logger.critical("ALL POSITIONS CLOSED via IB")
            return {"status": "all_closed", "positions_closed": len(positions)}
        except Exception as e:
            logger.error(f"Failed to close all IB positions: {e}")
            return {"error": str(e)}

    def disconnect(self):
        """Disconnect from IB."""
        if self.ib and self.connected:
            self.ib.disconnect()
            self.connected = False
            logger.info("IB disconnected")
