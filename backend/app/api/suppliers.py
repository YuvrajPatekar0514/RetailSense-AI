"""
FastAPI Router — Suppliers & Vendor Operations
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.session import get_db
from database.models.models import Supplier

router = APIRouter(prefix="/api/v1/suppliers", tags=["Suppliers"])


@router.get("")
async def list_suppliers(limit: int = 100, db: AsyncSession = Depends(get_db)):
    stmt = select(Supplier).limit(limit)
    res = await db.execute(stmt)
    suppliers = res.scalars().all()
    return [
        {
            "id": s.id,
            "supplier_id": s.supplier_id,
            "supplier_name": s.supplier_name,
            "product_id": s.product_id,
            "unit_cost": s.unit_cost,
            "lead_time_days": s.lead_time_days,
            "minimum_order_qty": s.minimum_order_qty,
            "available_quantity": s.available_quantity,
            "reliability_score": s.reliability_score,
            "city": s.city
        }
        for s in suppliers
    ]
