# Agent Architecture

This file is retained as a short entry point for readers using the previous documentation structure. The earlier version described proposed capabilities as live features and has been superseded.

## Current Implementation

- One FastAPI request invokes a compiled StateGraph through `agents/runner.py`.
- The Orchestrator classifies goals with keyword rules and creates a sequential task plan.
- Seven domain nodes call direct Python functions from `tools/` and mutate a shared per-request `AgentState`.
- The graph does not use an LLM function-calling loop, persistent memory, a live vector retriever, or durable run persistence.
- Approval thresholds set state fields; no complete persisted human review and purchase execution workflow is connected.
- Failover details and static policy-like source snippets in the Orchestrator are demo constants.

## Canonical Guides

- [AI agents: responsibilities, inputs/outputs, tools, status](AI_AGENTS.md)
- [Workflow lifecycle and Mermaid diagram](AI_AGENT_WORKFLOW.md)
- [System architecture](ARCHITECTURE.md)
- [Implementation audit](PROJECT_AUDIT.md)