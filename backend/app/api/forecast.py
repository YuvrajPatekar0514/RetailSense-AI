"""
FastAPI Router — Demand Forecasting ML Service
"""

from fastapi import APIRouter
from ml.predict import forecast_demand

router = APIRouter(prefix="/api/v1/forecast", tags=["Demand Forecast"])


@router.get("/demand")
async def get_demand_forecast(product_id: str = "PROD_BEA_001", store_id: str = "STORE_USA", horizon_days: int = 7):
    return forecast_demand(product_id=product_id, store_id=store_id, horizon_days=horizon_days)
