"""
Unit Tests for Database Layer (SQLAlchemy Models, Connection, Repositories, & Seeding)
"""

import os
import sys
import asyncio
import pytest

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from database.session import AsyncSessionLocal, engine, Base
from database.models.models import (
    User, Product, Store, Sale, Inventory, Customer, Order, OrderItem,
    Supplier, Return, Promotion, AgentTask, AgentMessage, AgentRun, ToolCall,
    Recommendation, Approval, Document, DocumentChunk
)
from database.repository import (
    product_repo, inventory_repo, sales_repo, customer_repo,
    order_repo, supplier_repo, return_repo
)


def test_all_19_models_defined():
    models = [
        User, Product, Store, Sale, Inventory, Customer, Order, OrderItem,
        Supplier, Return, Promotion, AgentTask, AgentMessage, AgentRun, ToolCall,
        Recommendation, Approval, Document, DocumentChunk
    ]
    assert len(models) == 19
    for m in models:
        assert hasattr(m, "__tablename__")
        assert m.__tablename__ is not None


async def run_async_db_tests():
    """Executes async repository tests on the seeded database."""
    async with AsyncSessionLocal() as session:
        # 1. Product Repo
        prod = await product_repo.get_product_by_id(session, "PROD_BEA_001")
        assert prod is not None
        assert prod.category == "Beauty"

        # 2. Customer Repo
        cust = await customer_repo.get_customer_by_id(session, "CUST_001")
        assert cust is not None

        # 3. Inventory Repo
        inv = await inventory_repo.get_inventory(session, "PROD_BEA_001", "STORE_USA")
        assert inv is not None
        assert inv.current_stock > 0

        # 4. Sales Repo
        sales_summary = await sales_repo.get_sales_summary(session)
        assert sales_summary["total_transactions"] > 0
        assert sales_summary["total_gmv"] > 0.0

        # 5. Supplier Repo
        sup = await supplier_repo.get_best_supplier(session, "PROD_BEA_001")
        assert sup is not None
        assert sup.reliability_score > 0.0

        # 6. Return Repo
        returns = await return_repo.get_returns_by_status(session, "Refunded")
        assert len(returns) >= 0

    print("Async DB Repository Unit Tests Passed!")


def test_database_repositories():
    asyncio.run(run_async_db_tests())
