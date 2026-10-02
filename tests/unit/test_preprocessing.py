"""
Unit Tests for Data Preprocessing and Feature Engineering Pipelines
"""

import os
import pandas as pd
import numpy as np
from ml.preprocessing import RetailDataPreprocessor
from ml.feature_engineering import DemandFeatureEngineer


def test_preprocessor_column_cleaning():
    preprocessor = RetailDataPreprocessor()
    df_raw = pd.DataFrame({
        "Transaction ID": [1, 2],
        "User Name": ["Alice", "Bob"],
        "Purchase-Amount": [100.5, 200.0]
    })
    df_clean = preprocessor.clean_column_names(df_raw)
    assert list(df_clean.columns) == ["transaction_id", "user_name", "purchase_amount"]


def test_preprocessor_date_conversion():
    preprocessor = RetailDataPreprocessor()
    df_raw = pd.DataFrame({
        "transaction_date": ["2023-05-10", "2023-05-11", "invalid_date"]
    })
    df_clean = preprocessor.convert_dates(df_raw, date_col="transaction_date")
    assert len(df_clean) == 2
    assert pd.api.types.is_datetime64_any_dtype(df_clean["transaction_date"])


def test_preprocessor_missing_and_duplicates():
    preprocessor = RetailDataPreprocessor()
    df_raw = pd.DataFrame({
        "transaction_id": [1, 1, 2],
        "purchase_amount": [10.0, 10.0, np.nan],
        "age": [25, 25, 30]
    })
    df_no_dups = preprocessor.remove_duplicates(df_raw)
    assert len(df_no_dups) == 2
    
    df_clean = preprocessor.handle_missing_values(df_no_dups)
    assert df_clean["purchase_amount"].isnull().sum() == 0


def test_preprocessor_invalid_numerics():
    preprocessor = RetailDataPreprocessor()
    df_raw = pd.DataFrame({
        "purchase_amount": [-5.0, 50.0, 1000.0],
        "age": [5, 35, 150]
    })
    df_valid = preprocessor.detect_invalid_numerics(df_raw)
    assert len(df_valid) == 1
    assert df_valid.iloc[0]["purchase_amount"] == 50.0
    assert df_valid.iloc[0]["age"] == 35


def test_feature_engineering_time_features():
    engineer = DemandFeatureEngineer()
    df_raw = pd.DataFrame({
        "transaction_date": pd.to_datetime(["2023-07-04", "2023-11-24"]),
        "product_category": ["Electronics", "Electronics"],
        "units_sold": [10, 20],
        "total_revenue": [1000.0, 2000.0],
        "avg_price": [100.0, 100.0]
    })
    df_feat = engineer.create_calendar_features(df_raw)
    df_feat = engineer.create_promotion_indicators(df_feat)

    assert "day" in df_feat.columns
    assert "month" in df_feat.columns
    assert "year" in df_feat.columns
    assert "day_of_week" in df_feat.columns
    assert "is_weekend" in df_feat.columns
    assert "promotion_indicator" in df_feat.columns
    
    # 2023-11-24 is November (is_holiday_season) -> promotion_indicator == 1
    assert df_feat.iloc[1]["promotion_indicator"] == 1


def test_time_aware_split_ordering():
    engineer = DemandFeatureEngineer()
    df_feat = pd.read_csv("data/processed/feature_dataset.csv")
    train_df, val_df, test_df, _ = engineer.time_aware_split(df_feat)

    max_train_date = pd.to_datetime(train_df["transaction_date"]).max()
    min_val_date = pd.to_datetime(val_df["transaction_date"]).min()
    max_val_date = pd.to_datetime(val_df["transaction_date"]).max()
    min_test_date = pd.to_datetime(test_df["transaction_date"]).min()

    assert max_train_date <= min_val_date, "Train max date must be <= Validation min date"
    assert max_val_date <= min_test_date, "Validation max date must be <= Test min date"


def test_data_leakage_protection():
    engineer = DemandFeatureEngineer()
    df_feat = pd.read_csv("data/processed/feature_dataset.csv")
    
    for leaked_col in engineer.DERIVED_BUSINESS_TARGETS:
        assert leaked_col not in df_feat.columns, f"Target leakage detected! {leaked_col} found in feature dataset"
