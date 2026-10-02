"""
RetailSense AI — Inventory Optimization Agent
"""

import logging
from typing import Dict, Any
from agents.state import AgentState
from tools.inventory_tools import (
    get_inventory, calculate_stockout_risk, calculate_overstock_risk, calculate_reorder_quantity
)

logger = logging.getLogger("InventoryOptimizationAgent")


def run_inventory_agent(state: AgentState) -> AgentState:
    """
    Executes Inventory Optimization Agent logic.
    Analyzes current stock levels, stockout risks, overstock risks, and reorder requirements.
    """
    goal = state.get("goal", "")
    logger.info(f"[InventoryOptimizationAgent] Executing inventory analysis for goal: '{goal}'")

    product_id = "PROD_BEA_001"
    g_upper = goal.upper()
    if "P002" in g_upper or "PROD_ELE_002" in g_upper:
        product_id = "PROD_ELE_002"
    elif "P001" in g_upper or "PROD_BEA_001" in g_upper:
        product_id = "PROD_BEA_001"
    else:
        for word in goal.split():
            if "PROD_" in word:
                product_id = word.strip(".,!?")

    inv_res = get_inventory(product_id=product_id, store_id="STORE_USA")
    risk_res = calculate_stockout_risk(product_id=product_id, store_id="STORE_USA", horizon_days=7)
    reorder_res = calculate_reorder_quantity(product_id=product_id, store_id="STORE_USA", target_days_cover=14)

    inventory_output = {
        "status": "success",
        "inventory": inv_res["data"],
        "stockout_risk": risk_res["data"],
        "reorder_calculation": reorder_res["data"]
    }

    state["agent_results"]["InventoryOptimizationAgent"] = inventory_output
    state["tool_results"]["calculate_stockout_risk"] = risk_res["data"]
    state["tool_results"]["calculate_reorder_quantity"] = reorder_res["data"]
    state["completed_tasks"].append("inventory_optimization")

    risk_data = risk_res.get("data", {}) if risk_res and risk_res.get("success") else {}
    reorder_data = reorder_res.get("data", {}) if reorder_res and reorder_res.get("success") else {}

    risk_level = risk_data.get("risk_level", "LOW")
    risk_score = risk_data.get("stockout_risk_score", 0.0)
    rec_qty = reorder_data.get("recommended_order_quantity", 0)

    state["messages"].append({
        "sender": "InventoryOptimizationAgent",
        "role": "assistant",
        "content": f"Evaluated 7-day stockout risk for {product_id}: {risk_level} (score: {risk_score}). Based on 14-day target inventory coverage policy, replenishment reorder recommended: {rec_qty} units required.",
        "timestamp": "00:00:03"
    })

    return state

