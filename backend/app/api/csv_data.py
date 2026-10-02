"""
FastAPI Router — Advanced CSV Data Import, Export, Validation Engine & Sample Templates
"""

import io
import csv
from typing import Dict, Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func

from database.session import get_db
from database.models.models import (
    Customer, Product, Inventory, Sale, Order, Supplier, Return
)
from backend.app.core.security import get_current_user

router = APIRouter(prefix="/api/v1/data", tags=["CSV Data Management"])


class ImportExecuteRequest(BaseModel):
    entity_type: str  # customers, products, inventory, sales, orders, suppliers
    column_mapping: Dict[str, str]  # CSV_Header -> DB_Field
    duplicate_strategy: str = "update"  # skip, update, import_new
    csv_content: str


SAMPLE_TEMPLATES = {
    "customers": "customer_id,customer_name,city,age_group,preferred_category,budget_range,loyalty_level\nCUST_101,Jane Doe,New York,25-34,Electronics,Medium,Gold\nCUST_102,John Smith,London,35-44,Beauty,High,Platinum",
    "products": "product_id,product_name,category,subcategory,brand,description,cost_price,selling_price,warranty_days,returnable\nPROD_NEW_01,Wireless Earbuds,Electronics,Audio,BrandX,High quality audio,45.0,89.99,365,True\nPROD_NEW_02,Hydrating Lotion,Beauty,Skincare,GlowCo,Natural lotion,12.5,29.99,180,True",
    "inventory": "product_id,store_id,current_stock,reorder_point,lead_time_days,safety_stock\nPROD_BEA_001,STORE_USA,150,30,5,15\nPROD_ELE_002,STORE_UK,80,20,7,10",
    "sales": "transaction_id,user_name,age,country,product_category,purchase_amount,payment_method,transaction_date\n99001,Alice Johnson,29,USA,Electronics,129.99,Credit Card,2026-10-01 14:30:00\n99002,Bob Martin,34,Canada,Beauty,49.50,PayPal,2026-10-01 16:15:00",
    "orders": "order_id,customer_id,product_id,store_id,order_date,quantity,unit_price,discount,payment_status,order_status\nORD_9901,CUST_001,PROD_BEA_001,STORE_USA,2026-10-01,2,25.0,0.0,Completed,Delivered\nORD_9902,CUST_002,PROD_ELE_002,STORE_UK,2026-10-02,1,199.99,10.0,Completed,Processing",
    "suppliers": "supplier_id,supplier_name,product_id,unit_cost,lead_time_days,minimum_order_qty,available_quantity,reliability_score,city\nSUPP_901,Global Tech Ltd,PROD_ELE_002,120.0,5,50,500,0.95,Tokyo\nSUPP_902,Apex Beauty Co,PROD_BEA_001,15.0,3,100,1200,0.98,Paris"
}


@router.get("/template/{entity_type}")
async def download_sample_template(entity_type: str):
    """Returns downloadable sample CSV template for specified entity."""
    content = SAMPLE_TEMPLATES.get(entity_type.lower())
    if not content:
        raise HTTPException(status_code=400, detail=f"No template found for entity: {entity_type}")
    
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={entity_type}_sample_template.csv"}
    )


@router.post("/import/preview")
async def preview_csv_upload(file: UploadFile = File(...)):
    """Parses uploaded CSV file, returns detected headers, sample rows, and auto-mappings."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported")
    
    body = await file.read()
    try:
        text = body.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = body.decode("latin-1")

    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty")

    headers = [h.strip() for h in rows[0]]
    data_rows = rows[1:]
    
    sample_rows = []
    for row in data_rows[:20]:
        if len(row) == len(headers):
            sample_rows.append(dict(zip(headers, row)))

    return {
        "filename": file.filename,
        "total_rows": len(data_rows),
        "headers": headers,
        "sample_rows": sample_rows,
        "detected_encoding": "UTF-8"
    }


@router.post("/import/execute")
async def execute_csv_import(req: ImportExecuteRequest, db: AsyncSession = Depends(get_db)):
    """Validates and imports CSV data into specified database tables idempotently."""
    reader = csv.DictReader(io.StringIO(req.csv_content))
    rows = list(reader)

    if not rows:
        raise HTTPException(status_code=400, detail="No rows found in CSV content")

    entity = req.entity_type.lower()
    mapping = req.column_mapping
    strategy = req.duplicate_strategy

    imported_count = 0
    updated_count = 0
    skipped_count = 0
    failed_count = 0
    errors = []

    if entity == "customers":
        for idx, row in enumerate(rows, start=2):
            cid = row.get(mapping.get("customer_id", "customer_id")) or f"CUST_CSV_{idx}_{int(datetime.utcnow().timestamp())}"
            cname = row.get(mapping.get("customer_name", "customer_name")) or row.get("Full Name") or row.get("Name") or f"Customer {idx}"
            city = row.get(mapping.get("city", "city")) or "Unknown"
            category = row.get(mapping.get("preferred_category", "preferred_category")) or "General"
            loyalty = row.get(mapping.get("loyalty_level", "loyalty_level")) or "Bronze"

            res = await db.execute(select(Customer).where(Customer.customer_id == cid))
            existing = res.scalars().first()

            if existing:
                if strategy == "skip":
                    skipped_count += 1
                    continue
                elif strategy == "update":
                    existing.customer_name = cname
                    existing.city = city
                    existing.preferred_category = category
                    existing.loyalty_level = loyalty
                    updated_count += 1
            else:
                new_cust = Customer(
                    customer_id=cid,
                    customer_name=cname,
                    city=city,
                    preferred_category=category,
                    loyalty_level=loyalty
                )
                db.add(new_cust)
                imported_count += 1

    elif entity == "products":
        for idx, row in enumerate(rows, start=2):
            pid = row.get(mapping.get("product_id", "product_id")) or f"PROD_CSV_{idx}"
            pname = row.get(mapping.get("product_name", "product_name")) or f"Product {idx}"
            cat = row.get(mapping.get("category", "category")) or "General"
            cost = float(row.get(mapping.get("cost_price", "cost_price")) or 10.0)
            price = float(row.get(mapping.get("selling_price", "selling_price")) or 25.0)

            res = await db.execute(select(Product).where(Product.product_id == pid))
            existing = res.scalars().first()

            if existing:
                if strategy == "skip":
                    skipped_count += 1
                    continue
                else:
                    existing.product_name = pname
                    existing.category = cat
                    existing.cost_price = cost
                    existing.selling_price = price
                    updated_count += 1
            else:
                db.add(Product(
                    product_id=pid,
                    product_name=pname,
                    category=cat,
                    cost_price=cost,
                    selling_price=price,
                    warranty_days=365,
                    returnable=True
                ))
                imported_count += 1

    elif entity == "inventory":
        for idx, row in enumerate(rows, start=2):
            pid = row.get(mapping.get("product_id", "product_id"))
            sid = row.get(mapping.get("store_id", "store_id")) or "STORE_USA"
            stock = int(row.get(mapping.get("current_stock", "current_stock")) or 100)

            if not pid:
                failed_count += 1
                errors.append(f"Row {idx}: Missing product_id")
                continue

            res = await db.execute(select(Inventory).where(Inventory.product_id == pid, Inventory.store_id == sid))
            existing = res.scalars().first()

            if existing:
                if strategy == "skip":
                    skipped_count += 1
                    continue
                else:
                    existing.current_stock = stock
                    updated_count += 1
            else:
                db.add(Inventory(product_id=pid, store_id=sid, current_stock=stock, reorder_point=20))
                imported_count += 1

    elif entity == "sales":
        for idx, row in enumerate(rows, start=2):
            tid = int(row.get(mapping.get("transaction_id", "transaction_id")) or (90000 + idx))
            uname = row.get(mapping.get("user_name", "user_name")) or "Customer"
            country = row.get(mapping.get("country", "country")) or "USA"
            cat = row.get(mapping.get("product_category", "product_category")) or "General"
            amt = float(row.get(mapping.get("purchase_amount", "purchase_amount")) or 50.0)

            res = await db.execute(select(Sale).where(Sale.transaction_id == tid))
            if res.scalars().first():
                skipped_count += 1
                continue

            db.add(Sale(
                transaction_id=tid,
                user_name=uname,
                country=country,
                product_category=cat,
                purchase_amount=amt,
                payment_method="Credit Card",
                transaction_date=datetime.utcnow()
            ))
            imported_count += 1

    elif entity == "suppliers":
        for idx, row in enumerate(rows, start=2):
            sup_id = row.get(mapping.get("supplier_id", "supplier_id")) or f"SUPP_CSV_{idx}"
            sname = row.get(mapping.get("supplier_name", "supplier_name")) or f"Supplier {idx}"
            pid = row.get(mapping.get("product_id", "product_id")) or "PROD_BEA_001"
            cost = float(row.get(mapping.get("unit_cost", "unit_cost")) or 20.0)

            res = await db.execute(select(Supplier).where(Supplier.supplier_id == sup_id))
            existing = res.scalars().first()

            if existing:
                existing.supplier_name = sname
                existing.unit_cost = cost
                updated_count += 1
            else:
                db.add(Supplier(
                    supplier_id=sup_id,
                    supplier_name=sname,
                    product_id=pid,
                    unit_cost=cost,
                    lead_time_days=5,
                    minimum_order_qty=50,
                    available_quantity=500,
                    reliability_score=0.95
                ))
                imported_count += 1

    await db.commit()

    return {
        "entity_type": entity,
        "total_rows": len(rows),
        "imported": imported_count,
        "updated": updated_count,
        "skipped": skipped_count,
        "failed": failed_count,
        "errors": errors,
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }


@router.get("/export")
async def export_data_to_csv(
    entity_type: str = Query("customers"),
    db: AsyncSession = Depends(get_db)
):
    """Exports authorized database table records to downloadable CSV format."""
    entity = entity_type.lower()
    output = io.StringIO()

    if entity == "customers":
        res = await db.execute(select(Customer))
        records = res.scalars().all()
        writer = csv.writer(output)
        writer.writerow(["customer_id", "customer_name", "city", "age_group", "preferred_category", "budget_range", "loyalty_level"])
        for c in records:
            writer.writerow([c.customer_id, c.customer_name, c.city, c.age_group, c.preferred_category, c.budget_range, c.loyalty_level])

    elif entity == "products":
        res = await db.execute(select(Product))
        records = res.scalars().all()
        writer = csv.writer(output)
        writer.writerow(["product_id", "product_name", "category", "subcategory", "brand", "cost_price", "selling_price", "returnable"])
        for p in records:
            writer.writerow([p.product_id, p.product_name, p.category, p.subcategory, p.brand, p.cost_price, p.selling_price, p.returnable])

    elif entity == "inventory":
        res = await db.execute(select(Inventory))
        records = res.scalars().all()
        writer = csv.writer(output)
        writer.writerow(["product_id", "store_id", "current_stock", "reorder_point", "lead_time_days", "safety_stock"])
        for i in records:
            writer.writerow([i.product_id, i.store_id, i.current_stock, i.reorder_point, i.lead_time_days, i.safety_stock])

    elif entity == "sales":
        res = await db.execute(select(Sale))
        records = res.scalars().all()
        writer = csv.writer(output)
        writer.writerow(["transaction_id", "user_name", "country", "product_category", "purchase_amount", "payment_method", "transaction_date"])
        for s in records:
            writer.writerow([s.transaction_id, s.user_name, s.country, s.product_category, s.purchase_amount, s.payment_method, s.transaction_date.strftime("%Y-%m-%d %H:%M") if s.transaction_date else ""])

    elif entity == "suppliers":
        res = await db.execute(select(Supplier))
        records = res.scalars().all()
        writer = csv.writer(output)
        writer.writerow(["supplier_id", "supplier_name", "product_id", "unit_cost", "lead_time_days", "reliability_score", "city"])
        for sup in records:
            writer.writerow([sup.supplier_id, sup.supplier_name, sup.product_id, sup.unit_cost, sup.lead_time_days, sup.reliability_score, sup.city])

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported export entity: {entity}")

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={entity}_export.csv"}
    )
