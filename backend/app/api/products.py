"""
FastAPI Router — Product Catalog
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.session import get_db
from database.models.models import Product

router = APIRouter(prefix="/api/v1/products", tags=["Products"])


@router.get("")
async def list_products(category: str = None, limit: int = 100, db: AsyncSession = Depends(get_db)):
    stmt = select(Product)
    if category:
        stmt = stmt.where(Product.category == category)
    stmt = stmt.limit(limit)
    res = await db.execute(stmt)
    products = res.scalars().all()
    return [
        {
            "id": p.id,
            "product_id": p.product_id,
            "product_name": p.product_name,
            "category": p.category,
            "subcategory": p.subcategory,
            "brand": p.brand,
            "description": p.description,
            "cost_price": p.cost_price,
            "selling_price": p.selling_price,
            "warranty_days": p.warranty_days,
            "returnable": p.returnable
        }
        for p in products
    ]
