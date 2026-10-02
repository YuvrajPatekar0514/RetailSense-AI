"""
Return Repository — Database CRUD and queries for Returns.
"""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.models.models import Return


async def get_returns_by_status(session: AsyncSession, status: str = "Refunded") -> List[Return]:
    """Lists customer return records filtered by status."""
    stmt = select(Return).where(Return.return_status == status)
    res = await session.execute(stmt)
    return list(res.scalars().all())


async def create_return_request(session: AsyncSession, return_data: dict) -> Return:
    """Creates a new customer return request record."""
    ret = Return(**return_data)
    session.add(ret)
    await session.commit()
    await session.refresh(ret)
    return ret
