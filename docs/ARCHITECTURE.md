# System Architecture

RetailSense AI is a local-first application composed of a React/Vite frontend, FastAPI API, async SQLAlchemy persistence, domain tools, a deterministic multi-agent graph, and a saved demand regression model. This document describes code that is currently present; it is not a production deployment specification.

## Component Diagram

```mermaid
flowchart LR
    User[Browser user] --> UI[React and Vite]
    UI -->|/api proxy| API[FastAPI application]
    API --> Security[JWT and role helpers]
    API --> Repos[SQLAlchemy async repositories]
    Repos --> DB[(SQLite default)]
    API --> Forecast[Demand forecast endpoint]
    Forecast --> Predictor[DemandPredictor]
    Predictor --> Artifact[(Model artifact and metadata)]
    API --> Execute[Agent execute endpoint]
    Execute --> Runner[Workflow runner]
    Runner --> Graph[LangGraph StateGraph or local fallback]
    Graph --> Nodes[Orchestrator and domain nodes]
    Nodes --> Tools[Direct Python domain functions]
    Tools --> DB
    Tools --> Predictor
    LLM[Optional standalone LLM service] -. not wired into graph .-> Nodes
    RAG[Vector retrieval not implemented] -. future work .-> Nodes
```

## Frontend

`frontend/src/App.jsx` provides public login and protected `/admin/*`, `/retailer/*`, and `/customer/*` layout routes. `AuthContext` stores the JWT and user object in browser `localStorage`; the API service attaches the bearer token and Vite proxies `/api` to port 8000. `ProtectedRoute` checks for a user but does not enforce role-specific access to each layout.

The Admin layout uses API calls for overview, users, and audit-list content but also contains local mock agent health and approval state. The Retailer and Customer layouts contain a mix of API-backed data and prototype-only state; see [DASHBOARDS.md](DASHBOARDS.md).

## API and Persistence

`backend/main.py` creates the FastAPI application, enables CORS, and mounts routers for auth, KPIs, sales, demand forecast, inventory, products, customers, orders, suppliers, returns, agents, admin, and CSV operations. Interactive OpenAPI docs are at `/docs`.

`database/session.py` configures `AsyncSession` and the async engine. SQLite is the default through `aiosqlite`; `DATABASE_URL` can select another SQLAlchemy async driver. Nineteen ORM models are in `database/models/models.py`. `database/init_db.py` uses `create_all`; Alembic is a dependency but the standard local startup does not run migrations.

Authentication helpers sign JWTs and verify password hashes. Role permission data is returned to the frontend and a `require_roles` dependency is used for user registration. Many other data/admin endpoints do not currently apply authentication dependencies, so this is not a complete RBAC boundary. See [SECURITY.md](SECURITY.md).

## Agent Execution

`POST /api/v1/agents/execute` enters `agents/runner.py`, which initializes a new `AgentState` and invokes the graph. `agents/graph.py` registers the Orchestrator's planner/decision functions and seven domain nodes. Keyword rules classify the goal, and `router_node` dispatches unfinished task names sequentially. Each domain node calls imported Python functions from `tools/` and stores outputs in shared state.

The Orchestrator computes conflict notes, approval flags, and verification output. Approval values are not connected to a persisted review action or a live purchase/price execution. The runner returns state as JSON-safe output but does not write each run to `agent_runs`/`tool_calls`. The graph uses no LLM-based tool calling. See [AI_AGENT_WORKFLOW.md](AI_AGENT_WORKFLOW.md).

## ML, LLM, and Retrieval

- **Demand ML:** `ml/train.py` evaluates Linear Regression, Random Forest, and XGBoost on pre-split feature data; `ml/predict.py` loads a serialized artifact. Horizon outputs apply a deterministic sinusoidal adjustment to one baseline prediction. See [DATA_FLOW.md](DATA_FLOW.md).
- **Recommendation:** `tools/customer_tools.py` filters by preferred category and applies a loyalty-tier discount; no RFM clustering implementation is wired into this path.
- **LLM:** `llm/` supplies an optional OpenAI client, prompt/service layer, and Pydantic output schemas. It is separate from the API agent graph; no provider key is needed for the graph.
- **RAG:** `rag/` package directories only contain initializers. Database document metadata models exist, but there is no embedding, vector-store, or retriever implementation. Static source snippets in the Orchestrator are not retrieval.

## Data and Workflow Diagram

```mermaid
sequenceDiagram
    actor User
    participant UI as React/Vite
    participant API as FastAPI
    participant Flow as Agent graph
    participant Tool as Python tools
    participant DB as SQLAlchemy/SQLite
    participant ML as Saved demand model
    User->>UI: Submit goal or dashboard query
    UI->>API: HTTP request through /api proxy
    API->>Flow: Execute goal (agent route only)
    Flow->>Tool: Call selected domain function
    Tool->>DB: Query/update records
    Tool->>ML: Forecast when required
    DB-->>Tool: Data
    ML-->>Tool: Prediction
    Tool-->>Flow: Structured dictionary result
    Flow-->>API: JSON-safe state
    API-->>UI: JSON response
```

## Source Map

```text
backend/main.py             FastAPI application and router registration
backend/app/api/            HTTP route modules
backend/app/core/           settings, password, JWT, and dependency helpers
agents/                     shared state, graph, runner, and specialized nodes
tools/                      direct domain functions and registry
database/models/models.py   19 SQLAlchemy tables
database/repository/        reusable data-access functions
ml/                         preprocessing, training, registry, and inference
llm/                        optional standalone generation client/service
rag/                        empty package placeholders; no live retrieval
frontend/src/               React layouts, routes, auth context, and API client
tests/                      pytest unit and integration directories
docs/                       architecture, agent, data, API, security, and setup guides
```

See [PROJECT_AUDIT.md](PROJECT_AUDIT.md) for implementation status and known gaps.