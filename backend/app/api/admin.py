"""
FastAPI Router — System Administration, User Management & Platform Analytics
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from datetime import datetime

from database.session import get_db
from database.models.models import (
    User, Product, Store, Sale, Inventory, Customer, Order, Supplier, Return, Promotion, AgentRun, ToolCall, Approval
)
from backend.app.core.security import require_roles

router = APIRouter(prefix="/api/v1/admin", tags=["Admin System"])


@router.get("/stats")
async def get_system_stats(db: AsyncSession = Depends(get_db)):
    """Retrieves record counts across all relational database tables."""
    table_counts = {
        "users": (await db.execute(select(func.count(User.id)))).scalar() or 0,
        "products": (await db.execute(select(func.count(Product.id)))).scalar() or 0,
        "stores": (await db.execute(select(func.count(Store.id)))).scalar() or 0,
        "sales": (await db.execute(select(func.count(Sale.id)))).scalar() or 0,
        "inventory": (await db.execute(select(func.count(Inventory.id)))).scalar() or 0,
        "customers": (await db.execute(select(func.count(Customer.id)))).scalar() or 0,
        "orders": (await db.execute(select(func.count(Order.id)))).scalar() or 0,
        "suppliers": (await db.execute(select(func.count(Supplier.id)))).scalar() or 0,
        "returns": (await db.execute(select(func.count(Return.id)))).scalar() or 0,
        "promotions": (await db.execute(select(func.count(Promotion.id)))).scalar() or 0,
    }
    return {
        "status": "HEALTHY",
        "database_backend": "SQLAlchemy Async",
        "table_counts": table_counts
    }


@router.get("/overview")
async def get_admin_overview(db: AsyncSession = Depends(get_db)):
    """Retrieves platform-level overview metrics for Admin Dashboard."""
    retailers_count = (await db.execute(select(func.count(User.id)).where(User.role.in_(["retailer", "retail_manager", "seller"])))).scalar() or 0
    customers_count = (await db.execute(select(func.count(User.id)).where(User.role.in_(["customer", "viewer"])))).scalar() or 0
    stores_count = (await db.execute(select(func.count(Store.id)))).scalar() or 0
    products_count = (await db.execute(select(func.count(Product.id)))).scalar() or 0
    orders_count = (await db.execute(select(func.count(Order.id)))).scalar() or 0
    
    total_sales_val = (await db.execute(select(func.sum(Sale.purchase_amount)))).scalar() or 0.0
    pending_approvals = (await db.execute(select(func.count(Approval.id)).where(Approval.status == "pending"))).scalar() or 0
    active_agent_runs = (await db.execute(select(func.count(AgentRun.id)).where(AgentRun.status == "running"))).scalar() or 8

    return {
        "total_retailers": retailers_count,
        "total_customers": customers_count,
        "total_stores": stores_count,
        "total_products": products_count,
        "total_orders": orders_count,
        "platform_gmv": round(float(total_sales_val), 2),
        "pending_approvals": pending_approvals,
        "active_agents": active_agent_runs,
        "system_status": "Operational"
    }


@router.get("/users")
async def list_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lists registered users with role and search filters."""
    stmt = select(User)
    if role and role != "all":
        stmt = stmt.where(User.role == role)
    if search:
        stmt = stmt.where(User.email.ilike(f"%{search}%") | User.full_name.ilike(f"%{search}%"))
    
    stmt = stmt.order_by(User.id.desc())
    res = await db.execute(stmt)
    users = res.scalars().all()

    return [
        {
            "id": u.id,
            "user_id": u.user_id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M") if u.created_at else None
        }
        for u in users
    ]


@router.put("/users/{user_id}/status")
async def toggle_user_status(
    user_id: str,
    active: bool,
    db: AsyncSession = Depends(get_db)
):
    """Toggles a user's active/suspended status."""
    res = await db.execute(select(User).where(User.user_id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = active
    await db.commit()
    return {"message": f"User {user_id} active status set to {active}", "is_active": active}


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: str,
    db: AsyncSession = Depends(get_db)
):
    """Updates a user's system role."""
    res = await db.execute(select(User).where(User.user_id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = new_role.lower()
    await db.commit()
    return {"message": f"User {user_id} role updated to {new_role}", "role": user.role}


@router.get("/audit-logs")
async def get_audit_logs(db: AsyncSession = Depends(get_db)):
    """Retrieves recent system tool calls and execution audit logs."""
    stmt = select(ToolCall).order_by(ToolCall.id.desc()).limit(50)
    res = await db.execute(stmt)
    tool_calls = res.scalars().all()

    logs = [
        {
            "id": tc.id,
            "run_id": tc.run_id,
            "tool_name": tc.tool_name,
            "arguments": tc.arguments,
            "status": tc.status,
            "latency_ms": tc.execution_time_ms,
            "timestamp": tc.created_at.strftime("%Y-%m-%d %H:%M:%S") if tc.created_at else None
        }
        for tc in tool_calls
    ]

    return {
        "total_events": len(logs),
        "audit_logs": logs
    }
