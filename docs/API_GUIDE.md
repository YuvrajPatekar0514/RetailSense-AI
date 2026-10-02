# API Guide

## Local Documentation

Start the backend, then browse to `http://127.0.0.1:8000/docs` for generated Swagger/OpenAPI docs or `/redoc`. Health check: `GET /health`.

All application routers use `/api/v1` prefixes. The frontend's Vite server proxies `/api` to `http://127.0.0.1:8000`.

## Routes in `backend.main:app`

| Router | Methods and paths | Purpose |
|---|---|---|
| Auth | `POST /auth/login`, `GET /auth/me`, `POST /auth/users`, `GET /auth/roles` | Login/JWT, current profile, admin-authorized registration, role metadata |
| Dashboard | `GET /dashboard/kpis` | Aggregate retail KPIs |
| Sales | `GET /sales/summary`, `GET /sales/history` | Summary and filtered history |
| Forecast | `GET /forecast/demand` | Demand prediction for product/store/horizon query values |
| Inventory | `GET /inventory/items` | Inventory listing |
| Products | `GET /products` | Catalog listing/filter |
| Customers | `GET /customers`, `GET /customers/{customer_id}/recommendations` | Customer listing and recommendations |
| Orders | `GET /orders` | Order listing/filter |
| Suppliers | `GET /suppliers` | Supplier listing |
| Returns | `GET /returns` | Return listing/filter |
| Agents | `GET /agents/health`, `POST /agents/execute` | Registered-agent metadata and workflow execution |
| Admin | `GET /admin/stats`, `GET /admin/overview`, `GET /admin/users`, `PUT /admin/users/{user_id}/status`, `PUT /admin/users/{user_id}/role`, `GET /admin/audit-logs` | Metrics, directory updates, tool-call log listing |
| CSV data | `GET /data/template/{entity_type}`, `POST /data/import/preview`, `POST /data/import/execute`, `GET /data/export` | Template, preview, import, export |

The table omits the `/api/v1` prefix after each router prefix for readability. Check Swagger for request schemas, query parameters, and response payloads.

## Authentication Behavior

`POST /auth/login` accepts email/password and returns a bearer token and user permission metadata. Pass the token as `Authorization: Bearer <token>` for routes that declare a security dependency. `GET /auth/me` resolves a user; development mode includes a fallback to the seeded admin if no token is supplied. `POST /auth/users` requires the `admin` role.

Most retail reads, admin operations, agent execution, and CSV operations do not currently declare an auth dependency. The frontend sends a token by default, but sending a token does not make an unprotected endpoint authorized. See [SECURITY.md](SECURITY.md).

## Frontend Methods Without Matching Routes

The API client currently exposes calls that do not have corresponding route handlers in the registered routers, including forecast retraining, inventory reorder, supplier purchase-order creation, return processing, agent status at `/agents/status`, and knowledge-base search. Do not advertise these as functioning server actions until endpoints are implemented and tested.

## CSV Contract and Limitations

The CSV UI and templates support customers, products, inventory, sales, and suppliers for execute/export. Import requests send `entity_type`, `column_mapping` (CSV header to entity field), `duplicate_strategy`, and the full CSV text. Preview is multipart upload. The backend also returns an orders sample template, but orders import/export is not implemented.

There is no enforced upload size limit, full entity schema validation, uniform duplicate strategy, or route authentication. CSV upload and export can expose or mutate data and should remain unavailable to untrusted callers until fixed.

## Example Requests

```powershell
$body = @{ email = "admin@retailsense.ai"; password = "<local development password>" } | ConvertTo-Json
$token = (Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $body).access_token
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/agents/health" -Headers @{ Authorization = "Bearer $token" }
```

Replace the placeholder locally. Do not put real secrets in scripts, shell history, docs, or screenshots.
