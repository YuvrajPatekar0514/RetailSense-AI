"""
RetailSense AI — LangGraph Multi-Agent Workflow Graph

Builds and compiles the StateGraph connecting all 8 specialized agents:
1. OrchestratorAgent
2. DemandForecastingAgent
3. InventoryOptimizationAgent
4. ProcurementAgent
5. PricingPromotionAgent
6. CustomerPersonalizationAgent
7. CustomerSupportAgent
8. ReturnsResolutionAgent

Includes a pure-Python LangGraph-compatible engine fallback if langgraph is not installed in host environment.
"""

import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from langgraph.graph import StateGraph, END
except ImportError:
    END = "__END__"

    class StateGraph:
        """Pure-Python StateGraph implementation mimicking LangGraph API."""

        def __init__(self, state_schema):
            self.nodes = {}
            self.entry_point = None
            self.conditional_edges = {}
            self.edges = {}

        def add_node(self, name, func):
            self.nodes[name] = func

        def set_entry_point(self, name):
            self.entry_point = name

        def add_conditional_edges(self, source, router_fn, mapping):
            self.conditional_edges[source] = (router_fn, mapping)

        def add_edge(self, source, target):
            self.edges[source] = target

        def compile(self):
            class CompiledGraph:
                def __init__(self, graph):
                    self.graph = graph

                def invoke(self, state):
                    curr = self.graph.entry_point
                    step_count = 0
                    max_steps = 50

                    while curr and curr != END and step_count < max_steps:
                        node_fn = self.graph.nodes[curr]
                        state = node_fn(state)
                        step_count += 1

                        if curr in self.graph.conditional_edges:
                            router_fn, mapping = self.graph.conditional_edges[curr]
                            next_key = router_fn(state)
                            curr = mapping.get(next_key, END)
                        elif curr in self.graph.edges:
                            curr = self.graph.edges[curr]
                        else:
                            curr = END

                    return state

            return CompiledGraph(self)


from agents.state import AgentState
from agents.orchestrator.agent import run_orchestrator_planning, run_orchestrator_decision
from agents.demand.agent import run_demand_agent
from agents.inventory.agent import run_inventory_agent
from agents.procurement.agent import run_procurement_agent
from agents.pricing.agent import run_pricing_agent
from agents.customer.agent import run_customer_personalization_agent, run_customer_support_agent
from agents.returns.agent import run_returns_agent


def router_node(state: AgentState) -> str:
    """Conditional router determining next sub-agent delegation step based on Orchestrator Plan."""
    completed = set(state.get("completed_tasks", []))
    plan = state.get("plan", [])

    for task in plan:
        if task not in completed:
            if task == "demand_forecasting":
                return "demand_agent"
            elif task == "inventory_optimization":
                return "inventory_agent"
            elif task == "procurement_planning":
                return "procurement_agent"
            elif task == "pricing_optimization":
                return "pricing_agent"
            elif task == "customer_personalization":
                return "customer_pers_agent"
            elif task == "customer_support_inquiry":
                return "customer_supp_agent"
            elif task == "returns_resolution":
                return "returns_agent"

    return "orchestrator_decision"


def create_retail_sense_graph():
    """Constructs and compiles the LangGraph StateGraph multi-agent system."""
    builder = StateGraph(AgentState)

    # 1. Add Nodes
    builder.add_node("orchestrator_plan", run_orchestrator_planning)
    builder.add_node("demand_agent", run_demand_agent)
    builder.add_node("inventory_agent", run_inventory_agent)
    builder.add_node("procurement_agent", run_procurement_agent)
    builder.add_node("pricing_agent", run_pricing_agent)
    builder.add_node("customer_pers_agent", run_customer_personalization_agent)
    builder.add_node("customer_supp_agent", run_customer_support_agent)
    builder.add_node("returns_agent", run_returns_agent)
    builder.add_node("orchestrator_decision", run_orchestrator_decision)

    # 2. Set Entrypoint
    builder.set_entry_point("orchestrator_plan")

    # 3. Add Conditional Router Edges
    builder.add_conditional_edges(
        "orchestrator_plan",
        router_node,
        {
            "demand_agent": "demand_agent",
            "inventory_agent": "inventory_agent",
            "procurement_agent": "procurement_agent",
            "pricing_agent": "pricing_agent",
            "customer_pers_agent": "customer_pers_agent",
            "customer_supp_agent": "customer_supp_agent",
            "returns_agent": "returns_agent",
            "orchestrator_decision": "orchestrator_decision"
        }
    )

    # Sub-agents loop back to router after execution
    for agent_node in [
        "demand_agent", "inventory_agent", "procurement_agent",
        "pricing_agent", "customer_pers_agent", "customer_supp_agent", "returns_agent"
    ]:
        builder.add_conditional_edges(
            agent_node,
            router_node,
            {
                "demand_agent": "demand_agent",
                "inventory_agent": "inventory_agent",
                "procurement_agent": "procurement_agent",
                "pricing_agent": "pricing_agent",
                "customer_pers_agent": "customer_pers_agent",
                "customer_supp_agent": "customer_supp_agent",
                "returns_agent": "returns_agent",
                "orchestrator_decision": "orchestrator_decision"
            }
        )

    # Orchestrator Decision leads to END
    builder.add_edge("orchestrator_decision", END)

    app = builder.compile()
    return app


if __name__ == "__main__":
    graph = create_retail_sense_graph()
    print("RetailSense AI LangGraph Multi-Agent Graph compiled successfully!")
