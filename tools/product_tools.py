"""
Product Tools — Tools for catalog product search and details retrieval.
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
from database.repository import product_repo


class ProductSearchInput(BaseModel):
    query: Optional[str] = Field(None, description="Free text search query")
    category: Optional[str] = Field(None, description="Category filter")
    limit: int = Field(50, ge=1, le=500, description="Max results")


class ProductDetailsInput(BaseModel):
    product_id: str = Field(..., description="Unique product ID")


def search_products(query: Optional[str] = None, category: Optional[str] = None, limit: int = 50) -> Dict[str, Any]:
    """Searches catalog products by query string or category."""
    tool_name = "search_products"
    try:
        input_obj = ProductSearchInput(query=query, category=category, limit=limit)

        async def _fetch():
            async with AsyncSessionLocal() as session:
                products = await product_repo.list_products(session, category=input_obj.category, limit=input_obj.limit)
                if input_obj.query:
                    q_lower = input_obj.query.lower()
                    products = [
                        p for p in products
                        if q_lower in p.product_name.lower() or q_lower in p.description.lower()
                    ]
                return products

        prod_list = run_async(_fetch())
        results = [
            {
                "product_id": p.product_id,
                "product_name": p.product_name,
                "category": p.category,
                "brand": p.brand,
                "selling_price": p.selling_price,
                "returnable": p.returnable
            }
            for p in prod_list
        ]

        logger.info(f"Executed {tool_name} (query={query}, results={len(results)})")
        return ToolResponse(
            success=True,
            tool_name=tool_name,
            data={"result_count": len(results), "products": results}
        ).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()


def get_product_details(product_id: str) -> Dict[str, Any]:
    """Retrieves full specification, pricing, warranty, and return policy details for a product."""
    tool_name = "get_product_details"
    try:
        input_obj = ProductDetailsInput(product_id=product_id)

        async def _fetch():
            async with AsyncSessionLocal() as session:
                return await product_repo.get_product_by_id(session, input_obj.product_id)

        product = run_async(_fetch())
        if not product:
            return ToolResponse(success=False, tool_name=tool_name, error=f"Product {product_id} not found").to_dict()

        details = {
            "product_id": product.product_id,
            "product_name": product.product_name,
            "category": product.category,
            "subcategory": product.subcategory,
            "brand": product.brand,
            "description": product.description,
            "cost_price": product.cost_price,
            "selling_price": product.selling_price,
            "warranty_days": product.warranty_days,
            "returnable": product.returnable
        }

        logger.info(f"Executed {tool_name} (product_id={product_id})")
        return ToolResponse(success=True, tool_name=tool_name, data=details).to_dict()

    except Exception as e:
        logger.error(f"Error in {tool_name}: {str(e)}")
        return ToolResponse(success=False, tool_name=tool_name, error=str(e)).to_dict()
