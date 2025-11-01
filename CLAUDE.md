# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Live Optimizing Classifier** - A demo application showcasing DSPy's prompt optimization capabilities with live visualization. The app runs multiple LLM prompt variants simultaneously, scores them using deterministic rules, and visualizes the optimization process in real-time.

**Core Purpose:** Educational tool for demonstrating how DSPy optimizes prompts by testing multiple variants and selecting the best performer based on objective criteria.

## Development Commands

### Backend (FastAPI + DSPy)

```bash
# Navigate to backend
cd backend

# Setup virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys (OPENAI_API_KEY or ANTHROPIC_API_KEY)

# Run development server
uvicorn main:app --reload

# Run tests
pytest test_main.py -v

# Run single test
pytest test_main.py::test_name -v
```

### Frontend (React + TypeScript)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Docker

```bash
# Run entire stack
docker-compose up --build

# Stop services
docker-compose down
```

## Architecture

### Request Flow

1. **User submits text** → Frontend POST to `/api/run`
2. **Backend creates run** → Returns `run_id`, starts background processing
3. **Frontend connects to SSE** → `/api/run/{run_id}/stream`
4. **Optimizer executes variants** → 3 prompt variants run in sequence
5. **Events stream to frontend** → Real-time updates via Server-Sent Events
6. **Scoring happens** → Deterministic rules evaluate each variant
7. **Winner selected** → Best scoring variant chosen
8. **Frontend displays results** → Animated visualization of optimization process

### Key Components

**Backend (`backend/`):**
- `main.py` - FastAPI app with SSE streaming endpoints
- `optimizer.py` - DSPy orchestration, manages variant execution
- `scoring.py` - Deterministic rule-based evaluation (no LLM calls for scoring)
- `run_store.py` - Thread-safe in-memory storage for runs and events
- `models.py` - Pydantic models for data structures
- `config.py` - Configuration loading from YAML and environment
- `config.yaml` - Labels, weights, timeouts, demo examples

**Frontend (`frontend/src/`):**
- `App.tsx` - Entry point, renders ModernApp
- `components/ModernApp.tsx` - Main orchestrator component
- `components/ModernInputSection.tsx` - Text input with examples
- `components/OptimizationVisualization.tsx` - Real-time variant execution display
- `components/ModernResultsSection.tsx` - Final results and winner display
- `components/VariantCard.tsx` - Individual variant output display
- `components/Scoreboard.tsx` - Live leaderboard

### DSPy Integration

The optimizer creates 3 variants with different prompt strategies:
1. **Variant 1**: Direct, formal approach (temp 0.2)
2. **Variant 2**: Conversational, helpful approach (temp 0.3)
3. **Variant 3**: Analytical, detailed approach (temp 0.4)

Each variant uses `dspy.Predict(ClassifyAndSummarize)` signature which expects:
- **Input**: `text` (the classification input)
- **Output**: `category` (classification label) + `summary` (one-sentence summary)

### Scoring System

Located in `backend/scoring.py`. Scoring is **deterministic** (no LLM calls):

**Components (each 0-1):**
- `label_valid`: Category is in allowed labels list
- `label_match`: Category matches detected intent (regex-based pattern matching)
- `summary_len_ok`: Summary ≤20 words
- `no_hedging`: No uncertain language ("I think", "maybe", etc.)
- `format_ok`: Proper JSON structure with required fields

**Total score** = sum of weighted components (default weights all 1.0)

Intent detection uses regex patterns in `scoring.py:intent_patterns` to match input text to categories like "billing", "technical", "cancellation", "urgent".

### Event System

Events stream via SSE from backend to frontend:
- `VariantStart` - Variant begins execution
- `VariantOutput` - Variant produces result
- `VariantScored` - Variant receives score
- `LeaderChange` - New variant takes the lead
- `RunComplete` - All variants finished, winner declared
- `Error` - Something went wrong

Events are stored in `RunStore` and can be replayed on the frontend without re-running the optimization.

### State Management

**Backend:** `RunStore` (in-memory, thread-safe)
- Stores last 100 runs
- Maintains variants, scores, events, winner for each run
- Thread-safe with RLock

**Frontend:** React state in `ModernApp.tsx`
- Manages run lifecycle (idle → running → complete)
- SSE connection for real-time updates
- Replay mode for demo purposes

## Configuration

### Adding Classification Categories

1. Edit `backend/config.yaml` → add label to `labels` array
2. Edit `backend/scoring.py` → add intent patterns to `intent_patterns` dict
3. Add example inputs to `config.yaml:demo_examples`

Example:
```yaml
# config.yaml
labels:
  - billing
  - technical
  - cancellation
  - urgent
  - feedback  # NEW
  - other
```

```python
# scoring.py
self.intent_patterns = {
    # ... existing patterns ...
    "feedback": [
        r"\b(feedback|suggest|improve|feature|idea)\b",
        r"\b(enhancement|recommendation)\b"
    ],
}
```

### Modifying Scoring Weights

Edit `backend/config.yaml`:
```yaml
weights:
  label_valid: 1.0
  label_match: 2.0      # Increase importance
  summary_len_ok: 0.5   # Decrease importance
  no_hedging: 1.0
  format_ok: 1.0
```

### Changing LLM Provider

Edit `backend/.env`:
```bash
# For OpenAI
PROVIDER=openai
OPENAI_API_KEY=sk-...

# For Anthropic
PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

Edit `backend/config.yaml` for model/temperature:
```yaml
provider:
  name: "openai"
  model: "gpt-4o-mini"  # or "gpt-4", "claude-3-haiku-20240307", etc.
  temperature: [0.2, 0.3, 0.4]  # One per variant
```

### Adjusting Timeouts

Edit `backend/config.yaml`:
```yaml
timeouts_ms:
  per_variant: 2500  # Max time per variant execution
  run_total: 8000    # Max time for entire run
```

## Common Patterns

### Adding a New Prompt Variant

Edit `backend/optimizer.py:_create_variants()`:
```python
# Add variant4_spec after variant3_spec
variant4_spec = {
    "instruction": "Your new instruction here",
    "style": "your_style",
    "temperature": temperatures[3] if len(temperatures) > 3 else 0.5,
    "examples": [
        ("example input", "category", "example summary")
    ]
}
```

Update `config.yaml` to support 4 variants:
```yaml
variant_count: 4  # was 3
```

### Adding New Scoring Components

1. Add component to `models.py:ScoreComponents`:
```python
class ScoreComponents(BaseModel):
    # ... existing ...
    custom_metric: float = Field(..., description="Your metric description")
```

2. Add weight to `config.yaml`:
```yaml
weights:
  # ... existing ...
  custom_metric: 1.0
```

3. Implement in `scoring.py:score_variant()`:
```python
custom_metric = self._score_custom_metric(output)

total = (
    # ... existing ...
    custom_metric * self.weights["custom_metric"]
)

components = ScoreComponents(
    # ... existing ...
    custom_metric=custom_metric
)
```

4. Add scoring method:
```python
def _score_custom_metric(self, output: Any) -> float:
    # Your scoring logic
    return 1.0 if condition else 0.0
```

### SSE Connection Handling

The backend streams events via `/api/run/{run_id}/stream`. Frontend connects in `ModernApp.tsx`:
- EventSource creates SSE connection
- Backend polls RunStore every 100ms for new events
- Connection closes when run status becomes COMPLETE
- Events are JSON-encoded in `data:` field

## Important Notes

- **No LLM calls for scoring**: All scoring is deterministic rule-based evaluation. This keeps the demo fast and cost-effective.
- **Sequential variant execution**: Variants run one at a time (not parallel) to control costs and simplify visualization.
- **In-memory storage**: RunStore keeps data in memory only. Restart clears all runs.
- **CORS configuration**: Default allows `localhost:3000-3003`. Update `CORS_ORIGINS` env var for production.
- **Replay functionality**: Frontend can replay event streams without re-running optimization, useful for demos.
- **API keys required**: Must configure either OPENAI_API_KEY or ANTHROPIC_API_KEY in `backend/.env`.

## Testing Strategy

**Backend tests** (`backend/test_main.py`):
- Mock LLM responses to avoid API calls
- Test API endpoints, scoring logic, run lifecycle
- Use pytest-asyncio for async tests

**Frontend tests**:
- Jest + React Testing Library
- Component rendering, user interactions
- Mock API responses for integration tests

## Performance Targets

Per the README:
- **P50 run time**: ≤5s for 3 variants
- **P95 run time**: ≤8s for 3 variants
- **Cold start**: ≤10s from first request
- **Replay speed**: 1.25× original animation speed

If runs are slow, check:
1. LLM model speed (consider using faster models like `gpt-4o-mini`)
2. Network latency to LLM provider
3. Timeout configuration in `config.yaml`
