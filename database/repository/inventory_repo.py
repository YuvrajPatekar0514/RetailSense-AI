"""
Inventory Repository — Database CRUD and queries for Inventory.
"""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.models.models import Inventory


async def get_inventory(session: AsyncSession, product_id: str, store_id: str) -> Optional[Inventory]:
    """Retrieves stock inventory record for product_id and store_id."""
    stmt = select(Inventory).where(
        (Inventory.product_id == product_id) & (Inventory.store_id == store_id)
    )
    res = await session.execute(stmt)
    return res.scalar_one_or_none()


async def list_stockout_risks(session: AsyncSession, threshold: float = 0.5) -> List[Inventory]:
    """Lists inventory items with stockout risk >= threshold."""
    stmt = select(Inventory).where(Inventory.stockout_risk >= threshold)
    res = await session.execute(stmt)
    return list(res.scalars().all())


async def update_stock_and_risk(
    session: AsyncSession,
    product_id: str,
    store_id: str,
    current_stock: int,
    forecast_7d: float = None,
    stockout_risk: float = None,
    recommended_qty: float = None
) -> Optional[Inventory]:
    """Updates inventory stock level, forecast, risk, and recommended reorder quantity."""
    inv = await get_inventory(session, product_id, store_id)
    if inv:
        inv.current_stock = current_stock
        if forecast_7d is not None:
            inv.forecast_7d_units = forecast_7d
        if stockout_risk is not None:
            inv.stockout_risk = stockout_risk
        if recommended_qty is not None:
            inv.recommended_order_qty = recommended_qty
        await session.commit()
        await session.refresh(inv)
    return inv
