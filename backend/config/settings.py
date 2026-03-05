"""
AI Hedge Funding — Configuration Settings
All locked decisions from the blueprint are codified here.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from enum import Enum
from typing import Optional


class Phase(str, Enum):
    PHASE_1 = "phase_1"  # Supervised
    PHASE_2 = "phase_2"  # Semi-Autonomous
    PHASE_3 = "phase_3"  # Fully Autonomous


class ExecutionMode(str, Enum):
    SUPERVISED = "supervised"        # AI proposes → Human approves
    SEMI_AUTONOMOUS = "semi_autonomous"  # Autonomous + Daily-Loss Kill Switch
    FULLY_AUTONOMOUS = "fully_autonomous"  # 100% autonomous


class MetaLearnerMode(str, Enum):
    SUPERVISED = "supervised"    # Human approves deployments
    AUTONOMOUS = "autonomous"    # Auto-deploys after proven track record


class Settings(BaseSettings):
    # === LOCKED DECISIONS ===
    FUND_NAME: str = "AI Hedge Funding"
    LEGAL_ENTITY: str = "Eko Growth LLC"
    LEGAL_STATE: str = "Wyoming"
    TEAM_OWNER: str = "Robin"
    TEAM_CTO: str = "Felix"

    # === PHASE CONTROL (defaults for new funds) ===
    CURRENT_PHASE: Phase = Phase.PHASE_1
    EXECUTION_MODE: ExecutionMode = ExecutionMode.SUPERVISED
    META_LEARNER_MODE: MetaLearnerMode = MetaLearnerMode.SUPERVISED

    # === RISK CONTROLS (defaults for new funds — per-fund overrides live on Fund model) ===
    DAILY_LOSS_LIMIT: float = Field(default=1000.0, description="Default daily loss limit for new funds")
    EMERGENCY_STOP: bool = False
    MAX_POSITION_SIZE_PCT: float = 0.05  # 5% of portfolio per position
    MAX_CORRELATION: float = 0.7

    # === TARGET METRICS ===
    TARGET_ANNUAL_RETURN: float = 1.80  # 180%
    TARGET_WIN_RATE: float = 0.90  # 90%
    TARGET_SHARPE_RATIO: float = 2.5
    PHASE_1_STRATEGY_TARGET: int = 100
    PHASE_2_STRATEGY_TARGET: int = 315

    # === BROKER KEYS ===
    ALPACA_API_KEY: str = ""
    ALPACA_SECRET_KEY: str = ""
    ALPACA_BASE_URL: str = "https://paper-api.alpaca.markets"

    IB_HOST: str = "127.0.0.1"
    IB_PORT: int = 7497
    IB_CLIENT_ID: int = 1

    # === MARKET DATA ===
    POLYGON_API_KEY: str = ""

    # === SOCIAL SCRAPING ===
    REDDIT_CLIENT_ID: str = ""
    REDDIT_CLIENT_SECRET: str = ""
    REDDIT_USER_AGENT: str = "AI Hedge Funding Signal Harvester v1.0"

    # === DATABASE ===
    AIRTABLE_API_KEY: str = ""
    AIRTABLE_BASE_ID: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # === NOTIFICATIONS ===
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = ""
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""
    TWILIO_TO_NUMBER: str = ""

    # === AUTH ===
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
