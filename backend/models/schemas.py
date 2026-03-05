"""
AI Hedge Funding — Core Data Models
"""

from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import uuid4


# ─── Enums ───────────────────────────────────────────────

class SignalType(str, Enum):
    STEADY_CHATTER = "steady_chatter"       # Accumulation → BUY
    SPIKE = "spike"                          # Peak → SELL
    MASS_EXCITEMENT = "mass_excitement"      # Late majority → AVOID
    COOLING = "cooling"                      # Post-spike → WAIT


class TradeAction(str, Enum):
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"
    CLOSE = "close"


class TradeStatus(str, Enum):
    PROPOSED = "proposed"       # Phase 1: awaiting human approval
    APPROVED = "approved"       # Human approved
    REJECTED = "rejected"       # Human rejected
    EXECUTING = "executing"     # Being sent to broker
    FILLED = "filled"           # Broker confirmed fill
    CANCELLED = "cancelled"     # Cancelled before fill
    FAILED = "failed"           # Execution failed


class AgentRole(str, Enum):
    SIGNAL_HARVESTER = "signal_harvester"
    CHATTER_ANALYST = "chatter_analyst"
    STRATEGY_ENGINE = "strategy_engine"
    EXECUTION_AGENT = "execution_agent"
    RISK_SENTINEL = "risk_sentinel"
    PORTFOLIO_CONDUCTOR = "portfolio_conductor"
    META_LEARNER = "meta_learner"
    COMPLIANCE_CAPITAL = "compliance_capital"


class AgentStatus(str, Enum):
    RUNNING = "running"
    PAUSED = "paused"
    ERROR = "error"
    STOPPED = "stopped"


class AssetClass(str, Enum):
    US_EQUITIES = "us_equities"     # Phase 1
    CRYPTO = "crypto"               # Phase 2
    FX_COMMODITIES = "fx_commodities"  # Phase 2


# ─── Signal Models ───────────────────────────────────────

class SocialSignal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    ticker: str
    source: str  # reddit, instagram, tiktok
    signal_type: SignalType
    mention_count: int
    avg_mentions_baseline: float
    spike_ratio: float  # current / baseline
    signal_quality: float = Field(ge=0.0, le=1.0)  # 0-1 quality filter
    subreddit: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    raw_data: Optional[dict] = None


class ChatterAnalysis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    signal_id: str
    ticker: str
    signal_type: SignalType
    recommended_action: TradeAction
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ─── Trade Models ────────────────────────────────────────

class TradeProposal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    ticker: str
    action: TradeAction
    quantity: int
    price: Optional[float] = None
    strategy_id: str
    signal_id: str
    analysis_id: str
    confidence: float
    status: TradeStatus = TradeStatus.PROPOSED
    asset_class: AssetClass = AssetClass.US_EQUITIES
    proposed_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None
    executed_at: Optional[datetime] = None
    fill_price: Optional[float] = None
    pnl: Optional[float] = None


class Position(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    ticker: str
    quantity: int
    entry_price: float
    current_price: float
    unrealized_pnl: float
    realized_pnl: float = 0.0
    strategy_id: str
    asset_class: AssetClass = AssetClass.US_EQUITIES
    opened_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Strategy Models ────────────────────────────────────

class Strategy(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    description: str
    asset_class: AssetClass = AssetClass.US_EQUITIES
    is_active: bool = False
    win_rate: float = 0.0
    total_return: float = 0.0
    sharpe_ratio: float = 0.0
    total_trades: int = 0
    winning_trades: int = 0
    capital_allocated: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    parameters: dict = {}


class BacktestResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    strategy_id: str
    start_date: str
    end_date: str
    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    completed_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Agent Models ────────────────────────────────────────

class AgentState(BaseModel):
    role: AgentRole
    status: AgentStatus = AgentStatus.RUNNING
    last_heartbeat: datetime = Field(default_factory=datetime.utcnow)
    tasks_completed: int = 0
    errors: int = 0
    uptime_seconds: float = 0.0
    message: str = ""


# ─── Portfolio Models ────────────────────────────────────

class PortfolioSnapshot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    total_value: float
    cash: float
    invested: float
    total_return_pct: float
    daily_pnl: float
    win_rate_today: float
    aum: float
    positions_count: int
    strategies_active: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ─── Risk Models ─────────────────────────────────────────

class RiskSnapshot(BaseModel):
    daily_loss: float
    daily_loss_limit: float
    max_drawdown: float
    current_drawdown: float
    portfolio_beta: float = 0.0
    correlation_matrix: dict = {}
    kill_switch_triggered: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ─── Dashboard/API Models ───────────────────────────────

class DashboardMetrics(BaseModel):
    """The 5 Trillionaire Metrics — always visible in top bar."""
    total_return_pct: float
    aum: float
    win_rate_today: float
    system_status: str  # "green" or "red"
    daily_pnl: float


class OwnerControl(BaseModel):
    action: str  # phase_transition, set_daily_loss_limit, agent_control, emergency_stop
    payload: dict = {}


class InvestorPortfolioView(BaseModel):
    """Read-only view for LP investors."""
    total_fund_return: float
    capital_deployed: float
    monthly_performance: list[float]
    as_of: datetime = Field(default_factory=datetime.utcnow)
