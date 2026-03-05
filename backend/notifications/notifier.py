"""
AI Hedge Funding — Notification System

Channels:
  Email — Critical system alerts, daily performance summary
  Telegram — Live trade notifications (every executed buy/sell)
  SMS — System failure only (last resort emergency alert)
"""

import logging
from enum import Enum

from backend.config import settings

logger = logging.getLogger(__name__)


class NotificationChannel(str, Enum):
    EMAIL = "email"
    TELEGRAM = "telegram"
    SMS = "sms"


class NotificationPriority(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class Notifier:
    """
    Multi-channel notification system.
    Email: Alerts + daily summary.
    Telegram: Every trade execution.
    SMS: System failure only — last resort.
    """

    def __init__(self):
        self.email_enabled = bool(settings.SENDGRID_API_KEY)
        self.telegram_enabled = bool(settings.TELEGRAM_BOT_TOKEN)
        self.sms_enabled = bool(settings.TWILIO_ACCOUNT_SID)

    # ─── Email ───────────────────────────────────────────

    async def send_email(self, subject: str, body: str):
        """Send email via SendGrid — critical alerts and daily summaries."""
        if not self.email_enabled:
            logger.warning(f"Email not configured. Would send: {subject}")
            return

        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail

            message = Mail(
                from_email=settings.SENDGRID_FROM_EMAIL,
                to_emails=settings.SENDGRID_FROM_EMAIL,  # Send to self
                subject=f"[AI Hedge Funding] {subject}",
                html_content=body,
            )

            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            sg.send(message)
            logger.info(f"Email sent: {subject}")
        except Exception as e:
            logger.error(f"Email send failed: {e}")

    # ─── Telegram ────────────────────────────────────────

    async def send_telegram(self, message: str):
        """Send Telegram message — live trade notifications."""
        if not self.telegram_enabled:
            logger.warning(f"Telegram not configured. Would send: {message}")
            return

        try:
            from telegram import Bot

            bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
            await bot.send_message(
                chat_id=settings.TELEGRAM_CHAT_ID,
                text=f"AI Hedge Funding\n\n{message}",
                parse_mode="Markdown",
            )
            logger.info("Telegram message sent")
        except Exception as e:
            logger.error(f"Telegram send failed: {e}")

    # ─── SMS ─────────────────────────────────────────────

    async def send_sms(self, message: str):
        """Send SMS via Twilio — system failure ONLY, last resort."""
        if not self.sms_enabled:
            logger.warning(f"SMS not configured. Would send: {message}")
            return

        try:
            from twilio.rest import Client

            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            client.messages.create(
                body=f"[AI HEDGE FUNDING EMERGENCY] {message}",
                from_=settings.TWILIO_FROM_NUMBER,
                to=settings.TWILIO_TO_NUMBER,
            )
            logger.info("SMS sent (emergency)")
        except Exception as e:
            logger.error(f"SMS send failed: {e}")

    # ─── Convenience Methods ─────────────────────────────

    async def notify_trade(self, ticker: str, action: str, quantity: int, price: float):
        """Notify on trade execution — Telegram."""
        msg = f"*Trade Executed*\n{action.upper()} {quantity} ${ticker} @ ${price:.2f}"
        await self.send_telegram(msg)

    async def notify_daily_summary(
        self, total_return: float, daily_pnl: float, win_rate: float, trades: int
    ):
        """Daily performance summary — Email."""
        body = f"""
        <h2>AI Hedge Funding — Daily Summary</h2>
        <table>
            <tr><td>Total Return</td><td>{total_return:.2f}%</td></tr>
            <tr><td>Daily P&L</td><td>${daily_pnl:,.2f}</td></tr>
            <tr><td>Win Rate</td><td>{win_rate:.1%}</td></tr>
            <tr><td>Trades Today</td><td>{trades}</td></tr>
        </table>
        """
        await self.send_email("Daily Performance Summary", body)

    async def notify_alert(self, title: str, message: str, priority: NotificationPriority):
        """Send alert based on priority level."""
        if priority == NotificationPriority.EMERGENCY:
            await self.send_sms(f"{title}: {message}")
            await self.send_email(f"EMERGENCY: {title}", f"<h1>{title}</h1><p>{message}</p>")
            await self.send_telegram(f"*EMERGENCY*\n{title}\n{message}")
        elif priority == NotificationPriority.CRITICAL:
            await self.send_email(f"CRITICAL: {title}", f"<h1>{title}</h1><p>{message}</p>")
            await self.send_telegram(f"*CRITICAL*\n{title}\n{message}")
        elif priority == NotificationPriority.WARNING:
            await self.send_email(title, f"<p>{message}</p>")
        else:
            await self.send_telegram(message)

    async def notify_system_failure(self, error: str):
        """System failure — triggers SMS (last resort)."""
        await self.notify_alert(
            "SYSTEM FAILURE",
            error,
            NotificationPriority.EMERGENCY,
        )

    async def notify_kill_switch(self, daily_loss: float, limit: float):
        """Daily loss limit breached — notify all channels."""
        await self.notify_alert(
            "Kill Switch Triggered",
            f"Daily loss ${daily_loss:,.2f} exceeded limit ${limit:,.2f}. System paused.",
            NotificationPriority.CRITICAL,
        )

    async def notify_emergency_stop(self, positions_closed: int):
        """Emergency stop activated."""
        await self.notify_alert(
            "EMERGENCY STOP",
            f"All {positions_closed} positions closed. All agents paused.",
            NotificationPriority.EMERGENCY,
        )
