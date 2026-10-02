"""
RetailSense AI — Customer Personalization & Customer Support Agents
"""

import logging
from typing import Dict, Any
from agents.state import AgentState
from tools.customer_tools import get_customer_profile, recommend_products, get_customer_purchase_history
from tools.order_tools import get_order, get_order_status

logger_pers = logging.getLogger("CustomerPersonalizationAgent")
logger_supp = logging.getLogger("CustomerSupportAgent")


def run_customer_personalization_agent(state: AgentState) -> AgentState:
    """
    Executes Customer Personalization Agent logic.
    Retrieves customer profiles and generates personalized product recommendations.
    """
    goal = state.get("goal", "")
    logger_pers.info(f"[CustomerPersonalizationAgent] Executing personalization for goal: '{goal}'")

    customer_id = "CUST_001"
    g_upper = goal.upper()
    if "C001" in g_upper or "CUST_001" in g_upper:
        customer_id = "CUST_001"
    else:
        for word in goal.split():
            if "CUST_" in word:
                customer_id = word.strip(".,!?")

    profile_res = get_customer_profile(customer_id=customer_id)
    recs_res = recommend_products(customer_id=customer_id, top_n=5)

    output = {
        "status": "success",
        "profile": profile_res["data"],
        "recommendations": recs_res["data"]
    }

    state["agent_results"]["CustomerPersonalizationAgent"] = output
    state["tool_results"]["recommend_products"] = recs_res["data"]
    state["completed_tasks"].append("customer_personalization")

    return state


def run_customer_support_agent(state: AgentState) -> AgentState:
    """
    Executes Customer Support Agent logic.
    Retrieves order tracking details, payment statuses, and customer interaction logs.
    """
    goal = state.get("goal", "")
    logger_supp.info(f"[CustomerSupportAgent] Executing support inquiry for goal: '{goal}'")

    order_id = "ORD_00001"
    for word in goal.split():
        if "ORD_" in word:
            order_id = word.strip(".,!?")

    order_res = get_order(order_id=order_id)
    status_res = get_order_status(order_id=order_id)

    output = {
        "status": "success",
        "order": order_res["data"],
        "order_status": status_res["data"]
    }

    state["agent_results"]["CustomerSupportAgent"] = output
    state["tool_results"]["get_order_status"] = status_res["data"]
    state["completed_tasks"].append("customer_support_inquiry")

    return state
