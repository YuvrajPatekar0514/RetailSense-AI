# RetailSense AI — Multi-Agent Autonomous Retail Intelligence & Decision System

[![Python](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2%2B-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4%2B-646CFF.svg)](https://vitejs.dev/)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.0%2B-orange.svg)](https://python.langchain.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0%2B-green.svg)](https://xgboost.readthedocs.io/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-0.4%2B-red.svg)](https://www.trychroma.com/)

**RetailSense AI** is an enterprise-grade multi-agent retail decision system combining **LangGraph Orchestration**, **Predictive Machine Learning**, **RAG Semantic Search**, **JWT Authentication & RBAC**, and a **Modern Light-Theme Analytics Dashboard** to automate demand forecasting, inventory optimization, procurement, pricing, and customer intelligence.

---

## 🌟 Architecture Overview

```
RetailSense AI System
├── React 18 + Vite + Tailwind CSS Frontend (Light Theme Dashboard)
├── FastAPI Async Backend (API Routers, JWT Auth, RBAC Security)
├── 8 LangGraph Multi-Agent Workflows (Orchestrator, Demand, Inventory, Procurement, Pricing, Personalization, Support, Returns)
├── ML Machine Learning Pipeline (Random Forest & XGBoost Demand Forecaster, Model Registry)
├── SQLite / Async SQLAlchemy ORM (19 Relational Tables, Data Repository)
└── RAG Vector Engine (ChromaDB / FAISS Store Policy & Catalog QA)
```

---

## 🤖 8 Autonomous Agents

1. **OrchestratorAgent**: Task classification, multi-agent plan generation, task delegation, conflict resolution, failure retry handling, and final business recommendation synthesis.
2. **DemandForecastingAgent**: 7-day, 14-day, and 30-day unit demand forecasting using trained ML models, confidence interval calculation, and feature impact analysis.
3. **InventoryOptimizationAgent**: Reorder point calculation, safety stock estimation, stockout/overstock risk assessment, and replenishment order recommendation.
4. **ProcurementAgent**: Supplier cost/lead-time comparison, vendor reliability analysis, draft purchase order generation, and human approval flagging.
5. **PricingPromotionAgent**: Price elasticity & promotion scenario impact simulator, minimum margin constraint enforcement, and approval control for live price changes.
6. **CustomerPersonalizationAgent**: RFM customer segmentation, targeted product recommendation generation, and privacy-preserving customer profile analysis.
7. **CustomerSupportAgent**: RAG vector search over store policies, order status retrieval, contextual QA, and human escalation routing.
8. **ReturnsResolutionAgent**: Order return eligibility check (order age, warranty, policy compliance), refund calculation, and return status tracking.

---

## 🔐 Authentication & RBAC Roles

RetailSense AI includes a full JWT-based authentication system with Role-Based Access Control (RBAC):

| Role | Email | Default Password | Permission Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@retailsense.ai` | `admin123` | Full System Access (`*`) |
| **Retail Manager** | `retail.manager@retailsense.ai` | `manager123` | Dashboard, Sales, Inventory, Orders, Forecast, Pricing, Suppliers, Agents |
| **Inventory Manager** | `inventory.manager@retailsense.ai` | `inventory123` | Dashboard, Inventory, Forecast, Suppliers, Procurement |
| **Procurement Manager** | `procurement.manager@retailsense.ai` | `procurement123` | Dashboard, Suppliers, Procurement, Inventory, Orders |
| **Analyst** | `analyst@retailsense.ai` | `analyst123` | Dashboard, Forecast, Reports, Knowledge Base, Sales |
| **Customer Support** | `customer.support@retailsense.ai` | `support123` | Dashboard, Customers, Orders, Returns, Support |
| **Viewer** | `viewer@retailsense.ai` | `viewer123` | Read-only Dashboard, Forecast, Products |

---

## 🛠️ Machine Learning Training & Model Registry

Train and evaluate demand forecasting regressors (Linear Regression, Random Forest, XGBoost) using time-aware chronological splits (70/15/15):

```bash
# Run ML model training pipeline
python ml/train.py
```

- **Metrics Evaluated**: MAE, RMSE, R², MAPE
- **Artifacts Saved**: `models/demand_model/best_model.pkl` & `models/demand_model/metadata.json`

---

## 🚀 Terminal Startup Instructions

### 1. Database Initialization & Seeding
```bash
python database/seed_data.py
```

### 2. Start FastAPI Backend Server
```bash
uvicorn backend.main:app --reload --port 8000
```
- **API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Start React + Vite Frontend Dashboard
```bash
cd frontend
npm run dev
```
- **Local Application URL**: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Automated Testing

Run the full pytest suite (35 unit and integration tests):

```bash
pytest -p no:asyncio
```
