"""
Customer Repository — Database CRUD and queries for Customers.
"""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.models.models import Customer


async def get_customer_by_id(session: AsyncSession, customer_id: str) -> Optional[Customer]:
    """Retrieves customer record by customer_id."""
    stmt = select(Customer).where(Customer.customer_id == customer_id)
    res = await session.execute(stmt)
    return res.scalar_one_or_none()


async def list_customers_by_loyalty(session: AsyncSession, loyalty_level: str) -> List[Customer]:
    """Lists customers matching loyalty tier (Bronze, Silver, Gold, Platinum)."""
    stmt = select(Customer).where(Customer.loyalty_level == loyalty_level)
    res = await session.execute(stmt)
    return list(res.scalars().all())


async def create_customer(session: AsyncSession, customer_data: dict) -> Customer:
    """Creates a new customer profile."""
    customer = Customer(**customer_data)
    session.add(customer)
    await session.commit()
    await session.refresh(customer)
    return customer
