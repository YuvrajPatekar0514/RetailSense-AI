# RetailSense AI — Agent Tool Layer Specification & API Reference

## 1. Overview & Tool Execution Guarantees

In **RetailSense AI**, autonomous agents (Seller Agent, Customer Agent, Admin Overseer Agent) interact with system repositories, databases, and ML models strictly through **explicit, encapsulated function tools**.

> [!IMPORTANT]
> **SECURITY & TOOL SAFETY PRINCIPLES**:
> 1. **No Direct DB Mutations**: Agents cannot run arbitrary SQL or directly mutate database tables.
> 2. **Pydantic Input Validation**: Every tool validates argument data types and value boundaries using Pydantic schemas.
> 3. **Structured Response Output**: Every tool returns a uniform `ToolResponse` object (`success`, `tool_name`, `data`, `error`, `execution_timestamp`).
> 4. **Execution Logging**: All tool invocations, input parameters, and execution outcomes are logged to system audit logs.
> 5. **Credential Protection**: Database connection strings, API keys, and environment secrets are never exposed in tool outputs.

---

## 2. Standardized Response Format

All 22 tools return a JSON payload adhering to the `ToolResponse` schema:

```json
{
  "success": true,
  "tool_name": "forecast_demand",
  "data": {
    "product_id": "PROD_BEA_001",
    "prediction_horizon_days": 7,
    "predicted_demand_daily": [9.52, 9.63, 9.67, 9.65, 9.56, 9.42, 9.27],
    "total_predicted_units": 66.72,
    "model_name": "Random Forest Regressor"
  },
  "error": null,
  "execution_timestamp": "2026-10-01T23:31:09.382000"
}
```

---

## 3. Tool Manifest by Functional Domain

### 3.1 Sales Tools (`tools/sales_tools.py`)
- `get_sales_history(category=None, limit=100)`: Retrieves historical sales transaction records and overall GMV metrics.
- `get_product_sales(product_id, limit=50)`: Retrieves sales volume and revenue history for a specific product or category.
- `get_store_sales(store_id, limit=50)`: Retrieves regional sales performance for a retail store hub.

### 3.2 Demand Tools (`tools/demand_tools.py`)
- `forecast_demand(product_id, store_id="STORE_USA", horizon_days=7)`: Predicts multi-day future unit demand using trained Random Forest / XGBoost ML models.

### 3.3 Inventory Tools (`tools/inventory_tools.py`)
- `get_inventory(product_id, store_id="STORE_USA")`: Queries current stock levels, safety stock, and reorder points.
- `calculate_stockout_risk(product_id, store_id="STORE_USA", horizon_days=7)`: Computes stockout probability risk score based on stock vs forecast demand.
- `calculate_overstock_risk(product_id, store_id="STORE_USA", horizon_days=30)`: Computes overstock risk score and capital lockup indicators.
- `calculate_reorder_quantity(product_id, store_id="STORE_USA", target_days_cover=14)`: Calculates optimal reorder quantity considering lead time and MOQ.

### 3.4 Product Tools (`tools/product_tools.py`)
- `search_products(query=None, category=None, limit=50)`: Searches catalog products by keyword or category.
- `get_product_details(product_id)`: Retrieves full product specs, selling price, warranty, and returnability rules.

### 3.5 Supplier Tools (`tools/supplier_tools.py`)
- `get_suppliers_for_product(product_id)`: Lists vendor suppliers offering a specific catalog item.
- `compare_suppliers(product_id)`: Ranks suppliers by unit cost, lead time, and reliability score to identify the optimal vendor.
- `calculate_procurement_cost(product_id, quantity, supplier_id=None)`: Computes total wholesale order cost, shipping estimates, and expected lead times.

### 3.6 Pricing Tools (`tools/pricing_tools.py`)
- `get_current_price(product_id)`: Retrieves selling price, cost price, and gross profit margin.
- `get_sales_trend(target, days=30)`: Analyzes recent sales trend direction (UPWARD / STABLE / DOWNWARD).
- `simulate_promotion(product_id, discount_pct, duration_days=7)`: Simulates unit lift, promotional revenue, and profit margin delta.

### 3.7 Customer Tools (`tools/customer_tools.py`)
- `get_customer_profile(customer_id)`: Retrieves customer demographic profile, city, and loyalty tier.
- `get_customer_purchase_history(customer_id, limit=50)`: Retrieves past orders and total lifetime spend.
- `recommend_products(customer_id, top_n=5)`: Generates personalized product recommendations with loyalty discounts.

### 3.8 Order Tools (`tools/order_tools.py`)
- `get_order(order_id)`: Retrieves full order details, pricing, items, and status.
- `get_order_status(order_id)`: Retrieves current order delivery tracking status.

### 3.9 Return Tools (`tools/return_tools.py`)
- `check_return_eligibility(order_id)`: Evaluates order return eligibility based on delivery status, 30-day return window, and product policy.
- `create_return_request(order_id, return_reason)`: Files an approved return request and generates refund instructions.

---

## 4. Agent Role Permission Matrix (`tools/registry.py`)

| Tool Name | Seller Agent | Customer Agent | Admin Overseer Agent |
| :--- | :---: | :---: | :---: |
| `get_sales_history` | ✅ | ❌ | ✅ |
| `get_product_sales` | ✅ | ❌ | ✅ |
| `get_store_sales` | ✅ | ❌ | ✅ |
| `forecast_demand` | ✅ | ❌ | ✅ |
| `get_inventory` | ✅ | ❌ | ✅ |
| `calculate_stockout_risk` | ✅ | ❌ | ✅ |
| `calculate_overstock_risk` | ✅ | ❌ | ✅ |
| `calculate_reorder_quantity` | ✅ | ❌ | ✅ |
| `search_products` | ✅ | ✅ | ✅ |
| `get_product_details` | ✅ | ✅ | ✅ |
| `get_suppliers_for_product` | ✅ | ❌ | ✅ |
| `compare_suppliers` | ✅ | ❌ | ✅ |
| `calculate_procurement_cost` | ✅ | ❌ | ✅ |
| `get_current_price` | ✅ | ✅ | ✅ |
| `get_sales_trend` | ✅ | ❌ | ✅ |
| `simulate_promotion` | ✅ | ❌ | ✅ |
| `get_customer_profile` | ❌ | ✅ | ✅ |
| `get_customer_purchase_history` | ❌ | ✅ | ✅ |
| `recommend_products` | ❌ | ✅ | ✅ |
| `get_order` | ✅ | ✅ | ✅ |
| `get_order_status` | ❌ | ✅ | ✅ |
| `check_return_eligibility` | ❌ | ✅ | ✅ |
| `create_return_request` | ❌ | ✅ | ✅ |
