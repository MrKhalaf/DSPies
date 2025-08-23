"""
Data models for the Live Optimizing Classifier.
Defines Pydantic models for API requests/responses and internal data structures.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum
import uuid
from datetime import datetime

class RunStatus(str, Enum):
    """Status of an optimization run."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETE = "complete"
    ERROR = "error"

class EventType(str, Enum):
    """Types of events that can occur during a run."""
    VARIANT_START = "VariantStart"
    VARIANT_OUTPUT = "VariantOutput"
    VARIANT_SCORED = "VariantScored"
    LEADER_CHANGE = "LeaderChange"
    RUN_COMPLETE = "RunComplete"
    ERROR = "Error"

class RunRequest(BaseModel):
    """Request to create a new optimization run."""
    input_text: str = Field(..., max_length=500, description="Text to classify and summarize")

class RunResponse(BaseModel):
    """Response when creating a new run."""
    run_id: str = Field(..., description="Unique identifier for the run")

class TaskConfig(BaseModel):
    """Configuration for the classification task."""
    labels: List[str] = Field(..., description="Available classification labels")
    summary_required: bool = Field(True, description="Whether summary is required")

class VariantOutput(BaseModel):
    """Output from a single variant."""
    category: str = Field(..., description="Classified category")
    summary: str = Field(..., description="One-sentence summary")

class Variant(BaseModel):
    """A single prompt variant and its results."""
    variant_id: str = Field(..., description="Unique identifier for this variant")
    prompt_spec: str = Field(..., description="Description of the prompt specification")
    output: Optional[VariantOutput] = Field(None, description="Model output")
    latency_ms: Optional[int] = Field(None, description="Response latency in milliseconds")
    error: Optional[str] = Field(None, description="Error message if variant failed")

class ScoreComponents(BaseModel):
    """Individual scoring components."""
    label_valid: float = Field(..., description="1 if category is in allowed labels, 0 otherwise")
    label_match: float = Field(..., description="1 if category matches detected intent, 0 otherwise")
    summary_len_ok: float = Field(..., description="1 if summary is ≤20 words, 0 otherwise")
    no_hedging: float = Field(..., description="1 if no hedging phrases detected, 0 otherwise")
    format_ok: float = Field(..., description="1 if output is properly formatted, 0 otherwise")

class Score(BaseModel):
    """Score for a variant."""
    variant_id: str = Field(..., description="Variant this score belongs to")
    total: float = Field(..., description="Total weighted score")
    components: ScoreComponents = Field(..., description="Individual score components")

class Event(BaseModel):
    """An event that occurred during optimization."""
    ts: float = Field(..., description="Timestamp in milliseconds")
    type: EventType = Field(..., description="Type of event")
    payload: Dict[str, Any] = Field(..., description="Event-specific data")

class Run(BaseModel):
    """Complete run data."""
    run_id: str = Field(..., description="Unique identifier")
    input_text: str = Field(..., description="Original input text")
    created_at: datetime = Field(..., description="When the run was created")
    status: RunStatus = Field(RunStatus.PENDING, description="Current status")
    variants: List[Variant] = Field(default_factory=list, description="All variants tested")
    scores: List[Score] = Field(default_factory=list, description="Scores for each variant")
    winner_variant_id: Optional[str] = Field(None, description="ID of the winning variant")
    task_config: TaskConfig = Field(..., description="Task configuration used")
    event_log: List[Event] = Field(default_factory=list, description="Chronological event log")

def create_run_id() -> str:
    """Generate a unique run ID."""
    return str(uuid.uuid4())

def create_variant_id(index: int) -> str:
    """Generate a variant ID."""
    return f"v{index + 1}"

def create_event(event_type: EventType, payload: Dict[str, Any]) -> Event:
    """Create a new event with current timestamp."""
    import time
    return Event(
        ts=time.time() * 1000,  # Convert to milliseconds
        type=event_type,
        payload=payload
    )