"""
Unit Tests for Multi-Agent System (Orchestrator, Sub-Agents, State, & Graph Workflow)
"""

import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from agents.state import AgentState
from agents.orchestrator.agent import OrchestratorAgent, run_orchestrator_planning, run_orchestrator_decision
from agents.demand.agent import run_demand_agent
from agents.inventory.agent import run_inventory_agent
from agents.procurement.agent import run_procurement_agent
from agents.pricing.agent import run_pricing_agent
from agents.customer.agent import run_customer_personalization_agent, run_customer_support_agent
from agents.returns.agent import run_returns_agent
from agents.runner import execute_agent_workflow


def test_agent_state_fields():
    state: AgentState = {
        "user_id": "U1",
        "user_role": "seller",
        "goal": "Test Goal",
        "plan": ["p1"],
        "current_task": "p1",
        "completed_tasks": [],
        "agent_results": {},
        "tool_results": {},
        "retrieved_sources": [],
        "approval_required": False,
        "approval_status": "none",
        "final_decision": None,
        "verification_result": None,
        "errors": [],
        "messages": []
    }
    assert state["user_id"] == "U1"
    assert "completed_tasks" in state
    assert "tool_results" in state


def test_orchestrator_classification():
    orchestrator = OrchestratorAgent()
    assert orchestrator.classify_goal("Reorder stock for PROD_BEA_001") == "INVENTORY_REORDER"
    assert orchestrator.classify_goal("Forecast sales for next week") == "DEMAND_FORECAST"
    assert orchestrator.classify_goal("Simulate 15% discount promotion") == "PRICING_PROMOTION"
    assert orchestrator.classify_goal("Recommend products for customer CUST_001") == "CUSTOMER_PERSONALIZATION"
    assert orchestrator.classify_goal("Process refund for order ORD_00001") == "RETURN_RESOLUTION"


def test_multi_agent_inventory_reorder_scenario():
    goal = "Analyze stockout risk for product PROD_BEA_001 and create reorder purchase plan"
    res_state = execute_agent_workflow(goal)

    assert "demand_forecasting" in res_state["completed_tasks"]
    assert "inventory_optimization" in res_state["completed_tasks"]
    assert "procurement_planning" in res_state["completed_tasks"]
    assert res_state["verification_result"]["status"] in ["SUCCESSFULLY_VERIFIED", "REPLANNED_AND_VERIFIED"]
    assert "DemandForecastingAgent" in res_state["agent_results"]
    assert "InventoryOptimizationAgent" in res_state["agent_results"]
    assert "ProcurementAgent" in res_state["agent_results"]


def test_human_approval_threshold_trigger():
    orchestrator = OrchestratorAgent()
    mock_state: AgentState = {
        "user_id": "U1",
        "user_role": "seller",
        "goal": "High value reorder",
        "plan": ["approval_check"],
        "current_task": "approval_check",
        "completed_tasks": [],
        "agent_results": {
            "ProcurementAgent": {
                "procurement_cost": {"total_procurement_cost": 12500.0} # > $5,000
            }
        },
        "tool_results": {},
        "retrieved_sources": [],
        "approval_required": False,
        "approval_status": "none",
        "final_decision": None,
        "verification_result": None,
        "errors": [],
        "messages": []
    }

    res_state = orchestrator.check_human_approval_threshold(mock_state)
    assert res_state["approval_required"] is True
    assert res_state["approval_status"] == "pending"
