"""
Sales Tools — Tools for querying historical sales, category sales, and store performance.
"""

import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import asyncio
import pandas as pd
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from tools.base import ToolResponse, logger, run_async
from database.session import AsyncSessionLocal
from database.repository import sales_repo


class SalesHistoryInput(BaseModel):
    category: Optional[str] = Field(None, description="Product category filter (e.g. Beauty, Electronics)")
    limit: int = Field(100, ge=1, le=1000, description="Max transaction records to return")


class ProductSalesInput(BaseModel):
    product_id: str = Field(..., description="Product ID or category name")
    limit: int = Field(50, ge=1, le=500, description="Max record count")


class StoreSalesInput(BaseModel):
    store_id: str = Field(..., description="Store ID (e.g. STORE_USA, STORE_CANADA)")
    limit: int = Field(50, ge=1, le=500, description="Max record count")


def get_sales_history(category: Optional[str] = None, limit: int = 100) -> Dict[str, Any]:
    """Retrieves transaction sales history filtered by category."""
    tool_name = "get_sales_history"
    try:
        input_obj = SalesHistoryInput(category=category, limit=limit)
        
        async def _fetch():
            async with AsyncSessionLocal() as session:
                if input_obj.category:
                    sales = await sales_repo.list_sales_by_category(session, input_obj.category, input_obj.limit)
                else:
                    sales = (await session.execute(
                        sales_repo.select(sales_repo.Sale).limit(input_obj.limit)
                    )).scalars().all()
                summary = await sales_repo.get_sales_summary(session)
                return sales, summary

        sales_list, summary = run_async(_fetch())
        records = [
            {
                "transaction_id": s.transaction_id,
                "user_name": s.user_name,
                "product_category": s.product_category,
                "purchase_amount": s.purchase_amount,
                "country": s.country,
                "transaction_date": s.transaction_date.strftime("%Y-%m-%d") if s.transaction_date else None
            }
            for s in sales_list
        ]
        
        logger.info(f"Executed {tool_name} (category={category}, records={len(records)})")
        return ToolResponse(
            success=True,
            tool_name=tool_name,
            data={"summary": summary, "transaction_count": len(records), "transactions": records}
        ).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()


def get_product_sales(product_id: str, limit: int = 50) -> Dict[str, Any]:
    """Retrieves sales history and revenue performance for a specific product or category."""
    tool_name = "get_product_sales"
    try:
        input_obj = ProductSalesInput(product_id=product_id, limit=limit)
        
        # Look up category if product_id is specified
        cat_name = input_obj.product_id.replace("PROD_", "").split("_")[0].title()
        res = get_sales_history(category=cat_name, limit=input_obj.limit)
        
        if res["success"]:
            res["data"]["product_id"] = input_obj.product_id
        return res

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()


def get_store_sales(store_id: str, limit: int = 50) -> Dict[str, Any]:
    """Retrieves sales performance for a specific retail store/country hub."""
    tool_name = "get_store_sales"
    try:
        input_obj = StoreSalesInput(store_id=store_id, limit=limit)
        country = input_obj.store_id.replace("STORE_", "").replace("_", " ").title()

        async def _fetch():
            async with AsyncSessionLocal() as session:
                stmt = sales_repo.select(sales_repo.Sale).where(sales_repo.Sale.country == country).limit(input_obj.limit)
                res = await session.execute(stmt)
                return list(res.scalars().all())

        sales_list = run_async(_fetch())
        total_rev = sum(s.purchase_amount for s in sales_list)
        records = [
            {
                "transaction_id": s.transaction_id,
                "user_name": s.user_name,
                "purchase_amount": s.purchase_amount,
                "payment_method": s.payment_method,
                "transaction_date": s.transaction_date.strftime("%Y-%m-%d") if s.transaction_date else None
            }
            for s in sales_list
        ]

        logger.info(f"Executed {tool_name} (store_id={store_id}, records={len(records)})")
        return ToolResponse(
            success=True,
            tool_name=tool_name,
            data={
                "store_id": input_obj.store_id,
                "country": country,
                "transaction_count": len(records),
                "total_store_revenue": round(total_rev, 2),
                "transactions": records
            }
        ).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()
