# RetailSense AI — Multi-Agent System Architecture Specification

## 1. Executive System Overview

**RetailSense AI** features an autonomous, multi-agent orchestration architecture built using **LangGraph StateGraph**.

Instead of independent chatbots, the system operates as a coordinated team of **8 specialized autonomous agents** led by a master **OrchestratorAgent**.

Agents communicate exclusively through structured state transitions and messages, utilizing domain function tools to analyze data, resolve conflicts, request human approvals, and verify operational decisions.

---

## 2. The Autonomous Execution Loop

Every user request follows the explicit 8-stage autonomous lifecycle loop:

```
[USER GOAL] ──► (1. GOAL)
                   │
                   ▼
            (2. PLAN) ──────► Orchestrator classifies goal & generates step-by-step task plan
                   │
                   ▼
         (3. DELEGATE) ─────► Router node delegates sub-tasks to specialized sub-agents
                   │
                   ▼
           (4. TOOL USE) ───► Sub-agent invokes domain function tools
                   │
                   ▼
            (5. EXECUTE) ───► Tool queries DB / ML models & returns structured Pydantic payload
                   │
                   ▼
            (6. OBSERVE) ───► Orchestrator collects results & resolves conflicting agent recommendations
                   │
                   ▼
            (7. RE-PLAN) ───► Checks high-impact action thresholds (e.g. > $5,000 reorder triggers Human Approval)
                   │
                   ▼
             (8. VERIFY) ───► Verifies step completions and outputs final action plan
```

---

## 3. The 8 Specialized Agents

| Agent Name | Module File | Responsibilities | Primary Tools Used |
| :--- | :--- | :--- | :--- |
| **1. OrchestratorAgent** | `agents/orchestrator/agent.py` | Goal classification, task planning, delegation router, conflict resolution, human approval check, outcome verification | All tools via delegation |
| **2. DemandForecastingAgent** | `agents/demand/agent.py` | Generates 7d/14d/30d daily unit forecasts using trained Random Forest & XGBoost ML models | `forecast_demand` |
| **3. InventoryOptimizationAgent** | `agents/inventory/agent.py` | Monitors stock levels, computes stockout risks, overstock risks, and reorder quantities | `get_inventory`, `calculate_stockout_risk`, `calculate_overstock_risk`, `calculate_reorder_quantity` |
| **4. ProcurementAgent** | `agents/procurement/agent.py` | Evaluates supplier options, compares lead times/costs, and builds purchase order cost estimates | `get_suppliers_for_product`, `compare_suppliers`, `calculate_procurement_cost` |
| **5. PricingPromotionAgent** | `agents/pricing/agent.py` | Analyzes price margins, sales trends, and simulates promotional discount impacts | `get_current_price`, `get_sales_trend`, `simulate_promotion` |
| **6. CustomerPersonalizationAgent** | `agents/customer/agent.py` | Retrieves customer profiles, loyalty perks, and builds personalized recommendations | `get_customer_profile`, `recommend_products` |
| **7. CustomerSupportAgent** | `agents/customer/agent.py` | Handles order tracking, status inquiries, and purchase history lookups | `get_customer_purchase_history`, `get_order`, `get_order_status` |
| **8. ReturnsResolutionAgent** | `agents/returns/agent.py` | Evaluates return window eligibility and generates approved refund requests | `check_return_eligibility`, `create_return_request` |

---

## 4. Shared LangGraph State Definition (`AgentState`)

```python
class AgentState(TypedDict):
    user_id: str                              # Unique user/actor ID
    user_role: str                            # "seller" | "customer" | "admin"
    goal: str                                 # High-level operational goal
    plan: List[str]                           # Sequential step-by-step task plan
    current_task: Optional[str]               # Active step
    completed_tasks: List[str]                # History of completed steps
    agent_results: Dict[str, Any]             # Structured agent outputs
    tool_results: Dict[str, Any]              # Tool outputs
    retrieved_sources: List[Dict[str, Any]]   # RAG knowledge base sources
    approval_required: bool                   # High-impact human approval flag
    approval_status: str                      # "none" | "pending" | "approved" | "rejected"
    final_decision: Optional[Dict[str, Any]]  # Final action plan & conflict resolution notes
    verification_result: Optional[Dict[str, Any]] # Plan completion verification
    errors: List[str]                         # Execution error log
    messages: List[Dict[str, Any]]            # State message transcript
```

---

## 5. Conflict Resolution & Human Approval Thresholds

### 5.1 Conflict Resolution
When agent recommendations conflict (e.g. `PricingPromotionAgent` recommends a 20% discount while `InventoryOptimizationAgent` flags a 70% stockout risk), `OrchestratorAgent.resolve_conflicts()` overrides the promotion to protect stock integrity prior to replenishment.

### 5.2 Human-in-the-Loop Approval Thresholds
High-impact operational actions trigger `approval_required = True` and set `approval_status = "pending"`:
- **Purchase Order Threshold**: Total procurement cost > **$5,000.00**.
- **Promotional Discount Threshold**: Promotional discount > **20.0%**.

---

## 6. Execution Verification Results

Automated tests in [`tests/unit/test_agent_system.py`](file:///d:/Project/RetailSense%20AI%20-%20Multi%20Agent%20Autonomous%20Retail%20Intelligence%20&%20Decision%20System/tests/unit/test_agent_system.py) pass across all scenarios:

```bash
ALL MULTI-AGENT SYSTEM UNIT TESTS PASSED SUCCESSFULLY!
```
- Goal classification & planning: ✅ PASS
- Autonomous sub-agent delegation: ✅ PASS
- Tool invocation & observation: ✅ PASS
- High-impact human approval trigger ($8,666.54 > $5,000): ✅ PASS
- Outcome verification status (`SUCCESSFULLY_VERIFIED`): ✅ PASS
