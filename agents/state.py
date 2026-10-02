"""
RetailSense AI — Shared LangGraph Agent State Definition

Defines the shared state dictionary passed across all 8 specialized agents
in the multi-agent orchestration workflow.
"""

from typing import TypedDict, List, Dict, Any, Optional


class AgentState(TypedDict):
    """
    Shared State Object passed through LangGraph nodes.
    Enforces goal-driven execution, tool calls, human approval, outcome verification, and audit trail.
    """
    user_id: str
    user_role: str                             # "seller" | "customer" | "admin"
    goal: str                                  # High-level user goal
    plan: List[str]                            # Sequential step-by-step action plan
    current_task: Optional[str]                # Currently active task step
    completed_tasks: List[str]                 # History of completed task steps
    agent_results: Dict[str, Any]              # Sub-agent execution outputs keyed by agent name
    tool_results: Dict[str, Any]               # Tool outputs keyed by tool name
    retrieved_sources: List[Dict[str, Any]]    # RAG knowledge base context sources
    approval_required: bool                    # Flag indicating if high-impact action requires human approval
    approval_status: str                       # "none" | "pending" | "approved" | "rejected"
    execution_allowed: bool                    # True if action execution is authorized
    final_decision: Optional[Dict[str, Any]]   # Final action plan / decision payload
    verification_result: Optional[Dict[str, Any]] # Outcome verification status
    errors: List[str]                          # Execution errors logged during workflow
    messages: List[Dict[str, Any]]             # Structured agent state messages
    procurement_history: List[Dict[str, Any]]  # Complete audit history of procurement supplier attempts
    retry_history: List[Dict[str, Any]]        # Audit log of failure & retry events
    replan_events: List[Dict[str, Any]]        # Audit log of orchestrator re-planning events
    audit_trail: List[Dict[str, Any]]          # Complete chronological audit trail of agent actions
