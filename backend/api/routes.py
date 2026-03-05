"""
AI Hedge Funding — API Routes
All dashboard screens, owner controls, and investor portal endpoints.
Multi-fund aware: all fund-scoped endpoints accept fund_id query parameter.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from backend.api.auth import (
    User, verify_token, require_owner, require_investor,
    create_token, pwd_context, USERS, UserRole,
)
from backend.models.schemas import (
    Fund, DashboardMetrics, AgentState, AgentRole, OwnerControl,
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


def get_fund_or_default(fund_id: str = "") -> str:
    """Resolve fund_id — use default if not provided."""
    if not fund_id and data_store:
        funds = data_store.get_all_funds()
        if funds:
            return funds[0].id
    return fund_id


def require_fund_access(fund_id: str, user: User):
    """Check if user has access to this fund."""
    user_data = USERS.get(user.username)
    if user_data and user_data.get("role") in (UserRole.OWNER, UserRole.CTO):
        return  # Owner/CTO can access all funds
    # Investors: check fund_ids list
    if user_data and fund_id not in user_data.get("fund_ids", []):
        raise HTTPException(status_code=403, detail="No access to this fund")


# ─── Fund Management ─────────────────────────────────────

@router.get("/funds")
async def list_funds(user: User = Depends(verify_token)):
    """List all funds the user has access to."""
    if not data_store:
        return {"funds": []}

    all_funds = data_store.get_all_funds()

    # Owner/CTO see all funds
    user_data = USERS.get(user.username)
    if user_data and user_data.get("role") in (UserRole.OWNER, UserRole.CTO):
        return {"funds": [f.dict() for f in all_funds]}

    # Investors see only their assigned funds
    allowed = user_data.get("fund_ids", []) if user_data else []
    filtered = [f for f in all_funds if f.id in allowed]
    return {"funds": [f.dict() for f in filtered]}


@router.get("/funds/{fund_id}")
async def get_fund(fund_id: str, user: User = Depends(verify_token)):
    """Get a single fund's details."""
    if not data_store:
        raise HTTPException(status_code=404, detail="Fund not found")
    fund = data_store.get_fund(fund_id)
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")
    require_fund_access(fund_id, user)
    return fund.dict()


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
async def get_metrics(
    fund_id: str = Query(default="", description="Fund to get metrics for"),
    user: User = Depends(verify_token),
):
    """Get the 5 always-visible metrics for the top bar."""
    mgr = get_manager()
    fund_id = get_fund_or_default(fund_id)
    if fund_id:
        require_fund_access(fund_id, user)
    metrics = mgr.get_dashboard_metrics()
    metrics.fund_id = fund_id
    return metrics


# ─── Portfolio Overview Screen ───────────────────────────

@router.get("/portfolio/overview")
async def get_portfolio_overview(
    fund_id: str = Query(default="", description="Fund ID"),
    user: User = Depends(verify_token),
):
    """Total performance, equity curve, returns by strategy."""
    mgr = get_manager()
    fund_id = get_fund_or_default(fund_id)
    if fund_id:
        require_fund_access(fund_id, user)

    snapshot = mgr.portfolio_conductor.get_snapshot(
        daily_pnl=mgr.risk_sentinel.daily_pnl,
    )
    snapshot.fund_id = fund_id
    strategies = mgr.strategy_engine.get_top_strategies(20)
    return {
        "fund_id": fund_id,
        "snapshot": snapshot,
        "strategies": strategies,
        "equity_curve": [s.dict() for s in mgr.portfolio_conductor.snapshots[-100:]],
    }


# ─── Live Trades Screen ─────────────────────────────────

@router.get("/trades/live")
async def get_live_trades(
    fund_id: str = Query(default="", description="Fund ID"),
    user: User = Depends(verify_token),
):
    """All open positions with real-time P&L."""
    mgr = get_manager()
    fund_id = get_fund_or_default(fund_id)
    if fund_id:
        require_fund_access(fund_id, user)

    positions = [p for p in mgr.execution_agent.positions if not fund_id or p.fund_id == fund_id]
    proposals = [p for p in mgr.execution_agent.pending_proposals if not fund_id or p.fund_id == fund_id]
    fills = [t for t in mgr.execution_agent.executed_trades[-20:] if not fund_id or t.fund_id == fund_id]

    return {
        "fund_id": fund_id,
        "positions": [p.dict() for p in positions],
        "pending_proposals": [p.dict() for p in proposals],
        "recent_fills": [t.dict() for t in fills],
    }


# ─── Signal Feed Screen ─────────────────────────────────

@router.get("/signals/feed")
async def get_signal_feed(user: User = Depends(verify_token)):
    """Live Reddit signals — what the system is watching. Signals are global."""
    mgr = get_manager()
    return {
        "signals": [s.dict() for s in (data_store.get_recent_signals(50) if data_store else [])],
        "analyses": [a.dict() for a in (data_store.get_recent_analyses(50) if data_store else [])],
        "mention_history": dict(list(mgr.signal_harvester.mention_history.items())[:20]),
    }


# ─── Agent Status Screen ────────────────────────────────

@router.get("/agents/status")
async def get_agent_status(user: User = Depends(verify_token)):
    """Health status of all 8 AI roles. Agents are shared across funds."""
    mgr = get_manager()
    return {"agents": [s.dict() for s in mgr.get_all_states()]}


# ─── Risk Monitor Screen ────────────────────────────────

@router.get("/risk/monitor")
async def get_risk_monitor(
    fund_id: str = Query(default="", description="Fund ID"),
    user: User = Depends(verify_token),
):
    """Live drawdown, daily loss vs. limit, correlation heatmap."""
    mgr = get_manager()
    fund_id = get_fund_or_default(fund_id)
    if fund_id:
        require_fund_access(fund_id, user)

    risk_data = mgr.risk_sentinel.get_risk_snapshot(mgr.portfolio_value)
    risk_data.fund_id = fund_id

    # Use fund-specific settings if available
    fund = data_store.get_fund(fund_id) if data_store and fund_id else None
    daily_loss_limit = fund.daily_loss_limit if fund else settings.DAILY_LOSS_LIMIT
    current_phase = fund.phase if fund else settings.CURRENT_PHASE.value
    execution_mode = fund.execution_mode if fund else settings.EXECUTION_MODE.value

    return {
        "fund_id": fund_id,
        "risk": risk_data.dict(),
        "daily_loss_limit": daily_loss_limit,
        "current_phase": current_phase,
        "execution_mode": execution_mode,
    }


# ─── Strategy Library Screen (Phase 2) ──────────────────

@router.get("/strategies/library")
async def get_strategy_library(
    fund_id: str = Query(default="", description="Fund ID"),
    user: User = Depends(verify_token),
):
    """All strategies with performance metrics and filters."""
    mgr = get_manager()
    fund_id = get_fund_or_default(fund_id)
    if fund_id:
        require_fund_access(fund_id, user)

    strategies = [s for s in mgr.strategy_engine.strategies if not fund_id or s.fund_id == fund_id]
    return {
        "fund_id": fund_id,
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
    fund_id: str = Query(default="", description="Fund ID"),
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
    fund_id: str = Query(default="", description="Fund ID"),
    user: User = Depends(require_owner),
):
    """Confirm switch Phase 1 → 2 → 3 (per fund)."""
    fund_id = get_fund_or_default(fund_id)
    fund = data_store.get_fund(fund_id) if data_store and fund_id else None

    if fund:
        # Per-fund phase transition
        phase_map = {"phase_2": "phase_2", "phase_3": "phase_3"}
        target_phase = phase_map.get(target)
        if not target_phase:
            raise HTTPException(status_code=400, detail="Invalid target phase")

        valid = (fund.phase == "phase_1" and target == "phase_2") or \
                (fund.phase == "phase_2" and target == "phase_3")
        if not valid:
            raise HTTPException(status_code=400, detail="Phase transition not allowed")

        fund.phase = target_phase
        exec_map = {"phase_1": "supervised", "phase_2": "semi_autonomous", "phase_3": "fully_autonomous"}
        fund.execution_mode = exec_map.get(target_phase, fund.execution_mode)

        return {
            "success": True,
            "fund_id": fund_id,
            "current_phase": fund.phase,
            "execution_mode": fund.execution_mode,
        }

    # Fallback: global transition
    mgr = get_manager()
    phase_enum_map = {"phase_2": Phase.PHASE_2, "phase_3": Phase.PHASE_3}
    target_phase = phase_enum_map.get(target)
    if not target_phase:
        raise HTTPException(status_code=400, detail="Invalid target phase")

    success = mgr.transition_phase(target_phase)
    if not success:
        raise HTTPException(status_code=400, detail="Phase transition not allowed")

    return {
        "success": True,
        "fund_id": fund_id,
        "current_phase": settings.CURRENT_PHASE.value,
        "execution_mode": settings.EXECUTION_MODE.value,
    }


@router.post("/controls/daily-loss-limit")
async def set_daily_loss_limit(
    limit: float,
    fund_id: str = Query(default="", description="Fund ID"),
    user: User = Depends(require_owner),
):
    """Set and adjust the kill-switch threshold (per fund)."""
    fund_id = get_fund_or_default(fund_id)
    fund = data_store.get_fund(fund_id) if data_store and fund_id else None

    if fund:
        fund.daily_loss_limit = limit
        return {"fund_id": fund_id, "daily_loss_limit": fund.daily_loss_limit}

    mgr = get_manager()
    mgr.set_daily_loss_limit(limit)
    return {"fund_id": fund_id, "daily_loss_limit": settings.DAILY_LOSS_LIMIT}


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
async def emergency_stop(
    fund_id: str = Query(default="", description="Fund ID"),
    user: User = Depends(require_owner),
):
    """Immediately close all trades and halt all execution."""
    mgr = get_manager()
    fund_id = get_fund_or_default(fund_id)

    # Mark fund as emergency
    fund = data_store.get_fund(fund_id) if data_store and fund_id else None
    if fund:
        fund.emergency_active = True

    result = await mgr.emergency_stop()
    result["fund_id"] = fund_id

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
async def get_investor_portfolio(
    fund_id: str = Query(default="", description="Fund ID"),
    user: User = Depends(require_investor),
):
    """Read-only investor portal — scoped to investor's fund."""
    fund_id = get_fund_or_default(fund_id)
    if fund_id:
        require_fund_access(fund_id, user)

    mgr = get_manager()
    report = mgr.compliance_capital.generate_investor_report()
    report.fund_id = fund_id
    return report


@router.get("/investor/performance")
async def get_investor_performance(
    fund_id: str = Query(default="", description="Fund ID"),
    user: User = Depends(require_investor),
):
    """Monthly performance breakdown for investors."""
    fund_id = get_fund_or_default(fund_id)
    if fund_id:
        require_fund_access(fund_id, user)

    mgr = get_manager()
    return {
        "fund_id": fund_id,
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
