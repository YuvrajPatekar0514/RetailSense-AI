# AI Agents

The agent implementation is a deterministic Python workflow coordinated by `agents/graph.py`. It represents eight agent roles with nine graph nodes: planner and decision nodes for the Orchestrator plus seven domain-agent nodes. Agents exchange a shared per-run `AgentState` and call domain functions directly. They are not separate services, and the workflow does not call the standalone LLM service or a vector retriever.

| Agent | Main implementation | Business purpose | Current model/LLM |
|---|---|---|---|
| Orchestrator | `agents/orchestrator/agent.py` plus router in `agents/graph.py` | Classify a goal, plan sequential work, resolve selected conflicts, set approval state, and format verification output | Keyword rules; no LLM in graph |
| Demand Forecasting | `agents/demand/agent.py` | Return a 7-day prediction for a product | Saved demand regressor via `tools/demand_tools.py` |
| Inventory Optimization | `agents/inventory/agent.py` | Read inventory, compute stockout risk, and recommend replenishment quantity | Deterministic domain calculations plus forecast tool |
| Procurement | `agents/procurement/agent.py` | Compare supplier options and estimate purchase cost/lead time | Rule-based supplier tools; no PO creation API |
| Pricing & Promotion | `agents/pricing/agent.py` | Read price/trend and simulate a promotion | Rule-based simulation; agent supplies a 15% discount input |
| Customer Personalization | `agents/customer/agent.py` | Read profile and make category/loyalty-ranked recommendations | Rule-based catalog and loyalty logic |
| Customer Support | `agents/customer/agent.py` | Retrieve an order and its status | Database-backed order tools; no RAG in this path |
| Returns Resolution | `agents/returns/agent.py` | Check a return and create a return request when eligible | Database-backed policy checks and write tool |

## Orchestrator

- **Business problem:** Convert a high-level retail request into a fixed set of domain operations and summarize their results.
- **Inputs:** `goal`, `user_id`, `user_role`, and the shared state initialized by `agents/runner.py`.
- **Outputs:** `plan`, `completed_tasks`, `agent_results`, `tool_results`, messages, approval fields, verification result, retry/replan history, and audit-trail entries.
- **Flow:** Keyword classification selects a task category; `create_plan` returns ordered task names; the graph router selects the next uncompleted domain task; the decision node calls conflict resolution, approval calculation, and outcome verification.
- **Safety/control:** Procurement cost over $5,000 or simulated discount over 20% sets `approval_required` and `execution_allowed=False`. These values are state outputs; there is no connected persisted approval-review workflow or real purchase execution gate.
- **Verification/fallback:** The verification method checks accumulated errors and a hard-coded supplier lead-time/failover scenario. Alternative supplier details are constants in the source, not a live supplier retry.
- **Example:** An inventory/reorder goal is planned through forecast, inventory, procurement, then the decision step.
- **Status/location:** Implemented prototype; `agents/orchestrator/agent.py`, `agents/graph.py`.

## Demand Forecasting Agent

- **Business problem:** Estimate short-horizon demand to inform stock decisions.
- **Inputs/outputs:** Reads the goal for a product ID (defaults to `PROD_BEA_001`), fixes store to `STORE_USA`, and requests a 7-day horizon. Writes the tool response and a message to shared state.
- **Model/tools:** `forecast_demand_tool`; `DemandPredictor` loads the configured serialized model. The inference code predicts a base value and adds deterministic sinusoidal variation for each requested day.
- **Coordination/context:** Its result is read by the inventory agent during a combined plan. Context is per invocation only.
- **Error behavior:** Tool success flag is reflected in agent status; the agent uses display defaults if result fields are missing.
- **Human approval/verification:** No direct approval action. The Orchestrator evaluates the combined state afterward.
- **Example:** “Which products may go out of stock next week?”
- **Status/location:** Implemented with demo assumptions; `agents/demand/agent.py`, `ml/predict.py`, `tools/demand_tools.py`.

## Inventory Optimization Agent

- **Business problem:** Identify low-stock risk and calculate a replenishment quantity.
- **Inputs/outputs:** Product ID from goal or default; fixed store `STORE_USA`. Writes inventory, stockout risk, and reorder calculation into state.
- **Model/tools:** `get_inventory`, `calculate_stockout_risk`, and `calculate_reorder_quantity`; target cover is 14 days. Although `calculate_overstock_risk` is imported, this agent does not call it.
- **Coordination/context:** Procurement reads this result to choose a requested order quantity.
- **Error behavior:** Tool results are returned in the agent payload; agent currently labels its combined result `success` without checking every tool's success flag.
- **Human approval/verification:** Approval is computed later by Orchestrator, not by this agent.
- **Example:** Analyze stockout exposure for `PROD_BEA_001`.
- **Status/location:** Implemented prototype; `agents/inventory/agent.py`, `tools/inventory_tools.py`.

## Procurement Agent

- **Business problem:** Compare a product's suppliers and estimate order cost.
- **Inputs/outputs:** Product ID and optional quantity parsed from the goal; otherwise quantity comes from inventory result/default. Writes supplier comparison, cost, selected supplier, and attempt history to state.
- **Model/tools:** `compare_suppliers`, `calculate_procurement_cost`, and `get_suppliers_for_product` (the latter is imported but not used here). No live purchase-order submission is performed.
- **Coordination/context:** Reads `InventoryOptimizationAgent` output; Orchestrator examines procurement cost and lead time.
- **Error behavior:** `_safe_tool_data` handles malformed tool response shapes; missing cost fields use hard-coded demo fallbacks.
- **Human approval/verification:** Orchestrator thresholds may set approval pending. The result is an estimate, not an approved or submitted PO.
- **Example:** Estimate a 14-day-cover replenishment and compare costs.
- **Status/location:** Partial; `agents/procurement/agent.py`, `tools/supplier_tools.py`.

## Pricing & Promotion Agent

- **Business problem:** Estimate the effect of a discount alongside current price/trend data.
- **Inputs/outputs:** Product ID from goal/default; calls current price, 30-day sales trend, and a 7-day promotion simulation with a fixed 15% discount. Writes tool outputs to state.
- **Model/tools:** `get_current_price`, `get_sales_trend`, `simulate_promotion`; no elasticity model is called by this agent.
- **Coordination/context:** Can be compared with inventory stockout risk in Orchestrator conflict logic.
- **Error behavior:** Directly indexes result `data`; there is no local retry/fallback.
- **Human approval/verification:** The Orchestrator checks a discount threshold, but no live price update is executed.
- **Example:** Simulate a week-long promotion for a product.
- **Status/location:** Partial simulation; `agents/pricing/agent.py`, `tools/pricing_tools.py`.

## Customer Personalization Agent

- **Business problem:** Select products from a customer's preferred category and loyalty tier.
- **Inputs/outputs:** Customer ID parsed from goal or `CUST_001`; returns profile and top-five recommendations.
- **Model/tools:** `get_customer_profile` and `recommend_products`; recommendations are deterministic category/loyalty rules, not RFM or collaborative filtering.
- **Coordination/context:** Result is stored in shared `agent_results` and `tool_results` only.
- **Error behavior:** Tool response data is placed into output; exceptions are handled inside tool helpers.
- **Human approval/verification:** Not applicable in the current workflow.
- **Example:** Recommend products for a loyalty customer.
- **Status/location:** Implemented rule-based demo; `agents/customer/agent.py`, `tools/customer_tools.py`.

## Customer Support Agent

- **Business problem:** Answer an order status inquiry with order details.
- **Inputs/outputs:** Order ID from goal or `ORD_00001`; returns order and status tool responses.
- **Model/tools:** `get_order` and `get_order_status`; no document retrieval or LLM response generation is invoked.
- **Coordination/context:** Result is returned to the Orchestrator and shared state.
- **Error behavior:** Tool-level errors are returned in response dictionaries; the agent does not raise a structured retry.
- **Human approval/verification:** No approval step specific to support.
- **Example:** “Where is order ORD_123?”
- **Status/location:** Implemented database lookup; `agents/customer/agent.py`, `tools/order_tools.py`.

## Returns Resolution Agent

- **Business problem:** Determine return eligibility and record a request for eligible orders.
- **Inputs/outputs:** Order ID from goal or `ORD_00001`; writes eligibility or return result into shared state.
- **Model/tools:** `check_return_eligibility`, `create_return_request`; the latter writes through `return_repo`.
- **Coordination/context:** Orchestrator verifies the state after the domain node.
- **Error behavior:** Tools return structured success/error dictionaries; the agent assumes `data` exists on the eligibility result.
- **Human approval/safety:** No approval is requested before the current tool creates a return record. The implementation uses an age limit of 365 days, despite stale docs mentioning 30 days.
- **Example:** Check and file a return for a delivered, returnable order.
- **Status/location:** Partial; `agents/returns/agent.py`, `tools/return_tools.py`.

## Shared Runtime Characteristics

- **Coordination:** Sequential StateGraph transitions through a shared `AgentState`; each sub-agent returns the mutated state to the router.
- **Tool calling:** Direct Python function invocation, not LLM-generated function calls.
- **Memory:** In-memory state for one execution. No long-term conversation memory or vector index is implemented.
- **Logging:** Python logging and state-level audit lists. Durable `agent_runs` and `tool_calls` models exist, but the graph runner does not persist each run there.
- **LLM/RAG:** The optional `llm/` service is separate; `rag/` packages are empty placeholders. Static policy-like source snippets are added by the orchestrator and must not be described as retrieval.
- **Diagrams:** See [workflow](AI_AGENT_WORKFLOW.md); architecture overview is in [ARCHITECTURE.md](ARCHITECTURE.md).
