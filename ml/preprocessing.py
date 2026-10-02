"""
RetailSense AI — Data Preprocessing Pipeline Module

This module provides a modular, production-grade data cleaning and validation
pipeline for retail transaction datasets.
"""

import os
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List


class RetailDataPreprocessor:
    """
    Automated preprocessing pipeline for retail datasets.
    Handles column normalization, date conversion, missing value imputation,
    duplicate removal, numerical sanity checks, and categorical validation.
    """

    ALLOWED_COUNTRIES = [
        "Canada", "Mexico", "Germany", "India", "France",
        "Australia", "USA", "Japan", "UK", "Brazil"
    ]

    ALLOWED_CATEGORIES = [
        "Toys", "Electronics", "Sports", "Books",
        "Clothing", "Grocery", "Home & Kitchen", "Beauty"
    ]

    ALLOWED_PAYMENT_METHODS = [
        "UPI", "Cash on Delivery", "Debit Card",
        "Credit Card", "PayPal", "Net Banking"
    ]

    def __init__(self):
        self.quality_report: Dict[str, Any] = {}

    def load_data(self, file_path: str) -> pd.DataFrame:
        """Loads dataset from CSV file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Dataset not found at path: {file_path}")
        df = pd.read_csv(file_path)
        self.quality_report["initial_row_count"] = int(len(df))
        self.quality_report["initial_column_count"] = int(len(df.columns))
        self.quality_report["raw_columns"] = list(df.columns)
        return df

    def clean_column_names(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardizes column names to clean snake_case format."""
        df = df.copy()
        df.columns = (
            df.columns.str.strip()
            .str.lower()
            .str.replace(" ", "_")
            .str.replace("-", "_")
        )
        self.quality_report["cleaned_columns"] = list(df.columns)
        return df

    def convert_dates(self, df: pd.DataFrame, date_col: str = "transaction_date") -> pd.DataFrame:
        """Converts date fields to standard pandas datetime objects."""
        df = df.copy()
        if date_col in df.columns:
            df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
            unparseable_dates = df[date_col].isnull().sum()
            self.quality_report["unparseable_date_count"] = int(unparseable_dates)
            if unparseable_dates > 0:
                df = df.dropna(subset=[date_col])
            
            # Sort chronologically
            df = df.sort_values(by=date_col).reset_index(drop=True)
            self.quality_report["min_date"] = str(df[date_col].min())
            self.quality_report["max_date"] = str(df[date_col].max())
        return df

    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Detects and handles missing values across numerical and categorical fields."""
        df = df.copy()
        missing_by_col = df.isnull().sum().to_dict()
        self.quality_report["missing_values_by_column"] = {k: int(v) for k, v in missing_by_col.items()}
        total_missing = sum(missing_by_col.values())
        self.quality_report["total_missing_values"] = int(total_missing)

        # Impute or drop if missing values exist
        if total_missing > 0:
            if "purchase_amount" in df.columns and df["purchase_amount"].isnull().sum() > 0:
                df["purchase_amount"] = df["purchase_amount"].fillna(df["purchase_amount"].median())
            if "age" in df.columns and df["age"].isnull().sum() > 0:
                df["age"] = df["age"].fillna(df["age"].median())
            df = df.fillna("Unknown")

        return df

    def remove_duplicates(self, df: pd.DataFrame, subset_cols: List[str] = None) -> pd.DataFrame:
        """Detects and removes duplicate records."""
        df = df.copy()
        duplicate_count = df.duplicated(subset=subset_cols).sum()
        self.quality_report["duplicate_record_count"] = int(duplicate_count)
        if duplicate_count > 0:
            df = df.drop_duplicates(subset=subset_cols).reset_index(drop=True)
        return df

    def detect_invalid_numerics(self, df: pd.DataFrame) -> pd.DataFrame:
        """Detects and filters out impossible numerical values (e.g. negative prices, invalid ages)."""
        df = df.copy()
        invalid_mask = pd.Series(False, index=df.index)

        if "purchase_amount" in df.columns:
            invalid_price = (df["purchase_amount"] <= 0) | (df["purchase_amount"] > 100000)
            invalid_mask = invalid_mask | invalid_price
            self.quality_report["invalid_purchase_amount_count"] = int(invalid_price.sum())

        if "age" in df.columns:
            invalid_age = (df["age"] < 10) | (df["age"] > 120)
            invalid_mask = invalid_mask | invalid_age
            self.quality_report["invalid_age_count"] = int(invalid_age.sum())

        invalid_total = int(invalid_mask.sum())
        self.quality_report["total_invalid_numerical_rows"] = invalid_total

        if invalid_total > 0:
            df = df[~invalid_mask].reset_index(drop=True)

        return df

    def validate_categoricals(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validates categorical columns against standard allowed value domain sets."""
        df = df.copy()

        if "country" in df.columns:
            invalid_country = ~df["country"].isin(self.ALLOWED_COUNTRIES)
            self.quality_report["invalid_country_count"] = int(invalid_country.sum())
            if invalid_country.sum() > 0:
                df.loc[invalid_country, "country"] = "Other"

        if "product_category" in df.columns:
            invalid_category = ~df["product_category"].isin(self.ALLOWED_CATEGORIES)
            self.quality_report["invalid_product_category_count"] = int(invalid_category.sum())

        if "payment_method" in df.columns:
            invalid_payment = ~df["payment_method"].isin(self.ALLOWED_PAYMENT_METHODS)
            self.quality_report["invalid_payment_method_count"] = int(invalid_payment.sum())

        return df

    def run_pipeline(
        self, file_path: str, output_path: str = None
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Executes full end-to-end preprocessing pipeline."""
        df = self.load_data(file_path)
        df = self.clean_column_names(df)
        df = self.convert_dates(df, date_col="transaction_date")
        df = self.handle_missing_values(df)
        df = self.remove_duplicates(df)
        df = self.detect_invalid_numerics(df)
        df = self.validate_categoricals(df)

        self.quality_report["final_row_count"] = int(len(df))
        self.quality_report["final_column_count"] = int(len(df.columns))

        if output_path:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            df.to_csv(output_path, index=False)
            print(f"[RetailDataPreprocessor] Cleaned dataset saved to: {output_path}")

        return df, self.quality_report


if __name__ == "__main__":
    preprocessor = RetailDataPreprocessor()
    raw_path = "data/raw/ecommerce_transactions.csv"
    processed_path = "data/processed/processed_retail.csv"
    df_clean, report = preprocessor.run_pipeline(raw_path, processed_path)
    print("Preprocessing completed successfully!")
    print(f"Final shape: {df_clean.shape}")
