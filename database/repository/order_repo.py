"""
Order Repository — Database CRUD and queries for Orders and OrderItems.
"""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.models.models import Order, OrderItem


async def get_order_by_id(session: AsyncSession, order_id: str) -> Optional[Order]:
    """Retrieves an order by order_id."""
    stmt = select(Order).where(Order.order_id == order_id)
    res = await session.execute(stmt)
    return res.scalar_one_or_none()


async def list_orders_for_customer(session: AsyncSession, customer_id: str) -> List[Order]:
    """Lists all orders placed by a specific customer."""
    stmt = select(Order).where(Order.customer_id == customer_id)
    res = await session.execute(stmt)
    return list(res.scalars().all())


async def create_order(session: AsyncSession, order_data: dict) -> Order:
    """Creates a new order record."""
    order = Order(**order_data)
    session.add(order)
    await session.commit()
    await session.refresh(order)
    return order
