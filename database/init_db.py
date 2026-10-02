"""
RetailSense AI — Database Initialization Module

Creates all tables defined in SQLAlchemy models if they do not exist.
"""

import asyncio
import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database.session import engine, Base
from database.models.models import *  # Import all 19 models


async def init_models():
    """Asynchronously creates database tables."""
    print("=== INITIALIZING RETAILSENSE AI DATABASE TABLES ===")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully!")


def main():
    asyncio.run(init_models())


if __name__ == "__main__":
    main()
