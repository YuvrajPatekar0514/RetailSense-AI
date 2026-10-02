"""
RetailSense AI — Model Registry & Artifact Management Module

Provides persistent storage, versioning, metadata logging, and loading for trained ML models.
"""

import os
import json
import joblib
from typing import Dict, Any, Tuple, List, Optional
from datetime import datetime


class ModelRegistry:
    """
    Registry for managing machine learning models, artifacts, and metadata.
    """

    def __init__(self, base_dir: str = "models/demand_model"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def save_model(
        self,
        model: Any,
        model_name: str,
        metrics: Dict[str, float],
        feature_names: List[str],
        metadata: Optional[Dict[str, Any]] = None,
        is_best: bool = True
    ) -> str:
        """Saves model artifact, metadata, metrics, and feature schema."""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        model_filename = "best_model.pkl" if is_best else f"model_{timestamp}.pkl"
        model_path = os.path.join(self.base_dir, model_filename)

        # Save model binary
        joblib.dump(model, model_path)

        # Save feature schema
        features_path = os.path.join(self.base_dir, "feature_names.json")
        with open(features_path, "w", encoding="utf-8") as f:
            json.dump(feature_names, f, indent=2)

        # Save metrics
        metrics_path = os.path.join(self.base_dir, "metrics.json")
        with open(metrics_path, "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)

        # Save comprehensive metadata
        full_metadata = {
            "model_name": model_name,
            "saved_at": datetime.utcnow().isoformat(),
            "model_path": model_path,
            "feature_count": len(feature_names),
            "metrics": metrics,
            "extra_info": metadata or {}
        }
        meta_path = os.path.join(self.base_dir, "metadata.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(full_metadata, f, indent=2)

        print(f"[ModelRegistry] Model successfully saved to {model_path}")
        return model_path

    def load_model(self, model_dir: Optional[str] = None) -> Tuple[Any, Dict[str, Any], List[str]]:
        """Loads best trained model, metadata, and feature schema."""
        target_dir = model_dir or self.base_dir
        model_path = os.path.join(target_dir, "best_model.pkl")
        meta_path = os.path.join(target_dir, "metadata.json")
        features_path = os.path.join(target_dir, "feature_names.json")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model artifact not found at {model_path}")

        model = joblib.load(model_path)

        with open(meta_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)

        with open(features_path, "r", encoding="utf-8") as f:
            feature_names = json.load(f)

        return model, metadata, feature_names


if __name__ == "__main__":
    registry = ModelRegistry()
    print("ModelRegistry initialized.")
