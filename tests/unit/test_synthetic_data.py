"""
Unit Tests for Synthetic Supporting-Data Foreign-Key Integrity and Generation
"""

import os
import pandas as pd


def test_generated_files_exist():
    expected_files = [
        "data/generated/products.csv",
        "data/generated/suppliers.csv",
        "data/generated/customers.csv",
        "data/generated/orders.csv",
        "data/generated/returns.csv",
        "data/generated/promotions.csv"
    ]
    for filepath in expected_files:
        assert os.path.exists(filepath), f"Generated synthetic file {filepath} missing"


def test_primary_raw_dataset_intact():
    assert os.path.exists("data/raw/ecommerce_transactions.csv"), "Primary raw dataset missing!"
    df_raw = pd.read_csv("data/raw/ecommerce_transactions.csv")
    assert len(df_raw) == 50000


def test_foreign_key_integrity():
    products = pd.read_csv("data/generated/products.csv")
    suppliers = pd.read_csv("data/generated/suppliers.csv")
    customers = pd.read_csv("data/generated/customers.csv")
    orders = pd.read_csv("data/generated/orders.csv")
    returns = pd.read_csv("data/generated/returns.csv")
    promotions = pd.read_csv("data/generated/promotions.csv")

    prod_ids = set(products["product_id"])
    cust_ids = set(customers["customer_id"])
    order_ids = set(orders["order_id"])

    # 1. Suppliers FK to Products
    assert set(suppliers["product_id"]).issubset(prod_ids), "Invalid supplier.product_id foreign keys!"

    # 2. Orders FK to Customers and Products
    assert set(orders["customer_id"]).issubset(cust_ids), "Invalid orders.customer_id foreign keys!"
    assert set(orders["product_id"]).issubset(prod_ids), "Invalid orders.product_id foreign keys!"

    # 3. Returns FK to Orders, Customers, Products
    assert set(returns["order_id"]).issubset(order_ids), "Invalid returns.order_id foreign keys!"
    assert set(returns["customer_id"]).issubset(cust_ids), "Invalid returns.customer_id foreign keys!"
    assert set(returns["product_id"]).issubset(prod_ids), "Invalid returns.product_id foreign keys!"

    # 4. Promotions FK to Products
    assert set(promotions["product_id"]).issubset(prod_ids), "Invalid promotions.product_id foreign keys!"
