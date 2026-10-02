"""
Unit Tests for Machine Learning Layer (Training, Registry, Evaluation, Prediction, & Data Leakage Shield)
"""

import os
import sys
import numpy as np
import pandas as pd

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ml.evaluate import calculate_metrics
from ml.model_registry import ModelRegistry
from ml.predict import forecast_demand, DemandPredictor


def test_calculate_metrics_accuracy():
    y_true = np.array([10.0, 20.0, 30.0, 40.0])
    y_pred = np.array([12.0, 18.0, 31.0, 39.0])
    metrics = calculate_metrics(y_true, y_pred)

    assert "MAE" in metrics
    assert "RMSE" in metrics
    assert "R2" in metrics
    assert "MAPE" in metrics
    assert metrics["MAE"] == 1.5
    assert metrics["R2"] > 0.90


def test_model_registry_integrity():
    registry = ModelRegistry("models/demand_model")
    model, metadata, feature_names = registry.load_model()

    assert model is not None
    assert "model_name" in metadata
    assert len(feature_names) > 0


def test_forecast_demand_api_contract():
    result = forecast_demand(product_id="PROD_TOYS_99", store_id="STORE_USA", horizon_days=7)

    assert "product_id" in result
    assert "store_id" in result
    assert "category" in result
    assert result["prediction_horizon_days"] == 7
    assert len(result["predicted_demand_daily"]) == 7
    assert "total_predicted_units" in result
    assert result["model_name"] in ["Random Forest Regressor", "XGBoost Regressor", "Linear Regression"]
    
    metrics = result["evaluation_metrics"]
    assert "MAE" in metrics
    assert "RMSE" in metrics
    assert "R2" in metrics
    assert "MAPE" in metrics

    features = result["relevant_input_features"]
    assert "avg_price" in features
    assert "lag_1" in features
    assert "rolling_mean_7" in features

    explanation = result["explainable_prediction"]
    assert "top_drivers" in explanation
    assert "narrative" in explanation


def test_ml_data_leakage_shield():
    registry = ModelRegistry("models/demand_model")
    _, _, feature_names = registry.load_model()

    leaked_cols = [
        "forecast_7d_units", "reorder_point_units",
        "stockout_risk", "overstock_risk", "recommended_order_qty"
    ]
    for leaked in leaked_cols:
        assert leaked not in feature_names, f"CRITICAL LEAKAGE: {leaked} detected in trained model feature names!"
