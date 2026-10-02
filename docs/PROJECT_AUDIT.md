# Project Audit

**Audit basis:** current workspace source, routes, UI components, requirements, tests, and Git state. Audited 2026-10-02. The worktree was clean on `main`, tracking `origin/main` at `https://github.com/YuvrajPatekar0514/RetailSense-AI.git` before these documentation changes.

## Summary

RetailSense AI is a local-first demo with a React/Vite SPA, FastAPI API, async SQLAlchemy persistence, SQLite default, a LangGraph-compatible sequential workflow, Python domain tools, and a demand regression model. It is not a production-ready autonomous retail platform. Existing documents had claimed live RAG, broad LLM orchestration, persistent agent audit history, and model features not wired into the corresponding request paths. Those claims are corrected in the current documentation set.

## Feature Status

| Area | Status | Evidence and qualification |
|---|---|---|
| Frontend shell | Implemented | React Router, auth context, separate Admin, Retailer, and Customer layouts in `frontend/src/` |
| Authentication | Partial | JWT login, signed token, hash/verify, `/auth/me`; debug mode has an admin fallback when token is absent |
| Authorization | Partial / needs hardening | Role permission data and a `require_roles` dependency exist, but most data/admin/agent routes do not apply them; dashboard routes check authentication, not dashboard-role authorization |
| Admin overview | Partial | KPI, user, and audit-log APIs exist; agent health figures and approval rows are local UI state, and administrative APIs are not currently role-protected |
| Retailer dashboard | Partial | KPI, sales, demand, inventory, products, orders, customer, supplier, and report screens exist; some sidebar destinations and advertised actions are not wired to backend routes |
| Customer experience | Partial | Product catalog, recommendations, order list, assistant, offers, and profile tabs exist; checkout, cart, coupon, and some support responses are frontend demonstrations |
| CSV tools | Partial | Router is registered. Preview/template/import/export exist; no server-side file-size limit or robust schema validation, duplicate strategies vary by entity, and endpoints lack an auth dependency |
| Agents | Implemented as a deterministic prototype | Eight graph nodes, a shared TypedDict state, sequential routing, direct Python tool calls, approval-state calculation, and response shaping |
| Demand model | Implemented | Training/inference modules, model registry, metadata, feature list, and model artifact under `models/demand_model/` |
| Recommendation | Partial | Rule-based profile-category/loyalty ranking in `tools/customer_tools.py`; no collaborative-filtering or RFM ML package implementation is present |
| LLM | Partial / standalone | `llm/` includes an OpenAI client wrapper, schemas, prompts, and fallback; the LangGraph runner does not invoke this service |
| RAG | Planned | `rag/` contains only package initializers. The agent decision node inserts static example sources; it does not query a vector store |
| Human approval | Partial | Orchestrator sets pending/approved state based on cost/discount thresholds; no end-to-end persisted review action is connected to that state |
| CI/deployment/license | Planned / unspecified | No CI workflow or deployment manifest was found. No license file is present. |

## Backend and API

- Entrypoint: `backend/main.py`; FastAPI routers are mounted below `/api/v1`.
- Routers cover authentication, dashboard KPIs, sales, demand forecasting, inventory, products, customers, orders, suppliers, returns, agents, admin, and CSV data.
- SQLite is the default async database (`sqlite+aiosqlite:///./retailsense.db`). `database/init_db.py` calls SQLAlchemy `create_all`; there is no active migration workflow in the startup path.
- Request/response models are mostly defined in the individual routers; `backend/app/schemas/` is not the central contract used by all routes.
- `/docs` is FastAPI Swagger UI; `/health` is a basic process health response.

## Authentication and Security Findings

1. Passwords are stored as hashes. Current security code writes bcrypt-sha256 and retains verification for previous bcrypt hashes; bcrypt is constrained below version 5 for Passlib 1.7 compatibility.
2. `/auth/users` uses `require_roles(["admin"])`; `/auth/me` uses `get_current_user`. Several other route modules do not depend on a current user. In particular, admin user/status/role endpoints and CSV import/export endpoints do not enforce their expected authorization.
3. `ProtectedRoute` verifies that a user exists but does not check role-to-dashboard access. `AuthContext.hasPermission` is client-side and is not a security boundary.
4. The backend CORS configuration allows every origin while allowing credentials. Restrict origins before deployment.
5. `.env` is absent in the audited workspace and `.gitignore` excludes `.env`; `.env.example` uses placeholders. The production settings validator rejects the known default and short/placeholder secrets.
6. Do not publish databases, source records, demo credentials, tokens, or environment files. Dataset provenance for the raw transaction CSV should be verified before any redistribution.

## Agents and ML

The graph registers the Orchestrator plus Demand, Inventory, Procurement, Pricing, Customer Personalization, Customer Support, and Returns nodes. Goal classification is keyword-based. Nodes call direct functions from `tools/`; no LangChain tool-calling loop is in the graph. Agent state is shared for one invocation and returned as JSON-safe data; the runner does not persist a complete run in `agent_runs` or `tool_calls`.

The demand predictor loads a serialized model and feature metadata. It predicts a baseline from the latest category feature vector, then creates horizon values with a deterministic sinusoidal variation. It is a demo horizon simulation, not a separately trained multi-step time-series model. The returned `store_id` is metadata; the current feature lookup is category-level.

The standalone `GenerativeAIService` can call OpenAI when configured and otherwise returns a deterministic fallback. Its in-memory audit list is not a durable audit store. No embedding or vector retrieval implementation is present under `rag/`.

## CSV Import Findings

- Entities accepted by import execution: customers, products, inventory, sales, and suppliers.
- The UI also offers those five types. The backend has an `orders` sample template but no `orders` import branch.
- Preview checks the `.csv` suffix and decodes UTF-8 with BOM or Latin-1, but reads the complete file into memory and does not enforce the UI's claimed 50 MB maximum.
- The UI previews at most 20 rows and maps headers; backend imports use defaults for many missing values rather than validating a required schema.
- Numeric conversion errors are not consistently translated into row-level errors. Duplicate behavior is not consistent across entity types; `import_new` is not implemented as advertised.
- The summary reports imported/updated/skipped/failed counts for the five supported branches.

## Documentation and Repository Notes

The detailed guides linked from [README](../README.md) distinguish implemented features from partial UI demonstrations and planned work. Screenshots are genuine captures of the running Admin and Retailer dashboards; the remaining capture steps are in [SCREENSHOT_GUIDE.md](SCREENSHOT_GUIDE.md). No license was added because the project has none and selecting a license requires maintainer approval.

## Priority Follow-up

1. Apply authenticated role dependencies to protected data/admin/CSV/agent operations and enforce role checks on dashboard destinations.
2. Restrict CORS and remove the development admin fallback from production behavior.
3. Enforce upload limits, required schemas, safe value parsing, and consistent duplicate strategies; add row-level import tests.
4. Replace local mock approvals/agent telemetry and customer checkout with backed workflows, or label/remove controls that imply persistence.
5. Decide whether RAG/LLM features are intended in the live graph; implement and test the integration before claiming them as active.
6. Verify raw dataset provenance and determine a license before public redistribution.
