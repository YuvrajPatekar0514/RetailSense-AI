"""
RetailSense AI — Multi-Agent Execution Runner

Demonstrates full autonomous loop:
GOAL -> PLAN -> DELEGATE -> TOOL USE -> EXECUTE -> OBSERVE -> RE-PLAN -> VERIFY

Runs the multi-agent graph, prints detailed execution logs, conflict resolution,
and human approval status.
"""

import os
import sys
import json
import logging
from datetime import datetime

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agents.graph import create_retail_sense_graph
from agents.state import AgentState
from tools.base import make_json_safe

# Setup agent execution logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("RetailSenseRunner")


def execute_agent_workflow(
    goal: str,
    user_id: str = "USER_SELLER_01",
    user_role: str = "seller"
) -> AgentState:
    """
    Executes the multi-agent graph for a user goal.
    Returns final JSON-safe AgentState.
    """
    logger.info("=" * 70)
    logger.info(f"▶ STARTING MULTI-AGENT EXECUTION FOR GOAL: '{goal}'")
    logger.info("=" * 70)

    timestamp_str = datetime.utcnow().strftime("%H:%M:%S")

    initial_state: AgentState = {
        "user_id": user_id,
        "user_role": user_role,
        "goal": goal,
        "plan": [],
        "current_task": None,
        "completed_tasks": [],
        "agent_results": {},
        "tool_results": {},
        "retrieved_sources": [],
        "approval_required": False,
        "approval_status": "none",
        "execution_allowed": True,
        "final_decision": None,
        "verification_result": None,
        "errors": [],
        "messages": [{"role": "user", "sender": "User", "content": goal, "timestamp": timestamp_str}],
        "procurement_history": [],
        "retry_history": [],
        "replan_events": [],
        "audit_trail": [{
            "agent": "OrchestratorAgent",
            "action": "workflow_initiated",
            "input": {"goal": goal, "user_id": user_id, "user_role": user_role},
            "output": "Initialized state graph",
            "timestamp": timestamp_str,
            "status": "success",
            "reason": "User submitted natural language goal"
        }]
    }

    graph = create_retail_sense_graph()
    raw_final_state = graph.invoke(initial_state)

    # Convert all state fields to clean JSON-serializable primitives
    final_state = make_json_safe(raw_final_state)

    logger.info("-" * 70)
    logger.info("✔ MULTI-AGENT WORKFLOW COMPLETED")
    logger.info(f" -> Execution Plan: {final_state.get('plan')}")
    logger.info(f" -> Completed Steps: {final_state.get('completed_tasks')}")
    logger.info(f" -> Human Approval Required: {final_state.get('approval_required')} (Status: {final_state.get('approval_status')})")
    logger.info(f" -> Verification Status: {final_state.get('verification_result', {}).get('status')}")
    logger.info("=" * 70)

    return final_state


if __name__ == "__main__":
    demo_goals = [
        "Which products may go out of stock next week?",
        "Analyze stockout risk for product PROD_BEA_001 and create reorder purchase plan",
        "Optimize inventory for PROD_BEA_001 with supplier SLA failover simulation",
        "Find product recommendations for customer CUST_001 based on loyalty tier"
    ]

    for idx, goal in enumerate(demo_goals, 1):
        print(f"\n=======================================================")
        print(f" DEMO SCENARIO {idx}: {goal}")
        print(f"=======================================================")
        res_state = execute_agent_workflow(goal)
        
        print("\n--- FINAL AGENT STATE SUMMARY ---")
        print(f"Completed Tasks: {res_state['completed_tasks']}")
        print(f"Approval Required: {res_state['approval_required']}")
        print(f"Final Decision Notes: {res_state.get('final_decision', {}).get('resolution_notes', [])}")
        print(f"Verification: {res_state.get('verification_result')}")
