"""
AI Hedge Funding — API Routes
All dashboard screens, owner controls, and investor portal endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.api.auth import (
    User, verify_token, require_owner, require_investor,
    create_token, pwd_context, USERS, UserRole,
)
from backend.models.schemas import (
    DashboardMetrics, AgentState, AgentRole, OwnerControl,
    TradeProposal, TradeStatus, InvestorPortfolioView,
    PortfolioSnapshot, RiskSnapshot, SocialSignal,
    Strategy, BacktestResult,
)
from backend.config import settings, Phase

router = APIRouter()


# ─── Shared State (initialized by app startup) ──────────

agent_manager = None  # Set during app startup
autonomy_protocol = None
notifier = None
data_store = None


def get_manager():
    if agent_manager is None:
        raise HTTPException(status_code=503, detail="System not initialized")
    return agent_manager


# ─── Auth ────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    role: str
    full_name: str


@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Authenticate user and return JWT."""
    user_data = USERS.get(request.username)
    if not user_data or not pwd_context.verify(request.password, user_data["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user_data["username"], user_data["role"])
    return LoginResponse(
        token=token,
        role=user_data["role"],
        full_name=user_data["full_name"],
    )


# ─── Dashboard Metrics (Top Bar — 5 Trillionaire Metrics) ──

@router.get("/dashboard/metrics", response_model=DashboardMetrics)
async def get_metrics(user: User = Depends(verify_token)):
    """Get the 5 always-visible metrics for the top bar."""
    mgr = get_manager()
    return mgr.get_dashboard_metrics()


# ─── Portfolio Overview Screen ───────────────────────────

@router.get("/portfolio/overview")
async def get_portfolio_overview(user: User = Depends(verify_token)):
    """Total performance, equity curve, returns by strategy."""
    mgr = get_manager()
    snapshot = mgr.portfolio_conductor.get_snapshot(
        daily_pnl=mgr.risk_sentinel.daily_pnl,
    )
    strategies = mgr.strategy_engine.get_top_strategies(20)
    return {
        "snapshot": snapshot,
        "strategies": strategies,
        "equity_curve": [s.dict() for s in mgr.portfolio_conductor.snapshots[-100:]],
    }


# ─── Live Trades Screen ─────────────────────────────────

@router.get("/trades/live")
async def get_live_trades(user: User = Depends(verify_token)):
    """All open positions with real-time P&L."""
    mgr = get_manager()
    return {
        "positions": [p.dict() for p in mgr.execution_agent.positions],
        "pending_proposals": [p.dict() for p in mgr.execution_agent.pending_proposals],
        "recent_fills": [t.dict() for t in mgr.execution_agent.executed_trades[-20:]],
    }


# ─── Signal Feed Screen ─────────────────────────────────

@router.get("/signals/feed")
async def get_signal_feed(user: User = Depends(verify_token)):
    """Live Reddit signals — what the system is watching."""
    mgr = get_manager()
    return {
        "signals": [s.dict() for s in (data_store.get_recent_signals(50) if data_store else [])],
        "analyses": [a.dict() for a in (data_store.get_recent_analyses(50) if data_store else [])],
        "mention_history": dict(list(mgr.signal_harvester.mention_history.items())[:20]),
    }


# ─── Agent Status Screen ────────────────────────────────

@router.get("/agents/status")
async def get_agent_status(user: User = Depends(verify_token)):
    """Health status of all 8 AI roles."""
    mgr = get_manager()
    return {"agents": [s.dict() for s in mgr.get_all_states()]}


# ─── Risk Monitor Screen ────────────────────────────────

@router.get("/risk/monitor")
async def get_risk_monitor(user: User = Depends(verify_token)):
    """Live drawdown, daily loss vs. limit, correlation heatmap."""
    mgr = get_manager()
    risk_data = mgr.risk_sentinel.get_risk_snapshot(mgr.portfolio_value)
    return {
        "risk": risk_data.dict(),
        "daily_loss_limit": settings.DAILY_LOSS_LIMIT,
        "current_phase": settings.CURRENT_PHASE.value,
        "execution_mode": settings.EXECUTION_MODE.value,
    }


# ─── Strategy Library Screen (Phase 2) ──────────────────

@router.get("/strategies/library")
async def get_strategy_library(user: User = Depends(verify_token)):
    """All strategies with performance metrics and filters."""
    mgr = get_manager()
    strategies = mgr.strategy_engine.strategies
    return {
        "strategies": [s.dict() for s in strategies],
        "total_count": len(strategies),
        "active_count": len([s for s in strategies if s.is_active]),
        "target": settings.PHASE_1_STRATEGY_TARGET,
    }


# ─── Backtest Runner Screen (Phase 2) ───────────────────

class BacktestRequest(BaseModel):
    strategy_name: Optional[str] = None
    variations: int = 5


@router.post("/strategies/backtest")
async def run_backtest(
    request: BacktestRequest,
    user: User = Depends(require_owner),
):
    """Launch new backtest variations."""
    mgr = get_manager()
    result = await mgr.strategy_engine.run_cycle()
    return result


# ─── Owner Controls ──────────────────────────────────────

@router.post("/controls/phase-transition")
async def phase_transition(
    target: str,
    user: User = Depends(require_owner),
):
    """Confirm switch Phase 1 → 2 → 3 (manual approval required)."""
    mgr = get_manager()
    phase_map = {
        "phase_2": Phase.PHASE_2,
        "phase_3": Phase.PHASE_3,
    }
    target_phase = phase_map.get(target)
    if not target_phase:
        raise HTTPException(status_code=400, detail="Invalid target phase")

    success = mgr.transition_phase(target_phase)
    if not success:
        raise HTTPException(status_code=400, detail="Phase transition not allowed")

    return {
        "success": True,
        "current_phase": settings.CURRENT_PHASE.value,
        "execution_mode": settings.EXECUTION_MODE.value,
        "meta_learner_mode": settings.META_LEARNER_MODE.value,
    }


@router.post("/controls/daily-loss-limit")
async def set_daily_loss_limit(
    limit: float,
    user: User = Depends(require_owner),
):
    """Set and adjust the kill-switch threshold in real-time."""
    mgr = get_manager()
    mgr.set_daily_loss_limit(limit)
    return {"daily_loss_limit": settings.DAILY_LOSS_LIMIT}


@router.post("/controls/agent/{role}/pause")
async def pause_agent(
    role: str,
    user: User = Depends(require_owner),
):
    """Pause a specific agent without stopping the system."""
    mgr = get_manager()
    try:
        agent_role = AgentRole(role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unknown agent role: {role}")

    mgr.pause_agent(agent_role)
    return {"status": "paused", "role": role}


@router.post("/controls/agent/{role}/start")
async def start_agent(
    role: str,
    user: User = Depends(require_owner),
):
    """Restart a paused agent."""
    mgr = get_manager()
    try:
        agent_role = AgentRole(role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unknown agent role: {role}")

    mgr.start_agent(agent_role)
    return {"status": "running", "role": role}


@router.post("/controls/emergency-stop")
async def emergency_stop(user: User = Depends(require_owner)):
    """Immediately close all trades and halt all execution."""
    mgr = get_manager()
    result = await mgr.emergency_stop()

    if notifier:
        await notifier.notify_emergency_stop(result["positions_closed"])

    return result


# ─── Trade Approval (Phase 1) ───────────────────────────

@router.post("/trades/{proposal_id}/approve")
async def approve_trade(
    proposal_id: str,
    user: User = Depends(require_owner),
):
    """Owner approves a proposed trade (Phase 1 supervised mode)."""
    mgr = get_manager()
    result = mgr.execution_agent.approve_trade(proposal_id)
    if not result:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return result.dict()


@router.post("/trades/{proposal_id}/reject")
async def reject_trade(
    proposal_id: str,
    user: User = Depends(require_owner),
):
    """Owner rejects a proposed trade."""
    mgr = get_manager()
    result = mgr.execution_agent.reject_trade(proposal_id)
    if not result:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return result.dict()


# ─── Meta Learner Approvals ─────────────────────────────

@router.get("/meta-learner/pending")
async def get_meta_learner_pending(user: User = Depends(require_owner)):
    """Get strategies pending owner approval from Meta Learner."""
    mgr = get_manager()
    return {
        "pending": [s.dict() for s in mgr.meta_learner.proposed_deployments],
        "consecutive_successes": mgr.meta_learner.consecutive_successes,
    }


@router.post("/meta-learner/approve/{strategy_id}")
async def approve_meta_deployment(
    strategy_id: str,
    user: User = Depends(require_owner),
):
    """Owner approves Meta Learner strategy deployment."""
    mgr = get_manager()
    for s in mgr.meta_learner.proposed_deployments:
        if s.id == strategy_id:
            mgr.meta_learner.deploy_strategy(s, approved=True)
            mgr.meta_learner.proposed_deployments.remove(s)
            return {"deployed": True, "strategy": s.dict()}

    raise HTTPException(status_code=404, detail="Strategy not found")


# ─── Autonomy Protocol ──────────────────────────────────

@router.get("/autonomy/status")
async def get_autonomy_status(user: User = Depends(require_owner)):
    """Get current autonomy phase and escalation readiness."""
    if autonomy_protocol:
        return {
            "current_phase": settings.CURRENT_PHASE.value,
            "execution_mode": settings.EXECUTION_MODE.value,
            "meta_learner_mode": settings.META_LEARNER_MODE.value,
            "rules": autonomy_protocol.get_phase_rules(),
            "escalation": autonomy_protocol.request_escalation(),
            "metrics": autonomy_protocol.escalation_metrics,
        }
    return {"current_phase": settings.CURRENT_PHASE.value}


# ─── Investor Portal (Separate, Read-Only) ──────────────

@router.get("/investor/portfolio", response_model=InvestorPortfolioView)
async def get_investor_portfolio(user: User = Depends(require_investor)):
    """
    Read-only investor portal.
    Shows: total fund return, capital deployed, monthly performance.
    Completely separate from main dashboard.
    """
    mgr = get_manager()
    return mgr.compliance_capital.generate_investor_report()


@router.get("/investor/performance")
async def get_investor_performance(user: User = Depends(require_investor)):
    """Monthly performance breakdown for investors."""
    mgr = get_manager()
    return {
        "monthly_returns": mgr.compliance_capital.monthly_returns,
        "total_return": mgr.compliance_capital.total_fund_return,
        "aum": mgr.compliance_capital.aum,
    }


# ─── System Info ─────────────────────────────────────────

@router.get("/system/info")
async def get_system_info(user: User = Depends(verify_token)):
    """System configuration and locked decisions."""
    return {
        "fund_name": settings.FUND_NAME,
        "legal_entity": settings.LEGAL_ENTITY,
        "legal_state": settings.LEGAL_STATE,
        "team": {
            "owner": settings.TEAM_OWNER,
            "cto": settings.TEAM_CTO,
        },
        "current_phase": settings.CURRENT_PHASE.value,
        "execution_mode": settings.EXECUTION_MODE.value,
        "meta_learner_mode": settings.META_LEARNER_MODE.value,
        "targets": {
            "annual_return": f"{settings.TARGET_ANNUAL_RETURN*100:.0f}%",
            "win_rate": f"{settings.TARGET_WIN_RATE*100:.0f}%",
            "sharpe_ratio": settings.TARGET_SHARPE_RATIO,
            "strategies_phase_1": settings.PHASE_1_STRATEGY_TARGET,
            "strategies_phase_2": settings.PHASE_2_STRATEGY_TARGET,
        },
        "asset_classes": {
            "phase_1": ["US Equities"],
            "phase_2": ["US Equities", "Crypto", "FX / Commodities"],
        },
    }
