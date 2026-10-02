# Dashboard Guide

The SPA routes signed-in users to one of three layouts based on the returned role. `ProtectedRoute` currently checks for an authenticated user but does not restrict the requested layout by role. Frontend permission checks are not a backend security boundary.

## Admin

**Route:** `/admin/*`, normally `/admin/dashboard`.

- Platform overview calls admin overview metrics for users, stores, products, orders, GMV, approvals, and agent run counts.
- User directory reads and filters users; status and role buttons call admin API endpoints.
- Customer management and CSV import/export use shared components.
- Audit view reads recent `tool_calls` records.
- Several visible sections are demonstrations: agent status/latency/task counts and approval queue items are initialized in local component state. Some retailer/store, BI, and report views are presentation-only or use incomplete data wiring.
- Backend admin routes currently do not apply the imported `require_roles` dependency. Do not use these routes on an untrusted network.

**Source:** `frontend/src/layouts/AdminLayout.jsx`, `backend/app/api/admin.py`.

## Retailer

**Route:** `/retailer/*`, normally `/retailer/dashboard`.

| View | Current behavior |
|---|---|
| Dashboard | Calls summary/KPI APIs and renders charts/cards; inspect page-level loading and fallback state |
| Demand forecast | Calls the demand endpoint; model output uses the saved artifact and deterministic horizon adjustment |
| Inventory | Reads inventory; pricing/promotion navigation shares an inventory page and related simulation UI |
| Products, orders, suppliers | Read API-backed lists |
| Customers | Uses the shared customer data component |
| CSV hub | Uses shared CSV upload/preview/mapping/import/export component |
| AI assistant | Submits a goal to the agent endpoint |
| Reports | Frontend reports page; validate each metric against the API before treating as a formal report |

The sidebar also advertises customer support, returns, agent control, knowledge base, and admin settings. Those IDs are not all handled by `RetailerLayout`; an advertised item can lead to an empty content region instead of a working page. The API service also contains methods for some actions whose routes are not registered (for example forecast retraining and inventory reorder).

**Source:** `frontend/src/layouts/RetailerLayout.jsx`, `frontend/src/components/Sidebar.jsx`, `frontend/src/services/api.js`.

## Customer

**Route:** `/customer/*`, normally `/customer/dashboard`.

- Product catalog and search filter products loaded from the products endpoint.
- Recommendation display requests recommendations for fixed demo ID `CUST_001`, not necessarily the signed-in account.
- Order display loads the general orders list; it is not scoped to the current customer in the API call.
- Assistant sends text to `/agents/execute`; its error path displays a canned policy answer.
- Cart state, coupon `SUMMER15`, and checkout confirmation/ID are generated in the browser and do not create a persistent order.
- Profile/offers are UI demonstrations rather than a persisted account/profile workflow.

**Source:** `frontend/src/layouts/CustomerLayout.jsx`, `backend/app/api/customers.py`, `backend/app/api/orders.py`.

## Data Import

Admin and Retailer both mount `CSVImportExportWizard`. The component offers customers/products/inventory/sales/suppliers, header mapping, a first-20-row preview, duplicate strategy selection, template download, import, and export. Server-side size/schema/authentication controls are incomplete. Read [API_GUIDE.md](API_GUIDE.md) and [DATA_FLOW.md](DATA_FLOW.md) before importing data.

## Screenshots

See [Screenshots](SCREENSHOTS.md) for captured Admin/Retailer images and [SCREENSHOT_GUIDE.md](SCREENSHOT_GUIDE.md) for reproducible capture steps and missing Customer/API images.
