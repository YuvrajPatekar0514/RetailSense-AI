"""
RetailSense AI — Returns Resolution Agent
"""

import logging
from typing import Dict, Any
from agents.state import AgentState
from tools.return_tools import check_return_eligibility, create_return_request

logger = logging.getLogger("ReturnsResolutionAgent")


def run_returns_agent(state: AgentState) -> AgentState:
    """
    Executes Returns Resolution Agent logic.
    Evaluates return policy eligibility and processes automated return/refund requests.
    """
    goal = state.get("goal", "")
    logger.info(f"[ReturnsResolutionAgent] Executing returns resolution for goal: '{goal}'")

    order_id = "ORD_00001"
    for word in goal.split():
        if "ORD_" in word:
            order_id = word.strip(".,!?")

    elig_res = check_return_eligibility(order_id=order_id)
    
    if elig_res["success"] and elig_res["data"]["eligible"]:
        req_res = create_return_request(order_id=order_id, return_reason="Customer Requested Return")
        return_payload = req_res["data"]
    else:
        return_payload = elig_res["data"]

    output = {
        "status": "success",
        "return_resolution": return_payload
    }

    state["agent_results"]["ReturnsResolutionAgent"] = output
    state["tool_results"]["check_return_eligibility"] = elig_res["data"]
    state["completed_tasks"].append("returns_resolution")

    return state
