# Live Optimizing Classifier

A demo application showcasing DSPy's prompt optimization capabilities with live visualization.

## Overview

This application demonstrates how DSPy can optimize prompts in real-time by:
- Running multiple prompt variants simultaneously
- Scoring each variant using deterministic rules
- Selecting the best-performing variant
- Visualizing the optimization process with smooth animations

## Architecture

- **Frontend**: React + Framer Motion for animations
- **Backend**: FastAPI + DSPy for prompt optimization
- **LLM Provider**: Configurable (OpenAI, Anthropic, Azure, local)
- **Task**: Short-text classification + one-sentence summary

## Quick Start

1. Install dependencies:
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

2. Configure environment:
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env with your LLM provider credentials
   ```

3. Run the application:
   ```bash
   # Terminal 1: Backend
   cd backend
   uvicorn main:app --reload
   
   # Terminal 2: Frontend
   cd frontend
   npm start
   ```

4. Open http://localhost:3000 and start optimizing!

## Demo Flow

1. Enter text to classify (e.g., "I was double-charged after upgrading my plan")
2. Watch as 3+ prompt variants are tested in real-time
3. See scores appear and leaderboard update
4. Final result shows the winning variant with explanation
5. Use "Replay" to see the optimization again without re-running

## Performance Targets

- P50 run time: ≤5s
- P95 run time: ≤8s
- Cold start: ≤10s

## Configuration

See `backend/config.yaml` for customizing:
- Classification labels
- Scoring weights
- LLM provider settings
- Timeout values