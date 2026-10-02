"""
RetailSense AI — Controlled Synthetic Supporting Data Generator

Generates supporting retail relational tables (products, suppliers, customers, orders, returns, promotions)
that maintain full foreign-key integrity and align with the primary ecommerce_transactions dataset.

LABEL: DEMO / SYNTHETIC DATA
"""

import os
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Set seed for reproducible synthetic generation
random.seed(42)
np.random.seed(42)

OUTPUT_DIR = "data/generated"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Primary raw dataset path for entity alignment
RAW_DATASET_PATH = "data/raw/ecommerce_transactions.csv"


def load_raw_entities():
    """Extracts real user names, categories, countries, and date ranges from primary dataset."""
    if os.path.exists(RAW_DATASET_PATH):
        df_raw = pd.read_csv(RAW_DATASET_PATH)
        user_names = sorted(df_raw["User_Name"].dropna().unique().tolist())
        categories = sorted(df_raw["Product_Category"].dropna().unique().tolist())
        countries = sorted(df_raw["Country"].dropna().unique().tolist())
        dates = pd.to_datetime(df_raw["Transaction_Date"]).sort_values().tolist()
        min_date = dates[0]
        max_date = dates[-1]
    else:
        user_names = [f"User_{i:03d}" for i in range(1, 101)]
        categories = ["Beauty", "Books", "Clothing", "Electronics", "Grocery", "Home & Kitchen", "Sports", "Toys"]
        countries = ["USA", "Canada", "UK", "Germany", "France", "Japan", "Australia", "India", "Brazil", "Mexico"]
        min_date = datetime(2023, 3, 9)
        max_date = datetime(2025, 3, 8)

    return user_names, categories, countries, min_date, max_date


def generate_products(categories):
    """Generates synthetic products catalog across the 8 retail categories."""
    subcategories = {
        "Beauty": ["Skincare", "Haircare", "Makeup", "Fragrance"],
        "Books": ["Fiction", "Non-Fiction", "Sci-Fi", "Self-Help"],
        "Clothing": ["Men's Wear", "Women's Wear", "Outerwear", "Activewear"],
        "Electronics": ["Audio", "Accessories", "Smart Home", "Wearables"],
        "Grocery": ["Organic Snacks", "Beverages", "Pantry Essentials", "Gourmet Foods"],
        "Home & Kitchen": ["Cookware", "Small Appliances", "Bedding", "Decor"],
        "Sports": ["Fitness Equipment", "Outdoor Gear", "Athletic Apparel", "Team Sports"],
        "Toys": ["Board Games", "Action Figures", "Puzzles", "Educational Toys"]
    }

    brands = {
        "Beauty": ["GlowBeauty", "PureSkin", "LuxeAura"],
        "Books": ["PenguinClassics", "HarperPulse", "OReillyMedia"],
        "Clothing": ["UrbanFit", "ApexWear", "NordicStyle"],
        "Electronics": ["TechPulse", "SoundVibe", "NovaGadgets"],
        "Grocery": ["NatureHarvest", "VitalOrganics", "DailyBites"],
        "Home & Kitchen": ["ChefPro", "CozyHome", "KitchenCraft"],
        "Sports": ["ProAthlete", "TrailBlazer", "FlexGear"],
        "Toys": ["PlayQuest", "FunZone", "WonderKids"]
    }

    products_list = []
    product_idx = 1

    for cat in categories:
        sub_list = subcategories.get(cat, ["General"])
        brand_list = brands.get(cat, ["GenericBrand"])
        
        for i in range(1, 6): # 5 products per category = 40 total catalog products
            pid = f"PROD_{cat[:3].upper()}_{i:03d}"
            sub = random.choice(sub_list)
            brand = random.choice(brand_list)
            pname = f"{brand} {sub} {cat} Item {i} [DEMO]"
            desc = f"Premium {sub.lower()} item from {brand} for high-quality retail experience."
            
            selling_price = round(random.uniform(15.0, 499.0), 2)
            cost_price = round(selling_price * random.uniform(0.50, 0.75), 2)
            warranty_days = random.choice([0, 30, 90, 180, 365]) if cat in ["Electronics", "Home & Kitchen", "Sports"] else 0
            returnable = random.choice([True, True, True, False]) # 75% returnable

            products_list.append({
                "product_id": pid,
                "product_name": pname,
                "category": cat,
                "subcategory": sub,
                "brand": brand,
                "description": desc,
                "cost_price": cost_price,
                "selling_price": selling_price,
                "warranty_days": warranty_days,
                "returnable": returnable
            })
            product_idx += 1

    df_products = pd.DataFrame(products_list)
    df_products.to_csv(os.path.join(OUTPUT_DIR, "products.csv"), index=False)
    print(f"[Generated] products.csv ({len(df_products)} rows)")
    return df_products


def generate_suppliers(df_products):
    """Generates synthetic suppliers providing catalog products."""
    cities = ["New York", "Toronto", "London", "Berlin", "Paris", "Tokyo", "Sydney", "Mumbai", "Sao Paulo", "Mexico City"]
    supplier_names = ["Global Logistics Inc", "Apex Supply Corp", "Nexus Distribution", "Vanguard Wholesale", "Pacific Traders"]
    
    suppliers_list = []
    supplier_id_counter = 1

    for _, prod in df_products.iterrows():
        s_count = random.choice([1, 2]) # 1 or 2 suppliers per product
        for _ in range(s_count):
            sid = f"SUP_{supplier_id_counter:03d}"
            sname = random.choice(supplier_names) + f" ({prod['category']})"
            unit_cost = round(prod["cost_price"] * random.uniform(0.90, 1.05), 2)
            lead_time = random.randint(3, 14)
            moq = random.choice([10, 25, 50, 100])
            avail_qty = random.randint(100, 2000)
            reliability = round(random.uniform(0.80, 0.99), 2)
            city = random.choice(cities)

            suppliers_list.append({
                "supplier_id": sid,
                "supplier_name": sname,
                "product_id": prod["product_id"],
                "unit_cost": unit_cost,
                "lead_time_days": lead_time,
                "minimum_order_qty": moq,
                "available_quantity": avail_qty,
                "reliability_score": reliability,
                "city": city
            })
            supplier_id_counter += 1

    df_suppliers = pd.DataFrame(suppliers_list)
    df_suppliers.to_csv(os.path.join(OUTPUT_DIR, "suppliers.csv"), index=False)
    print(f"[Generated] suppliers.csv ({len(df_suppliers)} rows)")
    return df_suppliers


def generate_customers(user_names, categories, countries):
    """Generates synthetic customer profiles aligned with primary dataset user names."""
    cities = {
        "USA": "New York", "Canada": "Toronto", "UK": "London", "Germany": "Berlin",
        "France": "Paris", "Japan": "Tokyo", "Australia": "Sydney", "India": "Mumbai",
        "Brazil": "Sao Paulo", "Mexico": "Mexico City"
    }

    customers_list = []
    for idx, name in enumerate(user_names, start=1):
        cid = f"CUST_{idx:03d}"
        country = countries[(idx - 1) % len(countries)]
        city = cities.get(country, "Capital City")
        age = random.randint(18, 70)
        
        if age < 30:
            age_group = "18-29"
        elif age < 45:
            age_group = "30-44"
        elif age < 60:
            age_group = "45-59"
        else:
            age_group = "60+"

        pref_cat = random.choice(categories)
        budget = random.choice(["Low (<$100)", "Medium ($100-$500)", "High ($500+)"])
        loyalty = random.choice(["Bronze", "Silver", "Gold", "Platinum"])

        customers_list.append({
            "customer_id": cid,
            "customer_name": name,
            "city": city,
            "age_group": age_group,
            "preferred_category": pref_cat,
            "budget_range": budget,
            "loyalty_level": loyalty
        })

    df_customers = pd.DataFrame(customers_list)
    df_customers.to_csv(os.path.join(OUTPUT_DIR, "customers.csv"), index=False)
    print(f"[Generated] customers.csv ({len(df_customers)} rows)")
    return df_customers


def generate_orders(df_customers, df_products, min_date, max_date, num_orders=2000):
    """Generates synthetic order transactions linking customers, products, and stores."""
    stores = [f"STORE_{c.upper().replace(' ', '_')}" for c in ["USA", "Canada", "UK", "Germany", "France", "Japan", "Australia", "India", "Brazil", "Mexico"]]
    payment_statuses = ["Completed", "Completed", "Completed", "Pending", "Failed"]
    order_statuses = ["Delivered", "Delivered", "Delivered", "Shipped", "Processing", "Cancelled"]

    orders_list = []
    cust_ids = df_customers["customer_id"].tolist()
    prod_ids = df_products["product_id"].tolist()
    prod_price_map = df_products.set_index("product_id")["selling_price"].to_dict()

    for i in range(1, num_orders + 1):
        oid = f"ORD_{i:05d}"
        cid = random.choice(cust_ids)
        pid = random.choice(prod_ids)
        store_id = random.choice(stores)
        
        # Random date between min_date and max_date
        delta_days = (max_date - min_date).days
        random_days = random.randint(0, max(0, delta_days))
        o_date = min_date + timedelta(days=random_days)
        
        qty = random.choice([1, 1, 1, 2, 3, 5])
        unit_price = prod_price_map.get(pid, 99.99)
        discount = round(random.choice([0.0, 0.0, 0.05, 0.10, 0.20]) * unit_price * qty, 2)
        p_status = random.choice(payment_statuses)
        o_status = "Cancelled" if p_status == "Failed" else random.choice(order_statuses)

        if o_status in ["Delivered", "Shipped"]:
            del_date = (o_date + timedelta(days=random.randint(2, 7))).strftime("%Y-%m-%d")
        else:
            del_date = None

        orders_list.append({
            "order_id": oid,
            "customer_id": cid,
            "product_id": pid,
            "store_id": store_id,
            "order_date": o_date.strftime("%Y-%m-%d"),
            "quantity": qty,
            "unit_price": unit_price,
            "discount": discount,
            "payment_status": p_status,
            "order_status": o_status,
            "delivery_date": del_date
        })

    df_orders = pd.DataFrame(orders_list)
    df_orders.to_csv(os.path.join(OUTPUT_DIR, "orders.csv"), index=False)
    print(f"[Generated] orders.csv ({len(df_orders)} rows)")
    return df_orders


def generate_returns(df_orders, df_products):
    """Generates synthetic customer returns linked to delivered orders."""
    delivered_orders = df_orders[df_orders["order_status"] == "Delivered"].copy()
    returnable_prod_ids = set(df_products[df_products["returnable"] == True]["product_id"].tolist())
    
    eligible_orders = delivered_orders[delivered_orders["product_id"].isin(returnable_prod_ids)]
    
    # Generate returns for ~10% of eligible orders
    sample_returns = eligible_orders.sample(frac=0.10, random_state=42).copy()
    
    reasons = ["Defective Product", "Wrong Size/Item", "Damaged Packaging", "Not as Described", "Changed Mind"]
    statuses = ["Refunded", "Refunded", "Approved", "Rejected"]

    returns_list = []
    for idx, row in sample_returns.reset_index(drop=True).iterrows():
        rid = f"RET_{idx+1:04d}"
        o_date = datetime.strptime(row["order_date"], "%Y-%m-%d")
        r_date = (o_date + timedelta(days=random.randint(3, 14))).strftime("%Y-%m-%d")
        reason = random.choice(reasons)
        status = random.choice(statuses)
        total_paid = (row["quantity"] * row["unit_price"]) - row["discount"]
        refund_amt = round(total_paid if status in ["Refunded", "Approved"] else 0.0, 2)

        returns_list.append({
            "return_id": rid,
            "order_id": row["order_id"],
            "customer_id": row["customer_id"],
            "product_id": row["product_id"],
            "return_date": r_date,
            "return_reason": reason,
            "return_status": status,
            "refund_amount": refund_amt
        })

    df_returns = pd.DataFrame(returns_list)
    df_returns.to_csv(os.path.join(OUTPUT_DIR, "returns.csv"), index=False)
    print(f"[Generated] returns.csv ({len(df_returns)} rows)")
    return df_returns


def generate_promotions(df_products, min_date, max_date):
    """Generates synthetic promotional marketing campaigns linked to products/categories."""
    promo_types = ["Flash Sale", "Holiday Special", "Category Markdown", "Clearance", "Loyalty Reward"]
    
    promotions_list = []
    prod_ids = df_products["product_id"].tolist()

    for i in range(1, 51): # 50 synthetic promotional campaigns
        pr_id = f"PROMO_{i:03d}"
        pid = random.choice(prod_ids)
        cat = df_products[df_products["product_id"] == pid]["category"].iloc[0]
        ptype = random.choice(promo_types)
        disc_pct = random.choice([5.0, 10.0, 15.0, 20.0, 25.0, 30.0, 50.0])

        delta_days = (max_date - min_date).days
        start_day_offset = random.randint(0, max(0, delta_days - 14))
        s_date = min_date + timedelta(days=start_day_offset)
        e_date = s_date + timedelta(days=random.randint(3, 14))

        promotions_list.append({
            "promotion_id": pr_id,
            "product_id": pid,
            "promotion_type": ptype,
            "discount_pct": disc_pct,
            "start_date": s_date.strftime("%Y-%m-%d"),
            "end_date": e_date.strftime("%Y-%m-%d"),
            "target_category": cat
        })

    df_promotions = pd.DataFrame(promotions_list)
    df_promotions.to_csv(os.path.join(OUTPUT_DIR, "promotions.csv"), index=False)
    print(f"[Generated] promotions.csv ({len(df_promotions)} rows)")
    return df_promotions


def main():
    print("=== SYNTHETIC SUPPORTING-DATA GENERATOR FOR RETAILSENSE AI ===")
    user_names, categories, countries, min_date, max_date = load_raw_entities()
    
    df_products = generate_products(categories)
    generate_suppliers(df_products)
    df_customers = generate_customers(user_names, categories, countries)
    df_orders = generate_orders(df_customers, df_products, min_date, max_date, num_orders=2000)
    generate_returns(df_orders, df_products)
    generate_promotions(df_products, min_date, max_date)
    
    print("\n[SUCCESS] Controlled synthetic supporting dataset generated in data/generated/")


if __name__ == "__main__":
    main()
