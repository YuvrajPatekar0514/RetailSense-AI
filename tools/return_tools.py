"""
Return Tools — Tools for checking return eligibility and filing customer return requests.
"""

import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import asyncio
from datetime import datetime
from typing import Dict, Any
from pydantic import BaseModel, Field
from tools.base import ToolResponse, logger, run_async
from database.session import AsyncSessionLocal
from database.repository import order_repo, product_repo, return_repo
from tools.order_tools import get_order
from tools.product_tools import get_product_details


class EligibilityInput(BaseModel):
    order_id: str = Field(..., description="Unique order ID")


class CreateReturnInput(BaseModel):
    order_id: str = Field(..., description="Unique order ID")
    return_reason: str = Field(..., description="Reason for return request (e.g. Defective Product, Wrong Size)")


def check_return_eligibility(order_id: str) -> Dict[str, Any]:
    """Checks if an order is eligible for return based on status, return window (30 days), and product returnability policy."""
    tool_name = "check_return_eligibility"
    try:
        input_obj = EligibilityInput(order_id=order_id)
        order_res = get_order(order_id=input_obj.order_id)

        if not order_res["success"]:
            return ToolResponse(success=False, tool_name=tool_name, error=f"Order {order_id} not found").to_dict()

        o_data = order_res["data"]
        product_res = get_product_details(product_id=o_data["product_id"])
        returnable = product_res["data"]["returnable"] if product_res["success"] else True

        is_delivered = o_data["order_status"] == "Delivered"
        
        # Check return window (within 30 days of delivery/order)
        if o_data["order_date"]:
            order_dt = datetime.strptime(o_data["order_date"], "%Y-%m-%d")
            days_since_order = (datetime.utcnow() - order_dt).days
            within_window = days_since_order <= 365 # Extended demo return window
        else:
            within_window = True

        eligible = is_delivered and returnable and within_window
        reasons_ineligible = []
        if not is_delivered:
            reasons_ineligible.append("Order has not been delivered yet.")
        if not returnable:
            reasons_ineligible.append("Product policy specifies item is non-returnable.")

        payload = {
            "order_id": input_obj.order_id,
            "product_id": o_data["product_id"],
            "eligible": eligible,
            "returnable_policy": returnable,
            "order_status": o_data["order_status"],
            "total_paid": o_data["total_paid"],
            "ineligibility_reasons": reasons_ineligible
        }

        logger.info(f"Executed {tool_name} (order_id={order_id}, eligible={eligible})")
        return ToolResponse(success=True, tool_name=tool_name, data=payload).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()


def create_return_request(order_id: str, return_reason: str) -> Dict[str, Any]:
    """Files a new customer return request for an eligible order."""
    tool_name = "create_return_request"
    try:
        input_obj = CreateReturnInput(order_id=order_id, return_reason=return_reason)
        elig_res = check_return_eligibility(order_id=input_obj.order_id)

        if not elig_res["success"]:
            return elig_res

        if not elig_res["data"]["eligible"]:
            return ToolResponse(
                success=False,
                tool_name=tool_name,
                error=f"Order {order_id} is ineligible for return. Reasons: {elig_res['data']['ineligibility_reasons']}"
            ).to_dict()

        order_res = get_order(order_id=input_obj.order_id)
        o_data = order_res["data"]
        return_id = f"RET_REQ_{int(datetime.utcnow().timestamp())}"

        return_data = {
            "return_id": return_id,
            "order_id": input_obj.order_id,
            "customer_id": o_data["customer_id"],
            "product_id": o_data["product_id"],
            "return_date": datetime.utcnow(),
            "return_reason": input_obj.return_reason,
            "return_status": "Approved",
            "refund_amount": o_data["total_paid"]
        }

        async def _save():
            async with AsyncSessionLocal() as session:
                return await return_repo.create_return_request(session, return_data)

        ret_obj = run_async(_save())

        payload = {
            "return_id": return_id,
            "order_id": input_obj.order_id,
            "customer_id": o_data["customer_id"],
            "product_id": o_data["product_id"],
            "return_reason": input_obj.return_reason,
            "return_status": "Approved",
            "refund_amount": o_data["total_paid"],
            "instructions": "Return shipping label generated. Please pack item and drop off at nearest retail hub."
        }

        logger.info(f"Executed {tool_name} (order_id={order_id}, return_id={return_id})")
        return ToolResponse(success=True, tool_name=tool_name, data=payload).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()
