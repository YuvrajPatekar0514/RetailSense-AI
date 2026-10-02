"""
RetailSense AI — Model Evaluation Module

Provides evaluation metrics computation (MAE, RMSE, R2, MAPE) and model comparison helpers.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Computes regression evaluation metrics: MAE, RMSE, R2, and MAPE.
    Applies epsilon-guard to handle zero actual targets in MAPE calculation.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = float(r2_score(y_true, y_pred))
    
    # Epsilon-protected MAPE where mathematically appropriate
    epsilon = 1e-5
    mape = float(np.mean(np.abs((y_true - y_pred) / np.maximum(np.abs(y_true), epsilon))) * 100)

    return {
        "MAE": round(mae, 4),
        "RMSE": round(rmse, 4),
        "R2": round(r2, 4),
        "MAPE": round(mape, 2)
    }


def evaluate_model(model: Any, X: pd.DataFrame, y: pd.Series, dataset_label: str = "Test") -> Dict[str, float]:
    """Evaluates a trained model on a feature matrix X and target y."""
    predictions = model.predict(X)
    metrics = calculate_metrics(y, predictions)
    metrics["dataset_label"] = dataset_label
    return metrics


def format_metrics_table(results: Dict[str, Dict[str, float]]) -> pd.DataFrame:
    """Formats model evaluation dictionary into a comparative pandas DataFrame."""
    rows = []
    for model_name, metrics in results.items():
        row = {"Model": model_name}
        row.update(metrics)
        rows.append(row)
    df_res = pd.DataFrame(rows)
    return df_res


if __name__ == "__main__":
    y_t = np.array([10, 20, 30, 40])
    y_p = np.array([11, 19, 28, 42])
    print(calculate_metrics(y_t, y_p))
