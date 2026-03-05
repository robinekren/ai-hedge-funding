"""
AI Hedge Funding — Base Agent
All 8 AI agents inherit from this base class.
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from datetime import datetime

from backend.models.schemas import AgentRole, AgentStatus, AgentState

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Base class for all AI Hedge Funding agents."""

    def __init__(self, role: AgentRole):
        self.role = role
        self.state = AgentState(role=role)
        self._running = False
        self._start_time: datetime | None = None

    @property
    def is_running(self) -> bool:
        return self._running and self.state.status == AgentStatus.RUNNING

    def start(self):
        """Start the agent."""
        self._running = True
        self._start_time = datetime.utcnow()
        self.state.status = AgentStatus.RUNNING
        self.state.message = f"{self.role.value} started"
        logger.info(f"Agent {self.role.value} started")

    def pause(self):
        """Pause the agent without stopping it."""
        self._running = False
        self.state.status = AgentStatus.PAUSED
        self.state.message = f"{self.role.value} paused"
        logger.info(f"Agent {self.role.value} paused")

    def stop(self):
        """Fully stop the agent."""
        self._running = False
        self.state.status = AgentStatus.STOPPED
        self.state.message = f"{self.role.value} stopped"
        logger.info(f"Agent {self.role.value} stopped")

    def set_error(self, error_msg: str):
        """Mark agent as errored."""
        self.state.status = AgentStatus.ERROR
        self.state.errors += 1
        self.state.message = error_msg
        logger.error(f"Agent {self.role.value} error: {error_msg}")

    def heartbeat(self):
        """Update heartbeat timestamp."""
        self.state.last_heartbeat = datetime.utcnow()
        if self._start_time:
            self.state.uptime_seconds = (
                datetime.utcnow() - self._start_time
            ).total_seconds()

    def get_state(self) -> AgentState:
        """Return current agent state."""
        self.heartbeat()
        return self.state

    @abstractmethod
    async def run_cycle(self) -> dict:
        """Execute one cycle of the agent's core function.
        Returns a dict with cycle results."""
        pass

    async def run_loop(self, interval_seconds: float = 60.0):
        """Main loop — runs cycles at the given interval."""
        self.start()
        while self._running:
            try:
                result = await self.run_cycle()
                self.state.tasks_completed += 1
                self.heartbeat()
                logger.debug(f"{self.role.value} cycle complete: {result}")
            except Exception as e:
                self.set_error(str(e))
            await asyncio.sleep(interval_seconds)
