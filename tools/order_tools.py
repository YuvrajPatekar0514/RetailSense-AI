"""
Order Tools — Tools for order detail lookup and status tracking.
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
from database.repository import order_repo


class OrderQueryInput(BaseModel):
    order_id: str = Field(..., description="Unique order ID (e.g. ORD_00001)")


def get_order(order_id: str) -> Dict[str, Any]:
    """Retrieves full order details including line items, customer ID, and pricing."""
    tool_name = "get_order"
    try:
        input_obj = OrderQueryInput(order_id=order_id)

        async def _fetch():
            async with AsyncSessionLocal() as session:
                return await order_repo.get_order_by_id(session, input_obj.order_id)

        order = run_async(_fetch())

        if not order:
            return ToolResponse(success=False, tool_name=tool_name, error=f"Order {order_id} not found").to_dict()

        total_paid = round((order.quantity * order.unit_price) - order.discount, 2)
        payload = {
            "order_id": order.order_id,
            "customer_id": order.customer_id,
            "product_id": order.product_id,
            "store_id": order.store_id,
            "order_date": order.order_date.strftime("%Y-%m-%d") if order.order_date else None,
            "quantity": order.quantity,
            "unit_price": order.unit_price,
            "discount": order.discount,
            "total_paid": total_paid,
            "payment_status": order.payment_status,
            "order_status": order.order_status,
            "delivery_date": order.delivery_date.strftime("%Y-%m-%d") if order.delivery_date else None
        }

        logger.info(f"Executed {tool_name} (order_id={order_id})")
        return ToolResponse(success=True, tool_name=tool_name, data=payload).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()


def get_order_status(order_id: str) -> Dict[str, Any]:
    """Retrieves current order status and delivery tracking date."""
    tool_name = "get_order_status"
    try:
        order_res = get_order(order_id=order_id)
        if not order_res["success"]:
            return order_res

        data = order_res["data"]
        payload = {
            "order_id": data["order_id"],
            "order_status": data["order_status"],
            "payment_status": data["payment_status"],
            "delivery_date": data["delivery_date"],
            "is_delivered": data["order_status"] == "Delivered"
        }

        logger.info(f"Executed {tool_name} (order_id={order_id}, status={data['order_status']})")
        return ToolResponse(success=True, tool_name=tool_name, data=payload).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()
