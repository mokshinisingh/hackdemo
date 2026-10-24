import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy", "database": "connected"}

def test_list_jurisdictions():
    res = client.get("/api/jurisdictions")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert any(j["code"] == "IN-CENTRAL" for j in data)

def test_legal_assistant_endpoint():
    payload = {
        "query_text": "What are my rights if my landlord cuts off my water supply?",
        "jurisdiction_code": "IN-CENTRAL",
        "category": "tenancy"
    }
    res = client.post("/api/legal-assistant", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "simple_explanation" in data
    assert "legal_information" in data
    assert len(data["next_steps"]) > 0
    assert len(data["sources"]) > 0

def test_privacy_detect_endpoint():
    payload = {
        "text": "Tenant Aadhaar is 8877 6655 4433 and PAN is ABCDE1234F."
    }
    res = client.post("/api/privacy/detect", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["findings_count"] >= 2
    types = {f["entity_type"] for f in data["findings"]}
    assert "AADHAAR" in types
    assert "PAN" in types

def test_privacy_redact_endpoint():
    payload = {
        "text": "My phone is 9876543210.",
        "findings": [
            {
                "entity_type": "PHONE",
                "detected_text": "9876543210",
                "start_offset": 12,
                "end_offset": 22,
                "confidence_score": 0.9,
                "is_redacted": True,
                "placeholder": "[PHONE_1]"
            }
        ]
    }
    res = client.post("/api/privacy/redact", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "9876543210" not in data["sanitized_text"]
    assert "[PHONE_1]" in data["sanitized_text"]

def test_legal_guides_endpoint():
    res = client.get("/api/legal-guides")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert any("rental" in g["slug"] for g in data)

def test_resources_endpoint():
    res = client.get("/api/resources")
    assert res.status_code == 200
    data = res.json()
    assert any("NALSA" in r["name"] for r in data)
