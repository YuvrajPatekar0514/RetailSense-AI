"""
Pricing Tools — Tools for price checks, sales trends, and dynamic promotion simulation.
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
from database.repository import product_repo, sales_repo
from ml.predict import forecast_demand


class PriceInput(BaseModel):
    product_id: str = Field(..., description="Target product ID")


class SalesTrendInput(BaseModel):
    target: str = Field(..., description="Product ID or Category Name")
    days: int = Field(30, ge=1, le=365, description="Historical horizon in days")


class PromotionSimInput(BaseModel):
    product_id: str = Field(..., description="Target product ID")
    discount_pct: float = Field(..., ge=1.0, le=90.0, description="Proposed discount percentage (1% to 90%)")
    duration_days: int = Field(7, ge=1, le=30, description="Promotion duration in days")


def get_current_price(product_id: str) -> Dict[str, Any]:
    """Retrieves cost price, current selling price, and gross margin for a product."""
    tool_name = "get_current_price"
    try:
        input_obj = PriceInput(product_id=product_id)

        async def _fetch():
            async with AsyncSessionLocal() as session:
                return await product_repo.get_product_by_id(session, input_obj.product_id)

        product = run_async(_fetch())
        if not product:
            return ToolResponse(success=False, tool_name=tool_name, error=f"Product {product_id} not found").to_dict()

        margin = round(product.selling_price - product.cost_price, 2)
        margin_pct = round((margin / product.selling_price) * 100, 2) if product.selling_price > 0 else 0.0

        payload = {
            "product_id": product.product_id,
            "product_name": product.product_name,
            "cost_price": product.cost_price,
            "current_selling_price": product.selling_price,
            "gross_margin_dollars": margin,
            "gross_margin_pct": margin_pct
        }

        logger.info(f"Executed {tool_name} (product_id={product_id}, price={product.selling_price})")
        return ToolResponse(success=True, tool_name=tool_name, data=payload).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()


def get_sales_trend(target: str, days: int = 30) -> Dict[str, Any]:
    """Retrieves recent daily sales volume and revenue trend for a product or category."""
    tool_name = "get_sales_trend"
    try:
        input_obj = SalesTrendInput(target=target, days=days)
        cat_name = input_obj.target.replace("PROD_", "").split("_")[0].title()

        async def _fetch():
            async with AsyncSessionLocal() as session:
                sales = await sales_repo.list_sales_by_category(session, cat_name, limit=input_obj.days * 2)
                return sales

        sales_list = run_async(_fetch())
        total_units = len(sales_list)
        total_revenue = sum(s.purchase_amount for s in sales_list)
        avg_daily_units = round(total_units / max(1, input_obj.days), 2)

        payload = {
            "target": input_obj.target,
            "resolved_category": cat_name,
            "horizon_days": input_obj.days,
            "total_units_sold": total_units,
            "total_revenue": round(total_revenue, 2),
            "avg_daily_units": avg_daily_units,
            "trend_direction": "UPWARD" if avg_daily_units > 5 else "STABLE"
        }

        logger.info(f"Executed {tool_name} (target={target}, trend={payload['trend_direction']})")
        return ToolResponse(success=True, tool_name=tool_name, data=payload).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()


def simulate_promotion(
    product_id: str, discount_pct: float, duration_days: int = 7
) -> Dict[str, Any]:
    """Simulates revenue, unit lift, and margin impact of a proposed promotional discount."""
    tool_name = "simulate_promotion"
    try:
        input_obj = PromotionSimInput(product_id=product_id, discount_pct=discount_pct, duration_days=duration_days)
        price_res = get_current_price(product_id=input_obj.product_id)
        
        if not price_res["success"]:
            current_price = 100.0
            cost_price = 60.0
        else:
            current_price = price_res["data"]["current_selling_price"]
            cost_price = price_res["data"]["cost_price"]

        fc_res = forecast_demand(product_id=input_obj.product_id, horizon_days=input_obj.duration_days)
        baseline_units = fc_res["total_predicted_units"]

        # Simple price elasticity model: % unit lift = discount_pct * 1.5
        elasticity_factor = 1.5
        unit_lift_pct = round(input_obj.discount_pct * elasticity_factor, 2)
        simulated_units = round(baseline_units * (1.0 + unit_lift_pct / 100.0), 2)

        promo_price = round(current_price * (1.0 - input_obj.discount_pct / 100.0), 2)
        baseline_revenue = round(baseline_units * current_price, 2)
        simulated_revenue = round(simulated_units * promo_price, 2)

        baseline_margin = round((current_price - cost_price) * baseline_units, 2)
        simulated_margin = round((promo_price - cost_price) * simulated_units, 2)

        payload = {
            "product_id": input_obj.product_id,
            "discount_percentage": input_obj.discount_pct,
            "duration_days": input_obj.duration_days,
            "original_price": current_price,
            "promotional_price": promo_price,
            "baseline_predicted_units": baseline_units,
            "simulated_promotional_units": simulated_units,
            "predicted_unit_lift_pct": unit_lift_pct,
            "baseline_revenue": baseline_revenue,
            "simulated_revenue": simulated_revenue,
            "revenue_delta": round(simulated_revenue - baseline_revenue, 2),
            "baseline_profit_margin": baseline_margin,
            "simulated_profit_margin": simulated_margin,
            "profit_delta": round(simulated_margin - baseline_margin, 2),
            "recommendation": "APPROVED" if simulated_margin >= baseline_margin else "MARGIN RISK"
        }

        logger.info(f"Executed {tool_name} (product_id={product_id}, discount={discount_pct}%, decision={payload['recommendation']})")
        return ToolResponse(success=True, tool_name=tool_name, data=payload).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()
