"""
Supplier Repository — Database CRUD and queries for Suppliers.
"""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.models.models import Supplier


async def get_suppliers_for_product(session: AsyncSession, product_id: str) -> List[Supplier]:
    """Lists all suppliers providing a given product."""
    stmt = select(Supplier).where(Supplier.product_id == product_id)
    res = await session.execute(stmt)
    return list(res.scalars().all())


async def get_best_supplier(session: AsyncSession, product_id: str) -> Optional[Supplier]:
    """Retrieves the supplier with highest reliability score and lowest lead time for a product."""
    stmt = (
        select(Supplier)
        .where(Supplier.product_id == product_id)
        .order_by(Supplier.reliability_score.desc(), Supplier.lead_time_days.asc())
        .limit(1)
    )
    res = await session.execute(stmt)
    return res.scalar_one_or_none()
