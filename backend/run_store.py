"""
In-memory storage for optimization runs.
Manages run data, events, and provides thread-safe access.
"""

from typing import Dict, List, Optional, Any
import threading
from datetime import datetime
from models import Run, Event, RunStatus, TaskConfig, create_run_id, create_event, EventType

class RunStore:
    """
    Thread-safe in-memory store for optimization runs.
    Stores run data and events with efficient access patterns.
    """
    
    def __init__(self):
        self._runs: Dict[str, Run] = {}
        self._lock = threading.RLock()
        self._max_runs = 100  # Keep last 100 runs in memory
    
    def create_run(self, input_text: str) -> str:
        """Create a new run and return its ID."""
        with self._lock:
            run_id = create_run_id()
            
            # Create task config (could be made configurable per run)
            from config import load_config
            config = load_config()
            
            task_config = TaskConfig(
                labels=config["labels"],
                summary_required=True
            )
            
            run = Run(
                run_id=run_id,
                input_text=input_text,
                created_at=datetime.utcnow(),
                status=RunStatus.PENDING,
                task_config=task_config
            )
            
            self._runs[run_id] = run
            
            # Clean up old runs if we exceed max
            self._cleanup_old_runs()
            
            return run_id
    
    def get_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        """Get complete run data as dictionary."""
        with self._lock:
            run = self._runs.get(run_id)
            if not run:
                return None
            
            return run.model_dump()
    
    def run_exists(self, run_id: str) -> bool:
        """Check if a run exists."""
        with self._lock:
            return run_id in self._runs
    
    def update_run_status(self, run_id: str, status: RunStatus) -> None:
        """Update the status of a run."""
        with self._lock:
            if run_id in self._runs:
                self._runs[run_id].status = status
    
    def add_variant(self, run_id: str, variant: Any) -> None:
        """Add a variant to a run."""
        with self._lock:
            if run_id in self._runs:
                self._runs[run_id].variants.append(variant)
    
    def add_score(self, run_id: str, score: Any) -> None:
        """Add a score to a run."""
        with self._lock:
            if run_id in self._runs:
                self._runs[run_id].scores.append(score)
    
    def set_winner(self, run_id: str, variant_id: str) -> None:
        """Set the winning variant for a run."""
        with self._lock:
            if run_id in self._runs:
                self._runs[run_id].winner_variant_id = variant_id
    
    def add_event(self, run_id: str, event_data: Dict[str, Any]) -> None:
        """Add an event to a run's event log."""
        with self._lock:
            if run_id in self._runs:
                event = Event(**event_data)
                self._runs[run_id].event_log.append(event)
    
    def get_events(self, run_id: str) -> List[Dict[str, Any]]:
        """Get all events for a run."""
        with self._lock:
            run = self._runs.get(run_id)
            if not run:
                return []
            
            return [event.model_dump() for event in run.event_log]
    
    def get_latest_runs(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get the most recent runs."""
        with self._lock:
            runs = list(self._runs.values())
            runs.sort(key=lambda r: r.created_at, reverse=True)
            return [run.model_dump() for run in runs[:limit]]
    
    def _cleanup_old_runs(self) -> None:
        """Remove old runs if we exceed the maximum."""
        if len(self._runs) <= self._max_runs:
            return
        
        # Sort by creation time and keep only the most recent
        runs = list(self._runs.values())
        runs.sort(key=lambda r: r.created_at, reverse=True)
        
        # Keep only the most recent runs
        to_keep = runs[:self._max_runs]
        keep_ids = {run.run_id for run in to_keep}
        
        # Remove old runs
        self._runs = {run_id: run for run_id, run in self._runs.items() if run_id in keep_ids}
    
    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about stored runs."""
        with self._lock:
            total_runs = len(self._runs)
            status_counts = {}
            
            for run in self._runs.values():
                status = run.status.value
                status_counts[status] = status_counts.get(status, 0) + 1
            
            return {
                "total_runs": total_runs,
                "status_counts": status_counts,
                "max_runs": self._max_runs
            }