"""
FastAPI Router — Orders & Fulfillment Tracking
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.session import get_db
from database.models.models import Order

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])


@router.get("")
async def list_orders(status: str = None, limit: int = 100, db: AsyncSession = Depends(get_db)):
    stmt = select(Order)
    if status:
        stmt = stmt.where(Order.order_status == status)
    stmt = stmt.order_by(Order.order_date.desc()).limit(limit)
    res = await db.execute(stmt)
    orders = res.scalars().all()
    return [
        {
            "id": o.id,
            "order_id": o.order_id,
            "customer_id": o.customer_id,
            "product_id": o.product_id,
            "store_id": o.store_id,
            "order_date": o.order_date.strftime("%Y-%m-%d") if o.order_date else None,
            "quantity": o.quantity,
            "unit_price": o.unit_price,
            "discount": o.discount,
            "total_paid": round((o.quantity * o.unit_price) - o.discount, 2),
            "payment_status": o.payment_status,
            "order_status": o.order_status,
            "delivery_date": o.delivery_date.strftime("%Y-%m-%d") if o.delivery_date else None
        }
        for o in orders
    ]
