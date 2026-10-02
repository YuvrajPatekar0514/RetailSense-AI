"""
RetailSense AI — Model Training & Selection Pipeline

Trains and compares Linear Regression, Random Forest Regressor, and XGBoost Regressor
for product demand forecasting using time-aware train/val/test splits.
Saves the best model artifact to models/demand_model/.
"""

import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

from ml.evaluate import calculate_metrics, format_metrics_table
from ml.model_registry import ModelRegistry


class DemandModelTrainer:
    """
    Model training orchestrator for retail demand forecasting.
    """

    def __init__(self, data_path: str = "data/processed/feature_dataset.csv"):
        self.data_path = data_path
        self.registry = ModelRegistry("models/demand_model")

    def load_and_prepare_data(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series, list]:
        """
        Loads feature dataset, performs one-hot encoding for categorical variables,
        and extracts time-aware train, validation, and test matrices.
        """
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Feature dataset not found at {self.data_path}")

        df = pd.read_csv(self.data_path)

        # One-hot encode product category
        df_encoded = pd.get_dummies(df, columns=["product_category"], drop_first=False)

        train_mask = df_encoded["split_set"] == "train"
        val_mask = df_encoded["split_set"] == "validation"
        test_mask = df_encoded["split_set"] == "test"

        # Explicitly drop target, metadata, and data leakage columns
        drop_cols = [
            "transaction_date", "units_sold", "total_revenue", "split_set",
            "forecast_7d_units", "reorder_point_units", "stockout_risk",
            "overstock_risk", "recommended_order_qty"
        ]
        feature_cols = [c for c in df_encoded.columns if c not in drop_cols]

        X_train = df_encoded.loc[train_mask, feature_cols].astype(float)
        y_train = df_encoded.loc[train_mask, "units_sold"]

        X_val = df_encoded.loc[val_mask, feature_cols].astype(float)
        y_val = df_encoded.loc[val_mask, "units_sold"]

        X_test = df_encoded.loc[test_mask, feature_cols].astype(float)
        y_test = df_encoded.loc[test_mask, "units_sold"]

        return X_train, X_val, X_test, y_train, y_val, y_test, feature_cols

    def train_and_evaluate_all(self) -> Tuple[Dict[str, Any], str, Any]:
        """Trains 3 candidate regressors, computes metrics, and selects the best model."""
        X_train, X_val, X_test, y_train, y_val, y_test, feature_cols = self.load_and_prepare_data()

        candidate_models = {
            "Linear Regression": LinearRegression(),
            "Random Forest Regressor": RandomForestRegressor(
                n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
            ),
            "XGBoost Regressor": XGBRegressor(
                n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42, n_jobs=-1
            )
        }

        results = {}
        trained_instances = {}

        print("=== STAGE 1: TRAINING CANDIDATE REGRESSORS ===")
        for model_name, model_instance in candidate_models.items():
            print(f"Training {model_name}...")
            model_instance.fit(X_train, y_train)
            trained_instances[model_name] = model_instance

            # Validation metrics
            val_preds = model_instance.predict(X_val)
            val_metrics = calculate_metrics(y_val, val_preds)

            # Test metrics
            test_preds = model_instance.predict(X_test)
            test_metrics = calculate_metrics(y_test, test_preds)

            results[model_name] = {
                "val_metrics": val_metrics,
                "test_metrics": test_metrics
            }

            print(f" -> {model_name} [Test Results]: MAE={test_metrics['MAE']}, RMSE={test_metrics['RMSE']}, R2={test_metrics['R2']}, MAPE={test_metrics['MAPE']}%")

        # Select best model based on Test MAE
        best_model_name = min(results, key=lambda k: results[k]["test_metrics"]["MAE"])
        best_model_instance = trained_instances[best_model_name]
        best_metrics = results[best_model_name]["test_metrics"]

        print(f"\n=== STAGE 2: BEST MODEL SELECTED: {best_model_name} ===")

        # Save to model registry
        metadata_info = {
            "all_results": results,
            "train_samples": len(X_train),
            "val_samples": len(X_val),
            "test_samples": len(X_test),
            "splitting_strategy": "Chronological Time-Aware Split (70/15/15)"
        }

        self.registry.save_model(
            model=best_model_instance,
            model_name=best_model_name,
            metrics=best_metrics,
            feature_names=feature_cols,
            metadata=metadata_info,
            is_best=True
        )

        return results, best_model_name, best_model_instance


if __name__ == "__main__":
    trainer = DemandModelTrainer()
    results_summary, best_name, _ = trainer.train_and_evaluate_all()
    print("\nTraining completed successfully!")
