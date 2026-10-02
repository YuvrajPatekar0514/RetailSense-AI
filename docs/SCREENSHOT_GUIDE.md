# Screenshot Capture Guide

Captured images should show the actual running application, use synthetic/demo data, and exclude credentials, tokens, browser developer tools, and real customer information. Recommended desktop viewport: 1440 x 1000. Use a clean browser profile and clear all form values before capturing the login page.

## Start Services

1. Start FastAPI from the repository root: `python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000`.
2. Start Vite from `frontend/`: `npm run dev`.
3. Open `http://127.0.0.1:5173/`.
4. Use the login persona selector for local demo accounts. Do not capture the login form while its defaults or password fields are visible.

## Capture Checklist

| Image | URL / navigation | Suggested file |
|---|---|---|
| Login | `/login`; clear email/password fields and hide demo hints if visible | `docs/screenshots/admin/login.png` |
| Admin overview | Sign in as Admin, open `/admin/dashboard`; describe mock agent/approval panels accurately | `docs/screenshots/admin/admin-overview.png` (already captured) |
| Admin customer management | Admin sidebar > Customer Data & Analytics | `docs/screenshots/admin/customer-management.png` |
| Admin CSV workflow | Admin sidebar > CSV Data Import & Export; use a synthetic template | `docs/screenshots/admin/csv-import.png` |
| Retailer overview | Sign in as Retailer, navigate to `/` after login to apply role redirect | `docs/screenshots/retailer/retailer-dashboard.png` (already captured) |
| Retailer demand | Retailer sidebar > Demand Forecasting | `docs/screenshots/retailer/demand-forecast.png` |
| Retailer inventory | Retailer sidebar > Inventory Management | `docs/screenshots/retailer/inventory.png` |
| Retailer CSV result | Retailer sidebar > CSV Data Import/Export; import only a synthetic sample | `docs/screenshots/retailer/csv-import-result.png` |
| Customer home/catalog | Sign in as Customer and navigate to `/` after login | `docs/screenshots/customer/customer-home.png` |
| Customer recommendations | Customer > Home & Recommendations | `docs/screenshots/customer/recommendations.png` |
| Customer orders | Customer > My Orders & Tracking; ensure displayed orders are synthetic | `docs/screenshots/customer/orders.png` |
| Agent execution | Retailer AI Assistant or `/docs` agent request; redact IDs if needed | `docs/screenshots/admin/agent-execution.png` |
| Swagger | `http://127.0.0.1:8000/docs` | `docs/screenshots/api/swagger.png` (already captured) |
| Architecture | Render a Mermaid diagram from `docs/ARCHITECTURE.md` using a Mermaid-compatible Markdown preview | `docs/screenshots/architecture/system-architecture.png` |

## VS Code / Browser Capture

Use the VS Code integrated browser or a browser screenshot extension. Recommended viewport is 1440 x 1000; the automated captures in this workspace were constrained to about 770 x 457 for dashboard pages. Capture the viewport at readable scale; avoid fake/mockups. Save the actual PNG to the suggested repository path, then verify the image at 100% zoom and inspect it for sensitive data before referencing it from `SCREENSHOTS.md` or README.

The customer screenshot was not captured during this audit because automated persona submission did not reliably change the rendered session. It remains a manual item; do not substitute an illustrative image.
