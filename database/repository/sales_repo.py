"""
Sales Repository — Database CRUD and queries for Sales transactions.
"""

from typing import List, Dict, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from database.models.models import Sale


async def get_sales_summary(session: AsyncSession) -> Dict[str, Any]:
    """Computes total transactions, total GMV, and average purchase amount."""
    stmt = select(
        func.count(Sale.id).label("total_transactions"),
        func.sum(Sale.purchase_amount).label("total_gmv"),
        func.avg(Sale.purchase_amount).label("avg_order_value")
    )
    res = await session.execute(stmt)
    row = res.one()
    return {
        "total_transactions": row.total_transactions or 0,
        "total_gmv": round(float(row.total_gmv or 0.0), 2),
        "avg_order_value": round(float(row.avg_order_value or 0.0), 2)
    }


async def list_sales_by_category(session: AsyncSession, category: str, limit: int = 100) -> List[Sale]:
    """Lists sales transactions for a given category."""
    stmt = select(Sale).where(Sale.product_category == category).limit(limit)
    res = await session.execute(stmt)
    return list(res.scalars().all())
