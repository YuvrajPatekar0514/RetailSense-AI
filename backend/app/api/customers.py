"""
FastAPI Router — Customers & Personalization
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.session import get_db
from database.models.models import Customer
from tools.customer_tools import recommend_products

router = APIRouter(prefix="/api/v1/customers", tags=["Customers"])


@router.get("")
async def list_customers(loyalty_level: str = None, limit: int = 100, db: AsyncSession = Depends(get_db)):
    stmt = select(Customer)
    if loyalty_level:
        stmt = stmt.where(Customer.loyalty_level == loyalty_level)
    stmt = stmt.limit(limit)
    res = await db.execute(stmt)
    customers = res.scalars().all()
    return [
        {
            "id": c.id,
            "customer_id": c.customer_id,
            "customer_name": c.customer_name,
            "city": c.city,
            "age_group": c.age_group,
            "preferred_category": c.preferred_category,
            "budget_range": c.budget_range,
            "loyalty_level": c.loyalty_level
        }
        for c in customers
    ]


@router.get("/{customer_id}/recommendations")
async def get_customer_recommendations(customer_id: str, top_n: int = 5):
    return recommend_products(customer_id=customer_id, top_n=top_n)
