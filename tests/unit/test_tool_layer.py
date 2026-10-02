"""
Unit Tests for Tool Layer (Input Validation, Structured Responses, Error Handling & Execution)
"""

import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from tools.sales_tools import get_sales_history, get_product_sales, get_store_sales
from tools.demand_tools import forecast_demand_tool
from tools.inventory_tools import (
    get_inventory, calculate_stockout_risk, calculate_overstock_risk, calculate_reorder_quantity
)
from tools.product_tools import search_products, get_product_details
from tools.supplier_tools import get_suppliers_for_product, compare_suppliers, calculate_procurement_cost
from tools.pricing_tools import get_current_price, get_sales_trend, simulate_promotion
from tools.customer_tools import get_customer_profile, get_customer_purchase_history, recommend_products
from tools.order_tools import get_order, get_order_status
from tools.return_tools import check_return_eligibility, create_return_request


def test_sales_tools():
    res1 = get_sales_history(category="Beauty", limit=5)
    assert res1["success"] is True
    assert "summary" in res1["data"]

    res2 = get_store_sales(store_id="STORE_USA", limit=5)
    assert res2["success"] is True


def test_demand_tool():
    res = forecast_demand_tool(product_id="PROD_BEA_001", store_id="STORE_USA", horizon_days=7)
    assert res["success"] is True
    assert res["data"]["prediction_horizon_days"] == 7


def test_inventory_tools():
    res1 = get_inventory(product_id="PROD_BEA_001", store_id="STORE_USA")
    assert res1["success"] is True

    res2 = calculate_stockout_risk(product_id="PROD_BEA_001", store_id="STORE_USA", horizon_days=7)
    assert res2["success"] is True
    assert "stockout_risk_score" in res2["data"]

    res3 = calculate_reorder_quantity(product_id="PROD_BEA_001", store_id="STORE_USA", target_days_cover=14)
    assert res3["success"] is True


def test_product_tools():
    res1 = search_products(category="Electronics", limit=5)
    assert res1["success"] is True

    res2 = get_product_details(product_id="PROD_BEA_001")
    assert res2["success"] is True


def test_supplier_tools():
    res1 = get_suppliers_for_product(product_id="PROD_BEA_001")
    assert res1["success"] is True

    res2 = compare_suppliers(product_id="PROD_BEA_001")
    assert res2["success"] is True

    res3 = calculate_procurement_cost(product_id="PROD_BEA_001", quantity=50)
    assert res3["success"] is True
    assert res3["data"]["total_procurement_cost"] > 0


def test_pricing_tools():
    res1 = get_current_price(product_id="PROD_BEA_001")
    assert res1["success"] is True

    res2 = simulate_promotion(product_id="PROD_BEA_001", discount_pct=15.0, duration_days=7)
    assert res2["success"] is True
    assert "simulated_revenue" in res2["data"]


def test_customer_tools():
    res1 = get_customer_profile(customer_id="CUST_001")
    assert res1["success"] is True

    res2 = recommend_products(customer_id="CUST_001", top_n=3)
    assert res2["success"] is True


def test_order_and_return_tools():
    res1 = get_order(order_id="ORD_00001")
    assert res1["success"] is True

    res2 = check_return_eligibility(order_id="ORD_00001")
    assert res2["success"] is True
    assert "eligible" in res2["data"]
