"""
Customer Tools — Tools for customer profiles, purchase history, and product recommendations.
"""

import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import asyncio
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from tools.base import ToolResponse, logger, run_async
from database.session import AsyncSessionLocal
from database.repository import customer_repo, order_repo, product_repo


class CustomerQueryInput(BaseModel):
    customer_id: str = Field(..., description="Unique customer ID (e.g. CUST_001)")


class RecommendationInput(BaseModel):
    customer_id: str = Field(..., description="Unique customer ID")
    top_n: int = Field(5, ge=1, le=20, description="Number of recommendations")


def get_customer_profile(customer_id: str) -> Dict[str, Any]:
    """Retrieves customer demographic profile, loyalty level, and preferred category."""
    tool_name = "get_customer_profile"
    try:
        input_obj = CustomerQueryInput(customer_id=customer_id)

        async def _fetch():
            async with AsyncSessionLocal() as session:
                return await customer_repo.get_customer_by_id(session, input_obj.customer_id)

        cust = run_async(_fetch())
        if not cust:
            return ToolResponse(success=False, tool_name=tool_name, error=f"Customer {customer_id} not found").to_dict()

        profile = {
            "customer_id": cust.customer_id,
            "customer_name": cust.customer_name,
            "city": cust.city,
            "age_group": cust.age_group,
            "preferred_category": cust.preferred_category,
            "budget_range": cust.budget_range,
            "loyalty_level": cust.loyalty_level
        }

        logger.info(f"Executed {tool_name} (customer_id={customer_id})")
        return ToolResponse(success=True, tool_name=tool_name, data=profile).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()


def get_customer_purchase_history(customer_id: str, limit: int = 50) -> Dict[str, Any]:
    """Retrieves historical orders and total spending for a customer."""
    tool_name = "get_customer_purchase_history"
    try:
        input_obj = CustomerQueryInput(customer_id=customer_id)

        async def _fetch():
            async with AsyncSessionLocal() as session:
                return await order_repo.list_orders_for_customer(session, input_obj.customer_id)

        orders = run_async(_fetch())
        records = [
            {
                "order_id": o.order_id,
                "product_id": o.product_id,
                "order_date": o.order_date.strftime("%Y-%m-%d") if o.order_date else None,
                "quantity": o.quantity,
                "unit_price": o.unit_price,
                "discount": o.discount,
                "total_paid": round((o.quantity * o.unit_price) - o.discount, 2),
                "order_status": o.order_status
            }
            for o in orders[:limit]
        ]
        total_lifetime_spend = sum(r["total_paid"] for r in records)

        logger.info(f"Executed {tool_name} (customer_id={customer_id}, order_count={len(records)})")
        return ToolResponse(
            success=True,
            tool_name=tool_name,
            data={
                "customer_id": input_obj.customer_id,
                "total_orders": len(records),
                "total_lifetime_spend": round(total_lifetime_spend, 2),
                "orders": records
            }
        ).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()


def recommend_products(customer_id: str, top_n: int = 5) -> Dict[str, Any]:
    """Generates personalized product recommendations based on customer preferred category and loyalty level."""
    tool_name = "recommend_products"
    try:
        input_obj = RecommendationInput(customer_id=customer_id, top_n=top_n)
        profile_res = get_customer_profile(customer_id=input_obj.customer_id)
        
        pref_category = profile_res["data"].get("preferred_category", "Electronics") if profile_res["success"] else "Electronics"
        loyalty = profile_res["data"].get("loyalty_level", "Bronze") if profile_res["success"] else "Bronze"

        async def _fetch():
            async with AsyncSessionLocal() as session:
                return await product_repo.list_products(session, category=pref_category, limit=input_obj.top_n)

        products = run_async(_fetch())
        discount_perk = 0.15 if loyalty == "Platinum" else 0.10 if loyalty == "Gold" else 0.05

        recommendations = [
            {
                "product_id": p.product_id,
                "product_name": p.product_name,
                "category": p.category,
                "original_price": p.selling_price,
                "personalized_price": round(p.selling_price * (1.0 - discount_perk), 2),
                "match_score": round(0.95 - (idx * 0.04), 2),
                "recommendation_reason": f"Popular in your favorite '{p.category}' category with {int(discount_perk*100)}% {loyalty} discount!"
            }
            for idx, p in enumerate(products)
        ]

        logger.info(f"Executed {tool_name} (customer_id={customer_id}, recs={len(recommendations)})")
        return ToolResponse(
            success=True,
            tool_name=tool_name,
            data={"customer_id": input_obj.customer_id, "top_n": input_obj.top_n, "recommendations": recommendations}
        ).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()
