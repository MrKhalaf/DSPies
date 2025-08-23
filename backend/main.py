"""
Live Optimizing Classifier - FastAPI Backend
Main application entry point with API routes and SSE streaming.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import json
import logging
from typing import Dict, Any
import os
from dotenv import load_dotenv

from models import RunRequest, RunResponse, RunStatus
from optimizer import DSPyOptimizer
from run_store import RunStore
from config import load_config

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Live Optimizing Classifier",
    description="DSPy prompt optimization demo with live visualization",
    version="1.0.0"
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
config = load_config()
optimizer = DSPyOptimizer(config)
run_store = RunStore()

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Live Optimizing Classifier API"}

@app.post("/api/run", response_model=RunResponse)
async def create_run(request: RunRequest, background_tasks: BackgroundTasks):
    """
    Create a new optimization run.
    Returns run_id immediately and processes in background.
    """
    try:
        # Validate input length
        if len(request.input_text) > config["max_input_chars"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Input text exceeds {config['max_input_chars']} characters"
            )
        
        # Create run
        run_id = run_store.create_run(request.input_text)
        
        # Start background processing
        background_tasks.add_task(process_run, run_id)
        
        logger.info(f"Created run {run_id} for input: {request.input_text[:50]}...")
        
        return RunResponse(run_id=run_id)
        
    except Exception as e:
        logger.error(f"Error creating run: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create run")

@app.get("/api/run/{run_id}/stream")
async def stream_run(run_id: str):
    """
    Stream run events via Server-Sent Events (SSE).
    """
    if not run_store.run_exists(run_id):
        raise HTTPException(status_code=404, detail="Run not found")
    
    async def event_generator():
        """Generate SSE events for the run."""
        try:
            # Send any existing events first
            events = run_store.get_events(run_id)
            for event in events:
                yield f"data: {json.dumps(event)}\n\n"
            
            # Stream new events as they arrive
            last_event_count = len(events)
            while True:
                await asyncio.sleep(0.1)  # Poll every 100ms
                
                current_events = run_store.get_events(run_id)
                
                # Send new events
                for event in current_events[last_event_count:]:
                    yield f"data: {json.dumps(event)}\n\n"
                
                last_event_count = len(current_events)
                
                # Check if run is complete
                run_data = run_store.get_run(run_id)
                if run_data and run_data.get("status") == RunStatus.COMPLETE:
                    break
                    
        except Exception as e:
            logger.error(f"Error streaming run {run_id}: {str(e)}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
        }
    )

@app.get("/api/run/{run_id}")
async def get_run(run_id: str):
    """Get complete run data including results and event log."""
    run_data = run_store.get_run(run_id)
    if not run_data:
        raise HTTPException(status_code=404, detail="Run not found")
    
    return run_data

@app.get("/api/run/{run_id}/replay")
async def get_replay_data(run_id: str):
    """Get event log for client-side replay."""
    events = run_store.get_events(run_id)
    if not events:
        raise HTTPException(status_code=404, detail="Run not found")
    
    return {"events": events}

@app.get("/api/config")
async def get_config():
    """Get public configuration for frontend."""
    return {
        "labels": config["labels"],
        "max_input_chars": config["max_input_chars"],
        "demo_examples": config["demo_examples"],
        "variant_count": config["variant_count"]
    }

async def process_run(run_id: str):
    """
    Background task to process a run through DSPy optimization.
    """
    try:
        logger.info(f"Starting to process run {run_id}")
        
        run_data = run_store.get_run(run_id)
        if not run_data:
            logger.error(f"Run {run_id} not found for processing")
            return
        
        input_text = run_data["input_text"]
        logger.info(f"Processing run {run_id} with input: {input_text[:50]}...")
        
        # Update status to processing
        run_store.update_run_status(run_id, RunStatus.PROCESSING)
        logger.info(f"Updated run {run_id} status to PROCESSING")
        
        # Run optimization
        logger.info(f"Starting optimization for run {run_id}")
        await optimizer.optimize(run_id, input_text, run_store)
        logger.info(f"Optimization completed for run {run_id}")
        
        # Mark as complete
        run_store.update_run_status(run_id, RunStatus.COMPLETE)
        logger.info(f"Completed run {run_id}")
        
    except Exception as e:
        logger.error(f"Error processing run {run_id}: {str(e)}", exc_info=True)
        run_store.update_run_status(run_id, RunStatus.ERROR)
        run_store.add_event(run_id, {
            "type": "Error",
            "ts": asyncio.get_event_loop().time() * 1000,
            "payload": {"error": str(e)}
        })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)