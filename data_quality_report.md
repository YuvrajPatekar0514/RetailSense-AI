# RetailSense AI — Data Quality & Feature Engineering Audit Report

## 1. Executive Summary

This report documents the automated data engineering, preprocessing quality audit, and time-series feature pipeline results for **RetailSense AI**.

The pipeline ingests raw transaction data (`data/raw/ecommerce_transactions.csv`), cleans and validates all operational attributes, aggregates daily demand time-series by product category, generates lag/rolling/price/promotional features without target leakage, and partitions data chronologically into time-aware train, validation, and test datasets.

---

## 2. Ingestion & Preprocessing Quality Metrics

### 2.1 Overview Comparison Table

| Metric | Raw Dataset | Cleaned Dataset (`processed_retail.csv`) | Aggregated Feature Set (`feature_dataset.csv`) |
| :--- | :--- | :--- | :--- |
| **File Location** | `data/raw/ecommerce_transactions.csv` | `data/processed/processed_retail.csv` | `data/processed/feature_dataset.csv` |
| **Total Rows** | 50,000 | 50,000 | 5,608 |
| **Total Columns** | 8 | 8 | 24 |
| **Date Range** | 2023-03-09 to 2025-03-08 | 2023-03-09 to 2025-03-08 | 2023-04-08 to 2025-03-08 (Post 30d warmup) |
| **Missing Values** | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) |
| **Duplicate Rows** | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) |
| **Data Integrity Pass** | ✅ PASS | ✅ PASS | ✅ PASS |

---

### 2.2 Column Schema Transformation Mapping

| Raw Column Name | Cleaned Column Name | Target Data Type | Sanity Rules Applied | Validation Status |
| :--- | :--- | :--- | :--- | :--- |
| `Transaction_ID` | `transaction_id` | `INTEGER` | Unique transaction ID check | ✅ PASS |
| `User_Name` | `user_name` | `VARCHAR(255)` | Non-null string check | ✅ PASS |
| `Age` | `age` | `INTEGER` | Range check [10, 120] (Min: 18, Max: 70) | ✅ PASS |
| `Country` | `country` | `VARCHAR(100)` | Allowed 10 country domain check | ✅ PASS |
| `Product_Category` | `product_category` | `VARCHAR(100)` | Allowed 8 category domain check | ✅ PASS |
| `Purchase_Amount` | `purchase_amount` | `NUMERIC(10,2)` | Positive float check ($5.04 to $999.98) | ✅ PASS |
| `Payment_Method` | `payment_method` | `VARCHAR(50)` | Allowed 6 payment method check | ✅ PASS |
| `Transaction_Date` | `transaction_date` | `TIMESTAMP` | ISO date parsing & ordering | ✅ PASS |

---

## 3. Demand Forecasting Feature Set Audit

The feature engineering pipeline (`ml/feature_engineering.py`) transforms transaction records into daily time-series aggregated features per product category (`5,608` total category-days across 8 categories).

### 3.1 Generated Features Manifest

| Feature Name | Feature Type | Calculation Logic | Purpose in Forecasting Model |
| :--- | :--- | :--- | :--- |
| `day` | Calendar | `transaction_date.dt.day` | Day-of-month intra-month purchasing patterns |
| `month` | Calendar | `transaction_date.dt.month` | Seasonal monthly trends |
| `year` | Calendar | `transaction_date.dt.year` | Macro year-over-year growth |
| `day_of_week` | Calendar | `transaction_date.dt.dayofweek` (0=Mon, 6=Sun) | Weekly cyclic purchasing behavior |
| `is_weekend` | Calendar | `(day_of_week >= 5)` | Weekend vs weekday demand spikes |
| `lag_1` | Time-Series Lag | `units_sold.shift(1)` | Immediate prior-day demand velocity |
| `lag_7` | Time-Series Lag | `units_sold.shift(7)` | Prior-week same-day demand velocity |
| `lag_14` | Time-Series Lag | `units_sold.shift(14)` | Bi-weekly demand pattern signal |
| `rolling_mean_7` | Rolling Aggregate | `units_sold.shift(1).rolling(7).mean()` | 7-day short-term moving average |
| `rolling_mean_14` | Rolling Aggregate | `units_sold.shift(1).rolling(14).mean()` | 14-day mid-term moving average |
| `rolling_mean_30` | Rolling Aggregate | `units_sold.shift(1).rolling(30).mean()` | 30-day baseline trend moving average |
| `price_change` | Price Elasticity | `(avg_price - lag_1_price) / lag_1_price` | Price elasticity sensitivity |
| `discount` | Promotional | `(max_price - avg_price) / max_price` | Inferred promotional markdown ratio |
| `is_holiday_season` | Event Indicator | Month == 11 or 12 | Q4 Holiday sales rush (Black Friday/Xmas) |
| `is_prime_promo` | Event Indicator | Month == 7 | Mid-year summer promotion event |
| `is_valentines_promo` | Event Indicator | Month == 2 and Day between 10-14 | Valentine's gift purchasing spike |
| `is_year_end_promo` | Event Indicator | Month == 12 and Day >= 25 | Year-end clearance sale event |
| `promotion_indicator` | Event Indicator | Combined OR logic of event flags | Master promotional active flag |

---

## 4. Time-Aware Dataset Partitioning Audit

To prevent temporal lookahead bias and temporal leakage, the dataset is split chronologically into **Train**, **Validation**, and **Test** sets. **NO random shuffling is applied.**

### 4.1 Chronological Split Summary

```
   TRAIN SET (70%)             VAL SET (15%)           TEST SET (15%)
[2023-04-08 ──► 2024-08-12] | [2024-08-13 ──► 2024-11-25] | [2024-11-26 ──► 2025-03-08]
   3,920 records               840 records             848 records
```

| Split Name | Ratio (%) | Record Count | Start Date | End Date | Shuffled? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Train Set** | 70.0% | 3,920 | 2023-04-08 | 2024-08-12 | ❌ NO (Chronological) |
| **Validation Set** | 15.0% | 840 | 2024-08-13 | 2024-11-25 | ❌ NO (Chronological) |
| **Test Set** | 15.0% | 848 | 2025-11-26 | 2025-03-08 | ❌ NO (Chronological) |
| **Total** | 100.0% | 5,608 | 2023-04-08 | 2025-03-08 | Complete Grid |

---

## 5. Strict Data Leakage Compliance Audit

> [!IMPORTANT]
> **TARGET LEAKAGE AUDIT VERDICT: 100% COMPLIANT**
> 
> Downstream business target variables:
> - `forecast_7d_units`
> - `reorder_point_units`
> - `stockout_risk`
> - `overstock_risk`
> - `recommended_order_qty`
>
> **Verification Result**:
> The `DemandFeatureEngineer.enforce_data_leakage_protection()` filter confirmed **ZERO** instances of derived business target fields in `feature_dataset.csv`. All rolling aggregates utilize `shift(1)` to ensure current-day target demand is never included in historical rolling predictors.

---

## 6. Automated Test Suite Execution Results

Running unit tests in `tests/unit/test_preprocessing.py`:

```
test_preprocessor_column_cleaning PASSED                             [ 14%]
test_preprocessor_date_conversion PASSED                             [ 28%]
test_preprocessor_missing_and_duplicates PASSED                       [ 42%]
test_preprocessor_invalid_numerics PASSED                             [ 57%]
test_feature_engineering_time_features PASSED                        [ 71%]
test_time_aware_split_ordering PASSED                                [ 85%]
test_data_leakage_protection PASSED                                  [100%]

========================== 7 passed in 0.42s ==========================
```
