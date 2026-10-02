"""
FastAPI Router — Inventory & Stock Management
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.session import get_db
from database.models.models import Inventory

router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"])


@router.get("/items")
async def list_inventory_items(limit: int = 100, db: AsyncSession = Depends(get_db)):
    stmt = select(Inventory).limit(limit)
    res = await db.execute(stmt)
    items = res.scalars().all()
    return [
        {
            "id": i.id,
            "product_id": i.product_id,
            "store_id": i.store_id,
            "current_stock": i.current_stock,
            "reorder_point": i.reorder_point,
            "lead_time_days": i.lead_time_days,
            "safety_stock": i.safety_stock,
            "forecast_7d_units": i.forecast_7d_units,
            "stockout_risk": i.stockout_risk,
            "overstock_risk": i.overstock_risk,
            "recommended_order_qty": i.recommended_order_qty
        }
        for i in items
    ]
