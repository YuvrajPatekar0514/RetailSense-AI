# Agent Tool Reference

`tools/registry.py` lists 23 domain functions in `ALL_TOOLS`. Agents currently import and call functions directly; the registry's seller/customer/admin tool-name lists are not enforced by the graph. Functions are local Python code, not standalone HTTP services.

## Tool Families

| Module | Functions in the registry | Purpose |
|---|---|---|
| `tools/sales_tools.py` | `get_sales_history`, `get_product_sales`, `get_store_sales` | Read transaction aggregates/history |
| `tools/demand_tools.py` | `forecast_demand_tool` (`forecast_demand` registry key) | Load the demand predictor for inference |
| `tools/inventory_tools.py` | `get_inventory`, `calculate_stockout_risk`, `calculate_overstock_risk`, `calculate_reorder_quantity` | Read stock and calculate risk/reorder values |
| `tools/product_tools.py` | `search_products`, `get_product_details` | Search/read catalog items |
| `tools/supplier_tools.py` | `get_suppliers_for_product`, `compare_suppliers`, `calculate_procurement_cost` | Compare supplier attributes and estimate order cost |
| `tools/pricing_tools.py` | `get_current_price`, `get_sales_trend`, `simulate_promotion` | Read pricing/trends and simulate a discount |
| `tools/customer_tools.py` | `get_customer_profile`, `get_customer_purchase_history`, `recommend_products` | Read profile/orders and apply category/loyalty recommendation rules |
| `tools/order_tools.py` | `get_order`, `get_order_status` | Read order details and status |
| `tools/return_tools.py` | `check_return_eligibility`, `create_return_request` | Evaluate eligibility and write a return request |

## Response and Execution

`tools/base.py` defines a Pydantic `ToolResponse` with `success`, `tool_name`, `data`, `error`, and an execution timestamp. Many domain functions use this response and convert it to JSON-safe data. The helper `make_json_safe` handles dates, NumPy values, containers, and Pydantic objects.

Input validation is not uniform across every function. Some inputs use Pydantic models and bounds; other functions accept primitive arguments directly. Error handling is implemented in individual tool functions, so consumers should check `success` and not assume `data` is populated. Some agent nodes currently assume nested response keys exist.

`run_async` runs async repository work from the synchronous tool functions. Tool modules use SQLAlchemy sessions and repository helpers for reads. The return request tool writes to the return repository. Tools do not execute arbitrary model-generated SQL, but they are not read-only.

## Agent-to-Tool Calls

- Demand node: `forecast_demand_tool`.
- Inventory node: `get_inventory`, `calculate_stockout_risk`, `calculate_reorder_quantity`; it imports but does not call `calculate_overstock_risk`.
- Procurement node: `compare_suppliers`, `calculate_procurement_cost`; it does not submit a purchase order.
- Pricing node: `get_current_price`, `get_sales_trend`, `simulate_promotion` with a fixed 15% example discount.
- Personalization node: `get_customer_profile`, `recommend_products`.
- Support node: `get_order`, `get_order_status`.
- Returns node: `check_return_eligibility` and, when eligible, `create_return_request`.

See [AI_AGENTS.md](AI_AGENTS.md) for node behavior and assumptions.

## Logging, Persistence, and Security

Tool functions use Python's `RetailSenseTools` logger. The agent runner's `tool_results` and `audit_trail` are in-memory state returned in the response. The current execution path does not persist every invocation to the `ToolCall` or `AgentRun` ORM models despite those tables existing.

The registry's role lists are descriptive metadata only; graph execution does not consult them. API authentication is also not supplied by the tool registry. Protect the HTTP endpoints that expose tools, especially agent execution and data-changing operations. See [API_GUIDE.md](API_GUIDE.md) and [SECURITY.md](SECURITY.md).