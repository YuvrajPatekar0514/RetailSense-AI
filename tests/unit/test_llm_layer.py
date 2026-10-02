"""
Unit Tests for LLM & Generative AI Layer (Structured Schemas, Non-Fabrication, & Audit Metadata)
"""

import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from llm.service import GenerativeAIService
from llm.schemas import DecisionExplanation, GoalInterpretation, LLMAuditMetadata


def test_goal_interpretation_nlu():
    service = GenerativeAIService()
    res = service.interpret_goal("Reorder stock for PROD_BEA_001", role="seller")

    assert isinstance(res, GoalInterpretation)
    assert res.task_category == "INVENTORY_REORDER"
    assert "DemandForecastingAgent" in res.required_agents


def test_decision_explanation_structured_schema():
    service = GenerativeAIService()
    exp = service.generate_decision_explanation(
        decision="Approve Purchase Order for PROD_BEA_001",
        factual_data={"source": "database.inventory", "metrics": {"current_stock": 150, "reorder_point": 30}},
        model_predictions={"model_name": "Random Forest", "prediction_horizon_days": 7, "total_predicted_units": 66.72, "evaluation_metrics": {"MAE": 2.25}},
        retrieved_knowledge=[{"document_id": "DOC_01", "title": "Reorder Policy", "excerpt": "Orders > $5,000 require Admin approval."}],
        recommended_action="Execute PO with Supplier SUP_001"
    )

    assert isinstance(exp, DecisionExplanation)
    assert exp.decision == "Approve Purchase Order for PROD_BEA_001"
    assert exp.confidence >= 0.80
    
    # 1. Factual data check
    assert exp.supporting_data.source == "database.inventory"
    assert exp.supporting_data.metrics["current_stock"] == 150
    
    # 2. Model prediction check
    assert exp.model_predictions.model_name == "Random Forest"
    assert exp.model_predictions.predicted_units == 66.72
    
    # 3. Retrieved knowledge check
    assert len(exp.retrieved_knowledge) == 1
    assert exp.retrieved_knowledge[0].document_id == "DOC_01"
    
    # 4. Generated explanation check
    assert len(exp.generated_explanation) > 0


def test_audit_metadata_logging():
    service = GenerativeAIService()
    assert len(service.audit_logs) == 0

    service.interpret_goal("Forecast sales for next week", role="seller")
    assert len(service.audit_logs) == 1

    log_entry = service.audit_logs[0]
    assert "call_id" in log_entry
    assert log_entry["task_name"] == "interpret_goal"
    assert log_entry["latency_ms"] >= 0.0
    assert "tokens_used" in log_entry
