"""
RetailSense AI — Central Tool Registry

Maps all domain tools for Seller, Customer, and Admin LangGraph agents.
"""

from typing import Dict, Any, Callable
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

# Master Tool Manifest
ALL_TOOLS: Dict[str, Callable] = {
    # Sales
    "get_sales_history": get_sales_history,
    "get_product_sales": get_product_sales,
    "get_store_sales": get_store_sales,
    # Demand
    "forecast_demand": forecast_demand_tool,
    # Inventory
    "get_inventory": get_inventory,
    "calculate_stockout_risk": calculate_stockout_risk,
    "calculate_overstock_risk": calculate_overstock_risk,
    "calculate_reorder_quantity": calculate_reorder_quantity,
    # Products
    "search_products": search_products,
    "get_product_details": get_product_details,
    # Suppliers
    "get_suppliers_for_product": get_suppliers_for_product,
    "compare_suppliers": compare_suppliers,
    "calculate_procurement_cost": calculate_procurement_cost,
    # Pricing
    "get_current_price": get_current_price,
    "get_sales_trend": get_sales_trend,
    "simulate_promotion": simulate_promotion,
    # Customer
    "get_customer_profile": get_customer_profile,
    "get_customer_purchase_history": get_customer_purchase_history,
    "recommend_products": recommend_products,
    # Orders
    "get_order": get_order,
    "get_order_status": get_order_status,
    # Returns
    "check_return_eligibility": check_return_eligibility,
    "create_return_request": create_return_request
}

SELLER_TOOLS = [
    "get_sales_history", "get_product_sales", "get_store_sales", "forecast_demand",
    "get_inventory", "calculate_stockout_risk", "calculate_overstock_risk",
    "calculate_reorder_quantity", "search_products", "get_product_details",
    "get_suppliers_for_product", "compare_suppliers", "calculate_procurement_cost",
    "get_current_price", "get_sales_trend", "simulate_promotion"
]

CUSTOMER_TOOLS = [
    "search_products", "get_product_details", "get_customer_profile",
    "get_customer_purchase_history", "recommend_products", "get_order",
    "get_order_status", "check_return_eligibility", "create_return_request"
]

ADMIN_TOOLS = list(ALL_TOOLS.keys())
