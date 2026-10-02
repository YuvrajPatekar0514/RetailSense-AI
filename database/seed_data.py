"""
RetailSense AI — Optimized Idempotent Database Seeder Script

Imports cleaned transaction records and generated supporting datasets (products, suppliers,
customers, orders, returns, promotions, stores, inventory, users) into the database.

Guarantees ZERO duplication on repeated execution with ultra-fast set lookups.
"""

import os
import sys
import asyncio

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pandas as pd
from datetime import datetime
from sqlalchemy import select
from database.session import AsyncSessionLocal, engine, Base
from database.models.models import (
    User, Product, Store, Sale, Inventory, Customer, Order, OrderItem,
    Supplier, Return, Promotion, AgentTask, AgentMessage, AgentRun, ToolCall,
    Recommendation, Approval, Document, DocumentChunk
)

from backend.app.core.config import settings
from backend.app.core.security import get_password_hash


async def seed_users(session):
    """Seed development-only demo users without changing existing accounts."""
    if settings.APP_ENV.lower() != "development":
        print("[Seed] Demo users skipped outside development environment.")
        return

    default_users = [
        {"user_id": "USER_ADMIN", "email": "admin@retailsense.ai", "raw_password": "admin123", "full_name": "System Administrator", "role": "admin"},
        {"user_id": "USER_RETAIL_MGR", "email": "retail.manager@retailsense.ai", "raw_password": "manager123", "full_name": "Sarah Jenkins", "role": "retail_manager"},
        {"user_id": "USER_INVENTORY_MGR", "email": "inventory.manager@retailsense.ai", "raw_password": "inventory123", "full_name": "Marcus Vance", "role": "inventory_manager"},
        {"user_id": "USER_PROCUREMENT_MGR", "email": "procurement.manager@retailsense.ai", "raw_password": "procurement123", "full_name": "Elena Rostova", "role": "procurement_manager"},
        {"user_id": "USER_ANALYST", "email": "analyst@retailsense.ai", "raw_password": "analyst123", "full_name": "David Chen", "role": "analyst"},
        {"user_id": "USER_SUPPORT", "email": "customer.support@retailsense.ai", "raw_password": "support123", "full_name": "Priya Sharma", "role": "customer_support"},
        {"user_id": "USER_VIEWER", "email": "viewer@retailsense.ai", "raw_password": "viewer123", "full_name": "Auditor View", "role": "viewer"},
        {"user_id": "USER_SELLER", "email": "seller@retailsense.ai", "raw_password": "seller123", "full_name": "Store Operations Manager", "role": "retail_manager"},
        {"user_id": "USER_CUSTOMER", "email": "customer@retailsense.ai", "raw_password": "customer123", "full_name": "Ava Hall", "role": "viewer"}
    ]

    result = await session.execute(select(User))
    existing_users = {u.email: u for u in result.scalars().all()}
    
    inserted = 0
    skipped = 0
    for u_data in default_users:
        email = u_data["email"]
        if email in existing_users:
            skipped += 1
            continue

        user_data = {
            key: value for key, value in u_data.items() if key != "raw_password"
        }
        user_data["hashed_password"] = get_password_hash(u_data["raw_password"])
        session.add(User(**user_data))
        inserted += 1

    await session.commit()
    print(f"[Seed] Users: {inserted} inserted, {skipped} existing accounts unchanged.")




async def seed_stores(session):
    """Seeds retail stores representing regional countries."""
    countries = ["USA", "Canada", "UK", "Germany", "France", "Japan", "Australia", "India", "Brazil", "Mexico"]
    existing = set((await session.execute(select(Store.store_id))).scalars().all())
    inserted = 0

    for c in countries:
        sid = f"STORE_{c.upper().replace(' ', '_')}"
        if sid not in existing:
            session.add(Store(
                store_id=sid,
                store_name=f"RetailSense Hub ({c})",
                country=c,
                city=f"Capital ({c})"
            ))
            inserted += 1
    print(f"[Seed] Stores: {inserted} new records added.")


async def seed_products(session):
    """Seeds product catalog from data/generated/products.csv."""
    path = "data/generated/products.csv"
    if not os.path.exists(path):
        return

    df = pd.read_csv(path)
    existing = set((await session.execute(select(Product.product_id))).scalars().all())
    inserted = 0

    for _, row in df.iterrows():
        pid = str(row["product_id"])
        if pid not in existing:
            session.add(Product(
                product_id=pid,
                product_name=str(row["product_name"]),
                category=str(row["category"]),
                subcategory=str(row.get("subcategory")),
                brand=str(row.get("brand")),
                description=str(row.get("description")),
                cost_price=float(row["cost_price"]),
                selling_price=float(row["selling_price"]),
                warranty_days=int(row["warranty_days"]),
                returnable=bool(row["returnable"])
            ))
            inserted += 1
    print(f"[Seed] Products: {inserted} new records added.")


async def seed_suppliers(session):
    """Seeds suppliers from data/generated/suppliers.csv."""
    path = "data/generated/suppliers.csv"
    if not os.path.exists(path):
        return

    df = pd.read_csv(path)
    existing = set((await session.execute(select(Supplier.supplier_id))).scalars().all())
    inserted = 0

    for _, row in df.iterrows():
        sid = str(row["supplier_id"])
        if sid not in existing:
            session.add(Supplier(
                supplier_id=sid,
                supplier_name=str(row["supplier_name"]),
                product_id=str(row["product_id"]),
                unit_cost=float(row["unit_cost"]),
                lead_time_days=int(row["lead_time_days"]),
                minimum_order_qty=int(row["minimum_order_qty"]),
                available_quantity=int(row["available_quantity"]),
                reliability_score=float(row["reliability_score"]),
                city=str(row.get("city"))
            ))
            inserted += 1
    print(f"[Seed] Suppliers: {inserted} new records added.")


async def seed_customers(session):
    """Seeds customer profiles from data/generated/customers.csv."""
    path = "data/generated/customers.csv"
    if not os.path.exists(path):
        return

    df = pd.read_csv(path)
    existing = set((await session.execute(select(Customer.customer_id))).scalars().all())
    inserted = 0

    for _, row in df.iterrows():
        cid = str(row["customer_id"])
        if cid not in existing:
            session.add(Customer(
                customer_id=cid,
                customer_name=str(row["customer_name"]),
                city=str(row.get("city")),
                age_group=str(row.get("age_group")),
                preferred_category=str(row.get("preferred_category")),
                budget_range=str(row.get("budget_range")),
                loyalty_level=str(row.get("loyalty_level", "Bronze"))
            ))
            inserted += 1
    print(f"[Seed] Customers: {inserted} new records added.")


async def seed_orders(session):
    """Seeds orders and order items from data/generated/orders.csv."""
    path = "data/generated/orders.csv"
    if not os.path.exists(path):
        return

    df = pd.read_csv(path)
    existing = set((await session.execute(select(Order.order_id))).scalars().all())
    inserted = 0

    for _, row in df.iterrows():
        oid = str(row["order_id"])
        if oid not in existing:
            del_date = pd.to_datetime(row["delivery_date"]) if pd.notnull(row["delivery_date"]) else None
            session.add(Order(
                order_id=oid,
                customer_id=str(row["customer_id"]),
                product_id=str(row["product_id"]),
                store_id=str(row["store_id"]),
                order_date=pd.to_datetime(row["order_date"]),
                quantity=int(row["quantity"]),
                unit_price=float(row["unit_price"]),
                discount=float(row["discount"]),
                payment_status=str(row["payment_status"]),
                order_status=str(row["order_status"]),
                delivery_date=del_date
            ))

            total_p = (int(row["quantity"]) * float(row["unit_price"])) - float(row["discount"])
            session.add(OrderItem(
                order_id=oid,
                product_id=str(row["product_id"]),
                quantity=int(row["quantity"]),
                unit_price=float(row["unit_price"]),
                total_price=total_p
            ))
            inserted += 1
    print(f"[Seed] Orders & OrderItems: {inserted} new records added.")


async def seed_returns(session):
    """Seeds customer return records from data/generated/returns.csv."""
    path = "data/generated/returns.csv"
    if not os.path.exists(path):
        return

    df = pd.read_csv(path)
    existing = set((await session.execute(select(Return.return_id))).scalars().all())
    inserted = 0

    for _, row in df.iterrows():
        rid = str(row["return_id"])
        if rid not in existing:
            session.add(Return(
                return_id=rid,
                order_id=str(row["order_id"]),
                customer_id=str(row["customer_id"]),
                product_id=str(row["product_id"]),
                return_date=pd.to_datetime(row["return_date"]),
                return_reason=str(row["return_reason"]),
                return_status=str(row["return_status"]),
                refund_amount=float(row["refund_amount"])
            ))
            inserted += 1
    print(f"[Seed] Returns: {inserted} new records added.")


async def seed_promotions(session):
    """Seeds promotional campaigns from data/generated/promotions.csv."""
    path = "data/generated/promotions.csv"
    if not os.path.exists(path):
        return

    df = pd.read_csv(path)
    existing = set((await session.execute(select(Promotion.promotion_id))).scalars().all())
    inserted = 0

    for _, row in df.iterrows():
        pr_id = str(row["promotion_id"])
        if pr_id not in existing:
            session.add(Promotion(
                promotion_id=pr_id,
                product_id=str(row["product_id"]),
                promotion_type=str(row["promotion_type"]),
                discount_pct=float(row["discount_pct"]),
                start_date=pd.to_datetime(row["start_date"]),
                end_date=pd.to_datetime(row["end_date"]),
                target_category=str(row["target_category"])
            ))
            inserted += 1
    print(f"[Seed] Promotions: {inserted} new records added.")


async def seed_sales(session, limit: int = 5000):
    """Seeds sales transactions from processed_retail.csv (idempotent sample batch for fast seeding)."""
    path = "data/processed/processed_retail.csv"
    if not os.path.exists(path):
        path = "data/raw/ecommerce_transactions.csv"

    if not os.path.exists(path):
        return

    df = pd.read_csv(path).head(limit)
    existing = set((await session.execute(select(Sale.transaction_id))).scalars().all())
    inserted = 0

    for _, row in df.iterrows():
        tid = int(row.get("transaction_id", row.get("Transaction_ID")))
        if tid not in existing:
            session.add(Sale(
                transaction_id=tid,
                user_name=str(row.get("user_name", row.get("User_Name"))),
                age=int(row.get("age", row.get("Age"))),
                country=str(row.get("country", row.get("Country"))),
                product_category=str(row.get("product_category", row.get("Product_Category"))),
                purchase_amount=float(row.get("purchase_amount", row.get("Purchase_Amount"))),
                payment_method=str(row.get("payment_method", row.get("Payment_Method"))),
                transaction_date=pd.to_datetime(row.get("transaction_date", row.get("Transaction_Date")))
            ))
            inserted += 1
    print(f"[Seed] Sales (Primary Transactions): {inserted} new records added.")


async def seed_inventory(session):
    """Seeds inventory records for products x stores."""
    prod_stmt = select(Product.product_id)
    store_stmt = select(Store.store_id)
    
    products = (await session.execute(prod_stmt)).scalars().all()
    stores = (await session.execute(store_stmt)).scalars().all()

    existing = set((await session.execute(select(Inventory.product_id, Inventory.store_id))).all())
    inserted = 0
    for pid in products:
        for sid in stores:
            if (pid, sid) not in existing:
                session.add(Inventory(
                    product_id=pid,
                    store_id=sid,
                    current_stock=150,
                    reorder_point=30,
                    lead_time_days=5,
                    safety_stock=15
                ))
                inserted += 1
    print(f"[Seed] Inventory: {inserted} new records added.")


async def run_all_seeds():
    """Executes full database initialization and idempotent seeding."""
    print("=== STAGE 1: CREATING TABLES ===")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("\n=== STAGE 2: SEEDING DATASETS ===")
    async with AsyncSessionLocal() as session:
        await seed_users(session)
        await seed_stores(session)
        await seed_products(session)
        await seed_suppliers(session)
        await seed_customers(session)
        await seed_orders(session)
        await seed_returns(session)
        await seed_promotions(session)
        await seed_sales(session, limit=2000)
        await seed_inventory(session)
        await session.commit()
    print("\n[SUCCESS] Idempotent database seeding complete!")


if __name__ == "__main__":
    asyncio.run(run_all_seeds())
