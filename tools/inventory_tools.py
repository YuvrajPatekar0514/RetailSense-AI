"""
Inventory Tools — Tools for inventory lookup, stockout risk, overstock risk, and reorder calculations.
"""

import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import asyncio
from typing import Dict, Any
from pydantic import BaseModel, Field
from tools.base import ToolResponse, logger, run_async
from database.session import AsyncSessionLocal
from database.repository import inventory_repo, product_repo
from ml.predict import forecast_demand


class InventoryQueryInput(BaseModel):
    product_id: str = Field(..., description="Product ID")
    store_id: str = Field("STORE_USA", description="Store ID")


class ReorderQtyInput(BaseModel):
    product_id: str = Field(..., description="Product ID")
    store_id: str = Field("STORE_USA", description="Store ID")
    target_days_cover: int = Field(14, ge=1, le=90, description="Desired days of inventory cover")


def get_inventory(product_id: str, store_id: str = "STORE_USA") -> Dict[str, Any]:
    """Retrieves current stock levels, safety stock, and reorder point for product at store."""
    tool_name = "get_inventory"
    try:
        input_obj = InventoryQueryInput(product_id=product_id, store_id=store_id)

        async def _fetch():
            async with AsyncSessionLocal() as session:
                return await inventory_repo.get_inventory(session, input_obj.product_id, input_obj.store_id)

        inv = run_async(_fetch())

        if not inv:
            # Fallback default values for demonstration if not seeded
            inv_data = {
                "product_id": input_obj.product_id,
                "store_id": input_obj.store_id,
                "current_stock": 150,
                "reorder_point": 30,
                "lead_time_days": 5,
                "safety_stock": 15,
                "status": "In Stock"
            }
        else:
            inv_data = {
                "product_id": inv.product_id,
                "store_id": inv.store_id,
                "current_stock": inv.current_stock,
                "reorder_point": inv.reorder_point,
                "lead_time_days": inv.lead_time_days,
                "safety_stock": inv.safety_stock,
                "forecast_7d_units": inv.forecast_7d_units,
                "stockout_risk": inv.stockout_risk,
                "status": "Reorder Required" if inv.current_stock <= inv.reorder_point else "In Stock"
            }

        logger.info(f"Executed {tool_name} (product_id={product_id}, store_id={store_id})")
        return ToolResponse(success=True, tool_name=tool_name, data=inv_data).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()


def calculate_stockout_risk(
    product_id: str, store_id: str = "STORE_USA", horizon_days: int = 7
) -> Dict[str, Any]:
    """Calculates stockout probability risk based on current stock vs forecasted demand."""
    tool_name = "calculate_stockout_risk"
    try:
        inv_res = get_inventory(product_id=product_id, store_id=store_id)
        current_stock = inv_res["data"]["current_stock"] if inv_res["success"] else 100

        fc_res = forecast_demand(product_id=product_id, store_id=store_id, horizon_days=horizon_days)
        forecast_units = fc_res["total_predicted_units"]

        # Stockout risk = max(0.0, 1.0 - (current_stock / (forecast_units + safety_stock)))
        safety_stock = inv_res["data"].get("safety_stock", 15) if inv_res["success"] else 15
        needed_units = forecast_units + safety_stock
        
        if current_stock <= 0:
            stockout_risk = 1.0
        elif current_stock < forecast_units:
            stockout_risk = round(min(0.99, (forecast_units - current_stock) / forecast_units + 0.30), 2)
        else:
            stockout_risk = round(max(0.0, 1.0 - (current_stock / (needed_units + 1e-5))), 2)

        risk_level = "CRITICAL" if stockout_risk > 0.70 else "WARNING" if stockout_risk > 0.40 else "LOW"

        risk_payload = {
            "product_id": product_id,
            "store_id": store_id,
            "horizon_days": horizon_days,
            "current_stock": current_stock,
            "forecast_units_horizon": forecast_units,
            "stockout_risk_score": stockout_risk,
            "risk_level": risk_level,
            "recommendation": "Initiate automated reorder" if risk_level in ["CRITICAL", "WARNING"] else "Stock level healthy"
        }

        logger.info(f"Executed {tool_name} (product_id={product_id}, risk={stockout_risk})")
        return ToolResponse(success=True, tool_name=tool_name, data=risk_payload).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()


def calculate_overstock_risk(
    product_id: str, store_id: str = "STORE_USA", horizon_days: int = 30
) -> Dict[str, Any]:
    """Calculates overstock and capital lockup risk."""
    tool_name = "calculate_overstock_risk"
    try:
        inv_res = get_inventory(product_id=product_id, store_id=store_id)
        current_stock = inv_res["data"]["current_stock"] if inv_res["success"] else 100

        fc_res = forecast_demand(product_id=product_id, store_id=store_id, horizon_days=horizon_days)
        forecast_units = fc_res["total_predicted_units"]

        if forecast_units <= 0:
            overstock_risk = 1.0
        elif current_stock > (forecast_units * 2.0):
            overstock_risk = round(min(0.99, (current_stock - forecast_units * 2.0) / current_stock), 2)
        else:
            overstock_risk = 0.05

        payload = {
            "product_id": product_id,
            "store_id": store_id,
            "current_stock": current_stock,
            "forecast_30d_units": forecast_units,
            "overstock_risk_score": overstock_risk,
            "risk_level": "HIGH" if overstock_risk > 0.50 else "NORMAL",
            "suggested_markdown": overstock_risk > 0.50
        }

        logger.info(f"Executed {tool_name} (product_id={product_id}, overstock_risk={overstock_risk})")
        return ToolResponse(success=True, tool_name=tool_name, data=payload).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()


def calculate_reorder_quantity(
    product_id: str, store_id: str = "STORE_USA", target_days_cover: int = 14
) -> Dict[str, Any]:
    """Calculates optimal reorder order quantity based on forecast demand, lead time, and MOQ."""
    tool_name = "calculate_reorder_quantity"
    try:
        input_obj = ReorderQtyInput(product_id=product_id, store_id=store_id, target_days_cover=target_days_cover)
        
        inv_res = get_inventory(product_id=input_obj.product_id, store_id=input_obj.store_id)
        inv_data = inv_res["data"] if inv_res["success"] else {}
        current_stock = inv_data.get("current_stock", 100)
        safety_stock = inv_data.get("safety_stock", 15)
        lead_time_days = inv_data.get("lead_time_days", 5)

        fc_res = forecast_demand(product_id=input_obj.product_id, store_id=input_obj.store_id, horizon_days=target_days_cover)
        target_demand = fc_res["total_predicted_units"]
        daily_rate = target_demand / max(1, target_days_cover)

        lead_time_demand = daily_rate * lead_time_days
        target_inventory_level = target_demand + safety_stock + lead_time_demand
        
        recommended_order_qty = max(0.0, target_inventory_level - current_stock)
        recommended_order_qty = round(recommended_order_qty, 2)

        payload = {
            "product_id": input_obj.product_id,
            "store_id": input_obj.store_id,
            "target_days_cover": input_obj.target_days_cover,
            "current_stock": current_stock,
            "safety_stock": safety_stock,
            "lead_time_days": lead_time_days,
            "predicted_daily_demand_rate": round(daily_rate, 2),
            "recommended_order_quantity": recommended_order_qty,
            "reorder_triggered": recommended_order_qty > 0
        }

        logger.info(f"Executed {tool_name} (product_id={product_id}, recommended_qty={recommended_order_qty})")
        return ToolResponse(success=True, tool_name=tool_name, data=payload).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()
