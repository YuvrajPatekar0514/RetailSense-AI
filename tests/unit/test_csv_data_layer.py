"""
Unit tests for CSV Data Import, Export, Template Download, and Mapping Engine
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_csv_template_download():
    response = client.get("/api/v1/data/template/customers")
    assert response.status_code == 200
    assert "customer_id,customer_name" in response.text
    assert response.headers["content-type"] == "text/csv; charset=utf-8"


def test_csv_template_download_invalid_entity():
    response = client.get("/api/v1/data/template/unknown_entity")
    assert response.status_code == 400


def test_csv_preview_upload():
    csv_content = "customer_id,customer_name,city,loyalty_level\nCUST_TEST_1,Alice Smith,New York,Gold\n"
    files = {"file": ("test.csv", csv_content.encode("utf-8"), "text/csv")}
    
    response = client.post("/api/v1/data/import/preview", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["total_rows"] == 1
    assert "customer_id" in data["headers"]
    assert len(data["sample_rows"]) == 1
    assert data["sample_rows"][0]["customer_name"] == "Alice Smith"
