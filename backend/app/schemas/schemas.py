"""
Pydantic Schemas for API Requests and Responses
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProductSchema(BaseModel):
    id: int
    category: str
    base_price: float
    current_stock: int
    
class TransactionSchema(BaseModel):
    transaction_id: int
    user_name: str
    age: int
    country: str
    product_category: str
    purchase_amount: float
    payment_method: str
    transaction_date: str

class OperationalMetricsSchema(BaseModel):
    """Derived Business Output Schema - NOT to be used as ML input features"""
    product_category: str
    forecast_7d_units: float
    reorder_point_units: float
    stockout_risk: float
    overstock_risk: float
    recommended_order_qty: float
