"""
RetailSense AI — Async Database Session & Engine Configuration

Supports PostgreSQL in production and SQLite (aiosqlite) for local development/testing.
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

# Default to SQLite fallback if DATABASE_URL is not set or refers to postgres without running daemon
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./retailsense.db")

# Fix postgresql:// to postgresql+asyncpg:// if needed
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Configure Engine
if "sqlite" in DATABASE_URL:
    engine = create_async_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})
else:
    engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

# Create Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()


async def get_db():
    """Dependency generator for async database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
