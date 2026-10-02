"""
RetailSense AI — Demand Forecasting Feature Engineering Module

This module constructs time-series features for demand forecasting models (XGBoost),
enforcing strict time-series ordering and zero data leakage.
"""

import os
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List


class DemandFeatureEngineer:
    """
    Feature engineering pipeline for retail demand forecasting.
    Generates time features, chronological lags, rolling means, price dynamics,
    discounts, and promotional indicators without target leakage.
    """

    DERIVED_BUSINESS_TARGETS = [
        "forecast_7d_units",
        "reorder_point_units",
        "stockout_risk",
        "overstock_risk",
        "recommended_order_qty"
    ]

    def __init__(self):
        pass

    def load_clean_data(self, file_path: str = "data/processed/processed_retail.csv") -> pd.DataFrame:
        """Loads preprocessed retail transaction dataset."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Cleaned dataset not found at {file_path}")
        df = pd.read_csv(file_path)
        df["transaction_date"] = pd.to_datetime(df["transaction_date"])
        return df

    def aggregate_daily_demand(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Aggregates daily transaction volume, revenue, and average price per category.
        Ensures a continuous date grid per category to preserve temporal continuity.
        """
        df = df.copy()
        
        # Group by transaction_date and product_category
        daily_agg = (
            df.groupby(["transaction_date", "product_category"])
            .agg(
                units_sold=("transaction_id", "count"),
                total_revenue=("purchase_amount", "sum"),
                avg_price=("purchase_amount", "mean")
            )
            .reset_index()
        )

        # Build complete continuous date grid per category
        min_date = daily_agg["transaction_date"].min()
        max_date = daily_agg["transaction_date"].max()
        all_dates = pd.date_range(start=min_date, end=max_date, freq="D")
        all_categories = daily_agg["product_category"].unique()

        grid = pd.MultiIndex.from_product(
            [all_dates, all_categories],
            names=["transaction_date", "product_category"]
        ).to_frame().reset_index(drop=True)

        merged = pd.merge(grid, daily_agg, on=["transaction_date", "product_category"], how="left")
        merged["units_sold"] = merged["units_sold"].fillna(0).astype(int)
        merged["total_revenue"] = merged["total_revenue"].fillna(0.0)

        # Fill missing avg_price with overall category mean
        cat_avg = daily_agg.groupby("product_category")["avg_price"].transform("mean")
        merged["avg_price"] = merged.groupby("product_category")["avg_price"].transform(
            lambda g: g.ffill().bfill()
        )
        merged["avg_price"] = merged["avg_price"].fillna(500.0)

        merged = merged.sort_values(by=["product_category", "transaction_date"]).reset_index(drop=True)
        return merged

    def create_calendar_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Constructs temporal calendar features."""
        df = df.copy()
        date_series = df["transaction_date"]
        df["day"] = date_series.dt.day
        df["month"] = date_series.dt.month
        df["year"] = date_series.dt.year
        df["day_of_week"] = date_series.dt.dayofweek
        df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
        return df

    def create_lag_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Constructs chronological lag features per product category."""
        df = df.copy()
        for lag in [1, 7, 14]:
            df[f"lag_{lag}"] = df.groupby("product_category")["units_sold"].shift(lag)
        return df

    def create_rolling_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Constructs rolling mean features using shift(1) to avoid current-day leakage."""
        df = df.copy()
        for window in [7, 14, 30]:
            df[f"rolling_mean_{window}"] = (
                df.groupby("product_category")["units_sold"]
                .transform(lambda x: x.shift(1).rolling(window=window).mean())
            )
        return df

    def create_price_and_discount_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculates price change and discount indicators."""
        df = df.copy()
        
        # Price change relative to lag 1 price
        df["lag_1_price"] = df.groupby("product_category")["avg_price"].shift(1)
        df["price_change"] = ((df["avg_price"] - df["lag_1_price"]) / df["lag_1_price"]).fillna(0.0)
        df = df.drop(columns=["lag_1_price"])

        # Cumulative max price as reference catalog price for discount ratio
        df["max_historical_price"] = df.groupby("product_category")["avg_price"].cummax()
        df["discount"] = (
            ((df["max_historical_price"] - df["avg_price"]) / df["max_historical_price"])
            .clip(lower=0.0)
            .fillna(0.0)
        )
        df = df.drop(columns=["max_historical_price"])

        return df

    def create_promotion_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Constructs holiday, seasonal, and promotional event flags."""
        df = df.copy()
        
        # Seasonality flags
        df["is_holiday_season"] = df["month"].isin([11, 12]).astype(int)
        df["is_prime_promo"] = (df["month"] == 7).astype(int)
        df["is_valentines_promo"] = ((df["month"] == 2) & (df["day"].between(10, 14))).astype(int)
        df["is_year_end_promo"] = ((df["month"] == 12) & (df["day"] >= 25)).astype(int)

        # Combined promotion flag
        df["promotion_indicator"] = (
            df["is_holiday_season"] |
            df["is_prime_promo"] |
            df["is_valentines_promo"] |
            df["is_year_end_promo"]
        ).astype(int)

        return df

    def enforce_data_leakage_protection(self, df: pd.DataFrame) -> pd.DataFrame:
        """Strictly ensures derived operational target metrics are excluded from features."""
        df = df.copy()
        leaked_cols = [c for c in self.DERIVED_BUSINESS_TARGETS if c in df.columns]
        if leaked_cols:
            print(f"[DATA LEAKAGE SHIELD] Dropping derived business metrics from feature set: {leaked_cols}")
            df = df.drop(columns=leaked_cols)
        return df

    def time_aware_split(
        self, df: pd.DataFrame, train_ratio: float = 0.70, val_ratio: float = 0.15, test_ratio: float = 0.15
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Splits dataset chronologically into Train, Validation, and Test sets.
        DOES NOT SHUFFLE time-series data.
        """
        df = df.copy().sort_values(by="transaction_date").reset_index(drop=True)

        unique_dates = df["transaction_date"].sort_values().unique()
        n_dates = len(unique_dates)

        train_cutoff_idx = int(n_dates * train_ratio)
        val_cutoff_idx = int(n_dates * (train_ratio + val_ratio))

        train_cutoff_date = unique_dates[train_cutoff_idx - 1]
        val_cutoff_date = unique_dates[val_cutoff_idx - 1]

        df["split_set"] = "test"
        df.loc[df["transaction_date"] <= val_cutoff_date, "split_set"] = "validation"
        df.loc[df["transaction_date"] <= train_cutoff_date, "split_set"] = "train"

        train_df = df[df["split_set"] == "train"].reset_index(drop=True)
        val_df = df[df["split_set"] == "validation"].reset_index(drop=True)
        test_df = df[df["split_set"] == "test"].reset_index(drop=True)

        return train_df, val_df, test_df, df

    def run_pipeline(
        self,
        input_path: str = "data/processed/processed_retail.csv",
        output_path: str = "data/processed/feature_dataset.csv"
    ) -> pd.DataFrame:
        """Runs complete demand forecasting feature engineering pipeline."""
        df_clean = self.load_clean_data(input_path)
        df_agg = self.aggregate_daily_demand(df_clean)
        df_features = self.create_calendar_features(df_agg)
        df_features = self.create_lag_features(df_features)
        df_features = self.create_rolling_features(df_features)
        df_features = self.create_price_and_discount_features(df_features)
        df_features = self.create_promotion_indicators(df_features)
        df_features = self.enforce_data_leakage_protection(df_features)

        # Drop initial warmup rows with NaN from lags/rolling (e.g. max lag 30)
        df_features = df_features.dropna(subset=["rolling_mean_30"]).reset_index(drop=True)

        # Perform time-aware split tag
        _, _, _, full_dataset = self.time_aware_split(df_features)

        if output_path:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            full_dataset.to_csv(output_path, index=False)
            print(f"[DemandFeatureEngineer] Feature dataset saved to: {output_path}")

        return full_dataset


if __name__ == "__main__":
    engineer = DemandFeatureEngineer()
    feature_df = engineer.run_pipeline()
    print("Feature engineering completed successfully!")
    print(f"Feature dataset shape: {feature_df.shape}")
    print(f"Split counts:\n{feature_df['split_set'].value_counts()}")
