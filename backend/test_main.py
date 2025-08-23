"""
Basic tests for the Live Optimizing Classifier backend.
Tests core functionality without requiring LLM API calls.
"""

import pytest
import asyncio
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient

from main import app
from models import RunRequest, EventType
from scoring import VariantScorer
from run_store import RunStore
from config import load_config

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "message" in data

def test_get_config():
    """Test the configuration endpoint."""
    response = client.get("/api/config")
    assert response.status_code == 200
    data = response.json()
    assert "labels" in data
    assert "max_input_chars" in data
    assert "demo_examples" in data
    assert "variant_count" in data

def test_create_run():
    """Test creating a new optimization run."""
    request_data = {"input_text": "Test input for classification"}
    response = client.post("/api/run", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert "run_id" in data
    assert len(data["run_id"]) > 0

def test_create_run_validation():
    """Test input validation for run creation."""
    # Test empty input
    response = client.post("/api/run", json={"input_text": ""})
    assert response.status_code == 422
    
    # Test too long input
    long_text = "x" * 1000
    response = client.post("/api/run", json={"input_text": long_text})
    assert response.status_code == 400

def test_run_store():
    """Test the run store functionality."""
    store = RunStore()
    
    # Test creating a run
    run_id = store.create_run("Test input")
    assert run_id is not None
    assert store.run_exists(run_id)
    
    # Test getting run data
    run_data = store.get_run(run_id)
    assert run_data is not None
    assert run_data["input_text"] == "Test input"
    assert run_data["status"] == "pending"
    
    # Test adding events
    store.add_event(run_id, {
        "type": EventType.VARIANT_START,
        "ts": 1000,
        "payload": {"variant_id": "v1"}
    })
    
    events = store.get_events(run_id)
    assert len(events) == 1
    assert events[0]["type"] == EventType.VARIANT_START

def test_variant_scorer():
    """Test the deterministic scoring system."""
    config = load_config()
    scorer = VariantScorer(config)
    
    # Create a mock variant with good output
    from models import Variant, VariantOutput
    
    good_variant = Variant(
        variant_id="v1",
        prompt_spec="Test spec",
        output=VariantOutput(
            category="billing",
            summary="Customer has billing question"
        ),
        latency_ms=500
    )
    
    # Test scoring
    score = scorer.score_variant(good_variant, "I have a billing question")
    assert score.total > 0
    assert score.components.label_valid == 1.0  # billing is a valid label
    assert score.components.format_ok == 1.0    # proper format

def test_intent_detection():
    """Test the intent detection patterns."""
    config = load_config()
    scorer = VariantScorer(config)
    
    # Test billing intent
    billing_text = "I was charged twice for my subscription"
    intent = scorer._detect_intent(billing_text)
    assert intent == "billing"
    
    # Test technical intent
    tech_text = "The app keeps crashing when I try to login"
    intent = scorer._detect_intent(tech_text)
    assert intent == "technical"
    
    # Test cancellation intent
    cancel_text = "I want to cancel my account"
    intent = scorer._detect_intent(cancel_text)
    assert intent == "cancellation"

def test_score_explanation():
    """Test score explanation functionality."""
    config = load_config()
    scorer = VariantScorer(config)
    
    from models import Variant, VariantOutput, Score, ScoreComponents
    
    variant = Variant(
        variant_id="v1",
        prompt_spec="Test spec",
        output=VariantOutput(
            category="billing",
            summary="Short summary"
        )
    )
    
    score = Score(
        variant_id="v1",
        total=4.0,
        components=ScoreComponents(
            label_valid=1.0,
            label_match=1.0,
            summary_len_ok=1.0,
            no_hedging=1.0,
            format_ok=1.0
        )
    )
    
    explanation = scorer.explain_score(score, variant, "billing question")
    assert "explanations" in explanation
    assert explanation["total_score"] == 4.0
    assert len(explanation["explanations"]) > 0

if __name__ == "__main__":
    pytest.main([__file__])