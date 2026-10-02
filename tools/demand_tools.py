"""
Demand Tools — Tools for forecasting product demand using trained ML models.
"""

import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from typing import Dict, Any
from pydantic import BaseModel, Field
from tools.base import ToolResponse, logger
from ml.predict import forecast_demand as ml_forecast_demand


class ForecastDemandInput(BaseModel):
    product_id: str = Field(..., description="Target product ID or SKU")
    store_id: str = Field("STORE_USA", description="Store ID or region code")
    horizon_days: int = Field(7, ge=1, le=90, description="Forecast horizon in days (1 to 90)")


def forecast_demand_tool(
    product_id: str, store_id: str = "STORE_USA", horizon_days: int = 7
) -> Dict[str, Any]:
    """
    Predicts future daily unit demand using trained ML models (Random Forest / XGBoost).
    Returns multi-day predictions, evaluation metrics, and feature importance drivers.
    """
    tool_name = "forecast_demand"
    try:
        input_obj = ForecastDemandInput(product_id=product_id, store_id=store_id, horizon_days=horizon_days)
        forecast_result = ml_forecast_demand(
            product_id=input_obj.product_id,
            store_id=input_obj.store_id,
            horizon_days=input_obj.horizon_days
        )
        logger.info(f"Executed {tool_name} (product_id={product_id}, horizon={horizon_days})")
        return ToolResponse(
            success=True,
            tool_name=tool_name,
            data=forecast_result
        ).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()
