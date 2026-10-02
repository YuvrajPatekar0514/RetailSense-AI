"""
FastAPI Router — Multi-Agent Orchestration & Execution
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any
from agents.runner import execute_agent_workflow
from tools.base import make_json_safe

logger = logging.getLogger("AgentsAPI")

router = APIRouter(
    prefix="/api/v1/agents",
    tags=["Agents"]
)


class AgentExecutionRequest(BaseModel):
    goal: str = Field(..., description="Natural language goal or prompt for the multi-agent system")
    user_id: str = Field("USER_SELLER_01", description="ID of the user making the request")
    user_role: str = Field("seller", description="Role of the user (e.g. seller, admin, buyer)")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "goal": "Which products may go out of stock next week?",
                    "user_id": "USER_SELLER_01",
                    "user_role": "seller"
                }
            ]
        }
    }


@router.get("/health")
async def get_agents_health() -> Dict[str, Any]:
    """
    Returns health status and info for registered autonomous agents.
    """
    return {
        "status": "healthy",
        "registered_agents": 8,
        "agents": [
            "OrchestratorAgent",
            "DemandForecastingAgent",
            "InventoryOptimizationAgent",
            "ProcurementAgent",
            "PricingPromotionAgent",
            "CustomerPersonalizationAgent",
            "CustomerSupportAgent",
            "ReturnsResolutionAgent"
        ],
        "execution_engine": "LangGraph"
    }


@router.post("/execute")
async def run_agent_goal(req: AgentExecutionRequest):
    """
    Executes the multi-agent workflow for a natural language goal.
    """
    try:
        res_state = execute_agent_workflow(
            goal=req.goal,
            user_id=req.user_id,
            user_role=req.user_role
        )
        safe_response = make_json_safe(res_state)
        return safe_response
    except Exception as e:
        logger.error(f"Error executing agent workflow for goal '{req.goal}': {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Agent execution failure",
                "message": str(e),
                "goal": req.goal
            }
        )