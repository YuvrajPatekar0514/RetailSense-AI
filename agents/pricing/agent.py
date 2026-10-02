"""
RetailSense AI — Pricing & Promotion Agent
"""

import logging
from typing import Dict, Any
from agents.state import AgentState
from tools.pricing_tools import get_current_price, get_sales_trend, simulate_promotion

logger = logging.getLogger("PricingPromotionAgent")


def run_pricing_agent(state: AgentState) -> AgentState:
    """
    Executes Pricing & Promotion Agent logic.
    Analyzes current price margins, sales trends, and simulates promotional discount impacts.
    """
    goal = state.get("goal", "")
    logger.info(f"[PricingPromotionAgent] Executing pricing analysis for goal: '{goal}'")

    product_id = "PROD_BEA_001"
    for word in goal.split():
        if "PROD_" in word:
            product_id = word.strip(".,!?")

    price_res = get_current_price(product_id=product_id)
    trend_res = get_sales_trend(target=product_id, days=30)
    promo_res = simulate_promotion(product_id=product_id, discount_pct=15.0, duration_days=7)

    pricing_output = {
        "status": "success",
        "current_pricing": price_res["data"],
        "sales_trend": trend_res["data"],
        "promotion_simulation": promo_res["data"]
    }

    state["agent_results"]["PricingPromotionAgent"] = pricing_output
    state["tool_results"]["get_current_price"] = price_res["data"]
    state["tool_results"]["simulate_promotion"] = promo_res["data"]
    state["completed_tasks"].append("pricing_optimization")

    return state
