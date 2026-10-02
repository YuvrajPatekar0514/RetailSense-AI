# LLM and Generative AI Layer

The `llm/` package contains an optional text-generation service. It is a separate utility layer, not the planner or tool-calling engine used by `POST /api/v1/agents/execute`.

## Implemented Components

- `llm/client.py` wraps the OpenAI chat-completions client using a model name (default `gpt-4o-mini`) and `OPENAI_API_KEY` from the process environment.
- If no usable key is present, or the provider call raises, the client returns a fixed deterministic fallback response with estimated token counts.
- `llm/service.py` exposes goal interpretation, structured explanation generation, business summary, and customer response helpers.
- `llm/schemas.py` defines Pydantic payload types such as `DecisionExplanation`, `GoalInterpretation`, and `LLMAuditMetadata`.
- Prompt strings are held in `llm/prompts.py`.

## Runtime Boundaries

`GenerativeAIService.interpret_goal` calls the client, then assigns its category/agent list using local keyword rules. It is not called by `agents/runner.py`, the graph nodes, or the customer layout's agent request path. The graph's goal classification is independently implemented in `agents/orchestrator/agent.py`.

The service's `audit_logs` list exists only on the service object in memory. It does not persist calls to `AgentRun` or `ToolCall`; those ORM tables are separate. No vector embedding, vector store, or retriever is implemented under `rag/`. A `RetrievedKnowledge` schema or static source snippet is not evidence that retrieval occurred.

## Important Limitations

- LLM output is generated text and is not guaranteed to be factually correct. Numeric fields in a Pydantic schema do not prevent unsupported claims in a generated narrative.
- `DecisionExplanation.confidence` is set to a fixed value in service code, not calibrated from model confidence.
- Provider usage metadata may be unavailable on provider errors; in fallback mode token counts are simple estimates.
- API key handling should use a secure process/environment configuration. Do not commit `.env` or key material.
- No HTTP API route invokes these helpers in the current FastAPI router set.

## Tests and Source

Unit tests in `tests/unit/test_llm_layer.py` cover local service/schema behavior. They do not prove provider availability or live-agent integration. See [`llm/README.md`](../llm/README.md), [`llm/client.py`](../llm/client.py), [`llm/service.py`](../llm/service.py), and the [agent workflow](AI_AGENT_WORKFLOW.md).

## Planned Work

If this layer is to become part of agent execution, define an explicit integration contract, validate structured model outputs, bind decisions to tool/database evidence, handle timeouts/rate limits, redact sensitive prompt data, persist auditable metadata safely, and add network-mocked plus provider integration tests. Implement and test retrieval separately before describing RAG as active.