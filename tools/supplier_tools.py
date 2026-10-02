"""
Supplier Tools — Tools for supplier comparison, lead time analysis, and procurement cost calculations.
"""

import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import asyncio
import math
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from tools.base import ToolResponse, logger, make_json_safe, run_async
from database.session import AsyncSessionLocal
from database.repository import supplier_repo, product_repo


class SupplierQueryInput(BaseModel):
    product_id: str = Field(..., description="Target product ID")


class ProcurementCostInput(BaseModel):
    product_id: str = Field(..., description="Target product ID")
    quantity: int = Field(..., ge=1, description="Quantity to purchase")
    supplier_id: Optional[str] = Field(None, description="Optional specific supplier ID")


def get_suppliers_for_product(product_id: str) -> Dict[str, Any]:
    """Retrieves list of qualified suppliers offering a specific catalog product."""
    tool_name = "get_suppliers_for_product"
    try:
        input_obj = SupplierQueryInput(product_id=product_id)

        async def _fetch():
            async with AsyncSessionLocal() as session:
                return await supplier_repo.get_suppliers_for_product(session, input_obj.product_id)

        suppliers = run_async(_fetch())

        results = [
            {
                "supplier_id": s.supplier_id,
                "supplier_name": s.supplier_name,
                "product_id": s.product_id,
                "unit_cost": float(s.unit_cost),
                "lead_time_days": int(s.lead_time_days),
                "minimum_order_qty": int(s.minimum_order_qty),
                "available_quantity": int(s.available_quantity),
                "reliability_score": float(s.reliability_score),
                "city": s.city,
                "sla_compliant": int(s.lead_time_days) <= 10
            }
            for s in suppliers
        ]

        logger.info(f"Executed {tool_name} (product_id={product_id}, suppliers_found={len(results)})")
        return ToolResponse(
            success=True,
            tool_name=tool_name,
            data={"product_id": input_obj.product_id, "supplier_count": len(results), "suppliers": results}
        ).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(
            success=False,
            tool_name=tool_name,
            data={"product_id": product_id, "supplier_count": 0, "suppliers": []},
            error=str(e)
        ).to_dict()


def compare_suppliers(product_id: str) -> Dict[str, Any]:
    """Compares supplier lead times, unit costs, and reliability ratings to identify optimal vendor options."""
    tool_name = "compare_suppliers"
    try:
        sup_res = get_suppliers_for_product(product_id=product_id)
        suppliers = sup_res.get("data", {}).get("suppliers", [])

        if not sup_res.get("success") or not suppliers:
            return ToolResponse(
                success=False,
                tool_name=tool_name,
                data={"product_id": product_id, "supplier_count": 0, "suppliers": [], "selected_supplier": None},
                error=f"No suppliers found for product {product_id}"
            ).to_dict()

        sorted_suppliers = sorted(suppliers, key=lambda s: (s["unit_cost"], s["lead_time_days"], -s["reliability_score"]))
        best_supplier = sorted_suppliers[0]

        comparison_payload = {
            "product_id": product_id,
            "supplier_count": len(suppliers),
            "suppliers": suppliers,  # Always populate actual supplier records
            "selected_supplier": best_supplier,
            "all_suppliers_ranked": sorted_suppliers
        }

        logger.info(f"Executed {tool_name} (product_id={product_id}, count={len(suppliers)}, recommended={best_supplier['supplier_id']})")
        return ToolResponse(success=True, tool_name=tool_name, data=comparison_payload).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(
            success=False,
            tool_name=tool_name,
            data={"product_id": product_id, "supplier_count": 0, "suppliers": [], "selected_supplier": None},
            error=str(e)
        ).to_dict()


def calculate_procurement_cost(
    product_id: str, quantity: int, supplier_id: Optional[str] = None
) -> Dict[str, Any]:
    """Calculates total procurement order cost, shipping estimate, and supplier lead time."""
    tool_name = "calculate_procurement_cost"
    try:
        req_qty = max(1, int(quantity))
        input_obj = ProcurementCostInput(product_id=product_id, quantity=req_qty, supplier_id=supplier_id)
        
        sup_res = get_suppliers_for_product(product_id=input_obj.product_id)
        suppliers = sup_res.get("data", {}).get("suppliers", [])

        if not suppliers:
            return ToolResponse(
                success=False,
                tool_name=tool_name,
                data={"product_id": product_id, "requested_quantity": req_qty, "total_procurement_cost": 0.0},
                error=f"No supplier available for product {product_id}"
            ).to_dict()

        if input_obj.supplier_id:
            chosen = next((s for s in suppliers if s["supplier_id"] == input_obj.supplier_id), suppliers[0])
        else:
            chosen = suppliers[0]

        unit_cost = float(chosen["unit_cost"])
        moq = int(chosen["minimum_order_qty"])
        effective_qty = max(req_qty, moq)

        subtotal = round(effective_qty * unit_cost, 2)
        shipping_cost = round(subtotal * 0.05, 2)
        total_procurement_cost = round(subtotal + shipping_cost, 2)

        payload = {
            "product_id": input_obj.product_id,
            "chosen_supplier_id": chosen["supplier_id"],
            "chosen_supplier_name": chosen["supplier_name"],
            "requested_quantity": req_qty,
            "minimum_order_quantity": moq,
            "effective_order_quantity": effective_qty,
            "unit_cost": unit_cost,
            "subtotal": subtotal,
            "shipping_cost_est": shipping_cost,
            "total_procurement_cost": total_procurement_cost,
            "expected_lead_time_days": int(chosen["lead_time_days"]),
            "reliability_score": float(chosen.get("reliability_score", 0.9)),
            "available_quantity": int(chosen.get("available_quantity", 500)),
            "sla_compliant": int(chosen["lead_time_days"]) <= 10
        }

        logger.info(f"Executed {tool_name} (product_id={product_id}, supplier={chosen['supplier_id']}, qty={effective_qty}, total={total_procurement_cost})")
        return ToolResponse(success=True, tool_name=tool_name, data=payload).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(
            success=False,
            tool_name=tool_name,
            data={"product_id": product_id, "requested_quantity": quantity, "total_procurement_cost": 0.0},
            error=str(e)
        ).to_dict()
