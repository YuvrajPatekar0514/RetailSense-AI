# RetailSense AI — Dataset Analysis & Data Engineering Specification

## Executive Summary
This document presents the definitive empirical data analysis for the raw datasets available in `data/raw/` for **RetailSense AI: Multi-Agent Autonomous Retail Intelligence & Decision Platform**. 

Before building ML algorithms, LangGraph multi-agent orchestrators, and FastAPI web services, this analysis establishes:
1. Exact schemas, data types, missing value distributions, and statistical properties of raw datasets.
2. Clear business applications for Seller, Customer, and Admin personas.
3. Strict data leakage boundaries and target column isolation rules to preserve ML modeling integrity.

---

## 1. Raw Dataset Overview: `data/raw/ecommerce_transactions.csv`

### 1.1 Dataset Identification & Volume
- **File Name**: `data/raw/ecommerce_transactions.csv`
- **File Size**: ~3.32 MB
- **Total Record Count**: `50,000` rows
- **Total Column Count**: `8` columns
- **Duplicate Records**: `0` (0.0%)
- **Total Missing / Null Values**: `0` across all cells

---

### 1.2 Column Schema & Data Types

| Column Name | Data Type (Pandas / Raw) | Target Data Type (PostgreSQL / App) | Missing Count | Null % | Unique Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Transaction_ID` | `int64` | `INTEGER PRIMARY KEY` | 0 | 0.0% | 50,000 | Unique identifier for each purchase transaction |
| `User_Name` | `object` / `string` | `VARCHAR(255)` | 0 | 0.0% | 31,908 | Name of the customer placing the order |
| `Age` | `int64` | `INTEGER` | 0 | 0.0% | 53 | Age of the customer in years (range: 18 – 70) |
| `Country` | `object` / `string` | `VARCHAR(100)` | 0 | 0.0% | 10 | Geographic country location of the user |
| `Product_Category` | `object` / `string` | `VARCHAR(100)` | 0 | 0.0% | 8 | Retail product category for the transaction |
| `Purchase_Amount` | `float64` | `NUMERIC(10, 2)` | 0 | 0.0% | 46,211 | Total monetary value of transaction ($USD) |
| `Payment_Method` | `object` / `string` | `VARCHAR(50)` | 0 | 0.0% | 6 | Payment gateway / instrument used |
| `Transaction_Date` | `object` / `string` | `TIMESTAMP / DATE` | 0 | 0.0% | 731 | Date of transaction execution |

---

### 1.3 Statistical Profile of Numerical Columns

| Metric | `Transaction_ID` | `Age` | `Purchase_Amount` ($) |
| :--- | :--- | :--- | :--- |
| **Count** | 50,000 | 50,000 | 50,000 |
| **Mean** | 25,000.5 | 43.97 | $503.16 |
| **Std Dev** | 14,433.90 | 15.26 | $286.56 |
| **Min** | 1 | 18 | $5.04 |
| **25th Percentile (Q1)** | 12,500.75 | 31 | $255.45 |
| **50th Percentile (Median)** | 25,000.50 | 44 | $503.11 |
| **75th Percentile (Q3)** | 37,500.25 | 57 | $751.16 |
| **Max** | 50,000 | 70 | $999.98 |

---

### 1.4 Categorical Column Breakdown

#### A. Geographic Distribution (`Country`)
- **Total Unique Countries**: 10
- **Distribution**:
  - `Canada`: 5,082 (10.16%)
  - `Mexico`: 5,059 (10.12%)
  - `Germany`: 5,047 (10.09%)
  - `India`: 4,996 (9.99%)
  - `France`: 4,993 (9.99%)
  - `Australia`: 4,985 (9.97%)
  - `USA`: 4,979 (9.96%)
  - `Japan`: 4,960 (9.92%)
  - `UK`: 4,951 (9.90%)
  - `Brazil`: 4,948 (9.90%)

#### B. Retail Categories (`Product_Category`)
- **Total Unique Categories**: 8
- **Distribution**:
  - `Toys`: 6,392 (12.78%)
  - `Electronics`: 6,320 (12.64%)
  - `Sports`: 6,312 (12.62%)
  - `Books`: 6,253 (12.51%)
  - `Clothing`: 6,224 (12.45%)
  - `Grocery`: 6,215 (12.43%)
  - `Home & Kitchen`: 6,209 (12.42%)
  - `Beauty`: 6,075 (12.15%)

#### C. Payment Methods (`Payment_Method`)
- **Total Unique Payment Methods**: 6
- **Distribution**:
  - `UPI`: 8,477 (16.95%)
  - `Cash on Delivery`: 8,434 (16.87%)
  - `Debit Card`: 8,355 (16.71%)
  - `Credit Card`: 8,310 (16.62%)
  - `PayPal`: 8,250 (16.50%)
  - `Net Banking`: 8,174 (16.35%)

---

### 1.5 Temporal & Time-Series Attributes
- **Start Date**: `2023-03-09`
- **End Date**: `2025-03-08`
- **Total Horizon**: 731 continuous days (~24 months / 2 full annual cycles)
- **Daily Transaction Velocity**: ~68.4 transactions / day
- **Seasonality & Trend**: uniform baseline transaction flow across all categories, suitable for daily time-series resampling, lag feature generation (7d, 14d, 30d), rolling statistical aggregates, and XGBoost demand forecasting.

---

## 2. Dataset Application & Feature Engineering Strategy

### 2.1 Primary Uses by Platform Personas

#### 1. Seller Persona
- **Category Demand Forecasting**: Aggregate daily category sales volume (`count`) and total revenue (`sum`) from `Transaction_Date`, `Product_Category`, and `Purchase_Amount` to train time-series forecasting models (XGBoost / Prophet / ARIMA).
- **Inventory Replenishment Planning**: Calculate reorder points, lead times, safety stocks, stockout probability, and recommended order quantities based on predicted demand.
- **Dynamic Pricing & Elasticity**: Analyze transaction amount distributions by product category and region to recommend pricing strategies.

#### 2. Customer Persona
- **Personalized Recommendations**: Utilize customer purchase history, category preferences, and age/demographic clusters for RAG embeddings and product cross-selling.
- **Tailored Promotions & Discounts**: Segment customers by monetary value (RFM: Recency, Frequency, Monetary) to deliver automated personalized discounts via the Autonomous Customer Agent.

#### 3. Admin Persona
- **Platform Analytics & Health**: Operational oversight of total GMV (Gross Merchandise Value), regional distribution, payment method breakdowns, and agent transaction decision logs.

---

## 3. Critical Data Leakage & Retail Operational Dataset Rules

> [!CAUTION]
> **STRICT DATA LEAKAGE PREVENTION DIRECTIVE**
> 
> When deriving or processing operational metrics, the dataset may contain pre-computed or downstream business decision outputs such as:
> - `forecast_7d_units`
> - `reorder_point_units`
> - `stockout_risk`
> - `overstock_risk`
> - `recommended_order_qty`
>
> **MANDATORY ENFORCEMENT**:
> 1. These fields are **derived target variables and business decision outputs**, NOT input features.
> 2. They **MUST NEVER** be fed as predictors/input features into Machine Learning models (e.g. XGBoost Demand Forecaster, Pricing Classifier, or Segmentation clustering).
> 3. Using downstream operational risk outputs as input features causes **severe target leakage** (data leakage), rendering ML performance metrics invalid.
> 4. ML models must predict future demand exclusively using historical transaction signals: past sales volume, lag features (7d/14d/30d), rolling averages, seasonal indicators, and demographic features.

---

## 4. Pipeline Summary & Next Steps

```
[data/raw/ecommerce_transactions.csv]
          │
          ▼
[ETL & Aggregation Pipeline] ──► Daily Resampling (Category x Date)
          │
          ├──► Raw Training Features (Lag 7/14/30, Rolling Mean, DayOfWeek, Month)
          │         │
          │         ▼
          │    [XGBoost Demand Forecaster]
          │         │
          │         ▼
          │    Predicted Demand (Units & Revenue)
          │         │
          ▼         ▼
[Derived Operational Layer (Calculated Business Outputs)]
  ├── forecast_7d_units
  ├── reorder_point_units
  ├── stockout_risk
  ├── overstock_risk
  └── recommended_order_qty
```
