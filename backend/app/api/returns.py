"""
FastAPI Router — Returns & Refunds
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.session import get_db
from database.models.models import Return

router = APIRouter(prefix="/api/v1/returns", tags=["Returns"])


@router.get("")
async def list_returns(status: str = None, limit: int = 100, db: AsyncSession = Depends(get_db)):
    stmt = select(Return)
    if status:
        stmt = stmt.where(Return.return_status == status)
    stmt = stmt.order_by(Return.return_date.desc()).limit(limit)
    res = await db.execute(stmt)
    returns = res.scalars().all()
    return [
        {
            "id": r.id,
            "return_id": r.return_id,
            "order_id": r.order_id,
            "customer_id": r.customer_id,
            "product_id": r.product_id,
            "return_date": r.return_date.strftime("%Y-%m-%d") if r.return_date else None,
            "return_reason": r.return_reason,
            "return_status": r.return_status,
            "refund_amount": r.refund_amount
        }
        for r in returns
    ]
