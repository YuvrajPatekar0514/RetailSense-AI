"""
RetailSense AI — FastAPI Application Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.auth import router as auth_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.sales import router as sales_router
from backend.app.api.forecast import router as forecast_router
from backend.app.api.inventory import router as inventory_router
from backend.app.api.products import router as products_router
from backend.app.api.customers import router as customers_router
from backend.app.api.orders import router as orders_router
from backend.app.api.suppliers import router as suppliers_router
from backend.app.api.returns import router as returns_router
from backend.app.api.agents import router as agents_router
from backend.app.api.admin import router as admin_router
from backend.app.api.csv_data import router as csv_data_router

app = FastAPI(
    title="RetailSense AI - Multi-Agent Autonomous Retail Intelligence Platform",
    version="1.0.0",
    description="Enterprise Multi-Agent Retail Decision & Analytics API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(sales_router)
app.include_router(forecast_router)
app.include_router(inventory_router)
app.include_router(products_router)
app.include_router(customers_router)
app.include_router(orders_router)
app.include_router(suppliers_router)
app.include_router(returns_router)
app.include_router(agents_router)
app.include_router(admin_router)
app.include_router(csv_data_router)


@app.get("/")
async def root():
    return {
        "app": "RetailSense AI — Multi-Agent Autonomous Retail Intelligence Platform",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs",
        "health_check": "/health",
        "api_v1_base": "/api/v1"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RetailSense AI Backend"}
