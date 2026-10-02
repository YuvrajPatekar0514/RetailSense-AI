"""
RetailSense AI — Declarative SQLAlchemy Models

Defines 19 relational tables with indexes, foreign keys, and timestamps.
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Index, Numeric
)
from sqlalchemy.orm import relationship
from database.session import Base


class TimestampMixin:
    """Mixin for created_at and updated_at timestamps."""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


# 1. Users Table
class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), index=True, default="customer") # seller, customer, admin
    is_active = Column(Boolean, default=True)


# 2. Products Table
class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String(50), unique=True, index=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    category = Column(String(100), index=True, nullable=False)
    subcategory = Column(String(100), index=True)
    brand = Column(String(100), index=True)
    description = Column(Text)
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    warranty_days = Column(Integer, default=0)
    returnable = Column(Boolean, default=True)

    suppliers = relationship("Supplier", back_populates="product")
    orders = relationship("Order", back_populates="product")
    inventory_items = relationship("Inventory", back_populates="product")


# 3. Stores Table
class Store(Base, TimestampMixin):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(String(50), unique=True, index=True, nullable=False)
    store_name = Column(String(255), nullable=False)
    country = Column(String(100), index=True, nullable=False)
    city = Column(String(100))

    orders = relationship("Order", back_populates="store")
    inventory_items = relationship("Inventory", back_populates="store")


# 4. Sales Table (Cleaned Primary Transaction Records)
class Sale(Base, TimestampMixin):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, unique=True, index=True, nullable=False)
    user_name = Column(String(255), index=True, nullable=False)
    age = Column(Integer)
    country = Column(String(100), index=True, nullable=False)
    product_category = Column(String(100), index=True, nullable=False)
    purchase_amount = Column(Float, nullable=False)
    payment_method = Column(String(50), index=True, nullable=False)
    transaction_date = Column(DateTime, index=True, nullable=False)


# 5. Inventory Table
class Inventory(Base, TimestampMixin):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String(50), ForeignKey("products.product_id"), index=True, nullable=False)
    store_id = Column(String(50), ForeignKey("stores.store_id"), index=True, nullable=False)
    current_stock = Column(Integer, default=100, nullable=False)
    reorder_point = Column(Integer, default=20, nullable=False)
    lead_time_days = Column(Integer, default=5, nullable=False)
    safety_stock = Column(Integer, default=10, nullable=False)
    forecast_7d_units = Column(Float, default=0.0)
    stockout_risk = Column(Float, default=0.0)
    overstock_risk = Column(Float, default=0.0)
    recommended_order_qty = Column(Float, default=0.0)

    product = relationship("Product", back_populates="inventory_items")
    store = relationship("Store", back_populates="inventory_items")


# 6. Customers Table
class Customer(Base, TimestampMixin):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(50), unique=True, index=True, nullable=False)
    customer_name = Column(String(255), index=True, nullable=False)
    city = Column(String(100), index=True)
    age_group = Column(String(20))
    preferred_category = Column(String(100), index=True)
    budget_range = Column(String(50))
    loyalty_level = Column(String(50), index=True, default="Bronze")

    orders = relationship("Order", back_populates="customer")
    returns = relationship("Return", back_populates="customer")


# 7. Orders Table
class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(String(50), ForeignKey("customers.customer_id"), index=True, nullable=False)
    product_id = Column(String(50), ForeignKey("products.product_id"), index=True, nullable=False)
    store_id = Column(String(50), ForeignKey("stores.store_id"), index=True, nullable=False)
    order_date = Column(DateTime, index=True, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    payment_status = Column(String(50), index=True, default="Completed")
    order_status = Column(String(50), index=True, default="Delivered")
    delivery_date = Column(DateTime, index=True)

    customer = relationship("Customer", back_populates="orders")
    product = relationship("Product", back_populates="orders")
    store = relationship("Store", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")
    returns = relationship("Return", back_populates="order")


# 8. Order Items Table
class OrderItem(Base, TimestampMixin):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(50), ForeignKey("orders.order_id"), index=True, nullable=False)
    product_id = Column(String(50), ForeignKey("products.product_id"), index=True, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="order_items")


# 9. Suppliers Table
class Supplier(Base, TimestampMixin):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(String(50), unique=True, index=True, nullable=False)
    supplier_name = Column(String(255), index=True, nullable=False)
    product_id = Column(String(50), ForeignKey("products.product_id"), index=True, nullable=False)
    unit_cost = Column(Float, nullable=False)
    lead_time_days = Column(Integer, nullable=False)
    minimum_order_qty = Column(Integer, nullable=False)
    available_quantity = Column(Integer, nullable=False)
    reliability_score = Column(Float, nullable=False)
    city = Column(String(100))

    product = relationship("Product", back_populates="suppliers")


# 10. Returns Table
class Return(Base, TimestampMixin):
    __tablename__ = "returns"

    id = Column(Integer, primary_key=True, index=True)
    return_id = Column(String(50), unique=True, index=True, nullable=False)
    order_id = Column(String(50), ForeignKey("orders.order_id"), index=True, nullable=False)
    customer_id = Column(String(50), ForeignKey("customers.customer_id"), index=True, nullable=False)
    product_id = Column(String(50), ForeignKey("products.product_id"), index=True, nullable=False)
    return_date = Column(DateTime, index=True, nullable=False)
    return_reason = Column(String(255), nullable=False)
    return_status = Column(String(50), index=True, default="Refunded")
    refund_amount = Column(Float, nullable=False, default=0.0)

    order = relationship("Order", back_populates="returns")
    customer = relationship("Customer", back_populates="returns")


# 11. Promotions Table
class Promotion(Base, TimestampMixin):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True, index=True)
    promotion_id = Column(String(50), unique=True, index=True, nullable=False)
    product_id = Column(String(50), ForeignKey("products.product_id"), index=True, nullable=False)
    promotion_type = Column(String(100), index=True, nullable=False)
    discount_pct = Column(Float, nullable=False)
    start_date = Column(DateTime, index=True, nullable=False)
    end_date = Column(DateTime, index=True, nullable=False)
    target_category = Column(String(100), index=True, nullable=False)


# 12. Agent Tasks Table
class AgentTask(Base, TimestampMixin):
    __tablename__ = "agent_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(50), unique=True, index=True, nullable=False)
    agent_role = Column(String(50), index=True, nullable=False) # seller, customer, admin
    task_type = Column(String(100), index=True, nullable=False)
    status = Column(String(50), index=True, default="pending") # pending, in_progress, completed, failed
    input_data = Column(Text)
    result_data = Column(Text)


# 13. Agent Messages Table
class AgentMessage(Base, TimestampMixin):
    __tablename__ = "agent_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(50), index=True, nullable=False)
    sender = Column(String(50), index=True, nullable=False)
    recipient = Column(String(50), index=True, nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(String(50), default="text")


# 14. Agent Runs Table
class AgentRun(Base, TimestampMixin):
    __tablename__ = "agent_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String(50), unique=True, index=True, nullable=False)
    agent_name = Column(String(50), index=True, nullable=False)
    state_summary = Column(Text)
    status = Column(String(50), index=True, default="running")
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    error_message = Column(Text)


# 15. Tool Calls Table
class ToolCall(Base, TimestampMixin):
    __tablename__ = "tool_calls"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String(50), ForeignKey("agent_runs.run_id"), index=True, nullable=False)
    tool_name = Column(String(100), index=True, nullable=False)
    arguments = Column(Text)
    output = Column(Text)
    status = Column(String(50), index=True, default="success")
    execution_time_ms = Column(Float, default=0.0)


# 16. Recommendations Table
class Recommendation(Base, TimestampMixin):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(String(50), ForeignKey("customers.customer_id"), index=True, nullable=False)
    product_id = Column(String(50), ForeignKey("products.product_id"), index=True, nullable=False)
    recommendation_score = Column(Float, nullable=False)
    reason = Column(String(255))
    is_accepted = Column(Boolean, default=False)


# 17. Approvals Table
class Approval(Base, TimestampMixin):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    approval_id = Column(String(50), unique=True, index=True, nullable=False)
    task_id = Column(String(50), ForeignKey("agent_tasks.task_id"), index=True, nullable=False)
    agent_role = Column(String(50), index=True, nullable=False)
    action_type = Column(String(100), index=True, nullable=False)
    payload = Column(Text)
    status = Column(String(50), index=True, default="pending") # pending, approved, rejected
    approved_by = Column(String(100))
    decision_timestamp = Column(DateTime)


# 18. Documents Table (RAG Knowledge)
class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), index=True, nullable=False)
    source_type = Column(String(50), default="policy")
    content = Column(Text, nullable=False)


# 19. Document Chunks Table (RAG Embeddings metadata)
class DocumentChunk(Base, TimestampMixin):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(String(50), unique=True, index=True, nullable=False)
    document_id = Column(String(50), ForeignKey("documents.document_id"), index=True, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    embedding_vector_id = Column(String(100), index=True)
