"""
Product Repository — Database CRUD and queries for Products.
"""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.models.models import Product


async def get_product_by_id(session: AsyncSession, product_id: str) -> Optional[Product]:
    """Retrieves a product by its unique product_id."""
    stmt = select(Product).where(Product.product_id == product_id)
    res = await session.execute(stmt)
    return res.scalar_one_or_none()


async def list_products(session: AsyncSession, category: Optional[str] = None, limit: int = 100) -> List[Product]:
    """Lists catalog products, optionally filtered by category."""
    stmt = select(Product)
    if category:
        stmt = stmt.where(Product.category == category)
    stmt = stmt.limit(limit)
    res = await session.execute(stmt)
    return list(res.scalars().all())


async def create_product(session: AsyncSession, product_data: dict) -> Product:
    """Creates a new catalog product."""
    product = Product(**product_data)
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


async def update_product_price(session: AsyncSession, product_id: str, new_price: float) -> Optional[Product]:
    """Updates selling price of a product."""
    product = await get_product_by_id(session, product_id)
    if product:
        product.selling_price = new_price
        await session.commit()
        await session.refresh(product)
    return product
