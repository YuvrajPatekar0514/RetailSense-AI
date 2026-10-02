"""
FastAPI Router — Sales Analytics
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database.session import get_db
from database.models.models import Sale
from database.repository import sales_repo

router = APIRouter(prefix="/api/v1/sales", tags=["Sales"])


@router.get("/summary")
async def get_sales_summary(db: AsyncSession = Depends(get_db)):
    return await sales_repo.get_sales_summary(db)


@router.get("/history")
async def get_sales_history(category: str = None, country: str = None, limit: int = 100, db: AsyncSession = Depends(get_db)):
    stmt = select(Sale)
    if category:
        stmt = stmt.where(Sale.product_category == category)
    if country:
        stmt = stmt.where(Sale.country == country)
    stmt = stmt.order_by(Sale.transaction_date.desc()).limit(limit)
    res = await db.execute(stmt)
    sales = res.scalars().all()
    return [
        {
            "id": s.id,
            "transaction_id": s.transaction_id,
            "user_name": s.user_name,
            "age": s.age,
            "country": s.country,
            "product_category": s.product_category,
            "purchase_amount": s.purchase_amount,
            "payment_method": s.payment_method,
            "transaction_date": s.transaction_date.strftime("%Y-%m-%d") if s.transaction_date else None
        }
        for s in sales
    ]
