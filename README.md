# DSPy Interactive Tutor

A conference-demo-ready tool that showcases DSPy's prompt and program optimization across multiple tasks with live visualization.

## 🎯 Overview

This application demonstrates DSPy pipelines by:
- Animating multiple prompt/program variants sequentially
- Scoring each variant with deterministic rules and heuristics
- Highlighting the best-performing output with “why it won” chips
- Supporting additional mini-tasks (math verification, field extraction, sentiment)

**Perfect for:** conferences, workshops, and hands-on introductions to DSPy.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Framer Motion for animations and light/dark theming
- **Backend**: FastAPI + DSPy with in-memory run store
- **LLM Provider**: Configurable (OpenAI primary, interchangeable)
- **Tasks**: Classification + summary, tiny math, field extraction, sentiment analysis
- **Scoring**: Rule-based correctness checks + heuristics

```
[Browser] ⇄ [FastAPI + DSPy] ⇄ [LLM API]
              │
         [Run Store]
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone <repository-url>
cd live-optimizing-classifier

# 2. Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API key

# 3. Run with Docker
docker-compose up --build
```

### Option 2: Manual Setup

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add your API key
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm start
```

**Access the app:** http://localhost:3000

## 🎮 Demo Flow

1. **Enter text** to classify (or use provided examples)
2. **Watch optimization** as 3 prompt variants compete in real-time
3. **See live scoring** with explanations for each variant
4. **View final results** with winning variant and score breakdown
5. **Replay animation** to show the process again instantly

### Sample Inputs

- "I was double-charged after upgrading my plan" → Classification demo
- "Add 3 and 5" → Math verification
- "Contact Jane at jane@example.com on 2025-01-01" → Field extraction
- "This product is amazing!" → Sentiment

## ✨ Key Features

### Real-Time Visualization
- **Animated variant cards** shown sequentially
- **Dynamic leaderboard** with live scoring
- **Optimization meter** and winner banner

### Intelligent Scoring
- **Rule-based evaluation** for all tasks
- **Visible sub-scores** and “why it won” chips

### Developer-Friendly
- **Show internals** toggle for prompt specs
- **Replay** from cached events
- **JSON export** for outputs and metadata
- **Keyboard shortcuts** (Enter, R, I)

### Production-Ready
- **Light and dark themes**
- **Docker deployment** with health checks
- **Configurable via YAML/env variables**
- **Error handling** and graceful degradation

## 📊 Performance Targets

- **P50 run time**: ≤5s for 3 variants
- **P95 run time**: ≤8s for 3 variants  
- **Cold start**: ≤10s from first request
- **Replay speed**: 1.25× original with smooth animations

## 🔧 Configuration

### Classification Labels
Edit `backend/config.yaml`:
```yaml
labels:
  - billing
  - technical
  - cancellation
  - urgent
  - other
```

### Scoring Weights
```yaml
weights:
  label_valid: 1.0      # Category in allowed list
  label_match: 1.0      # Matches detected intent
  summary_len_ok: 1.0   # ≤20 words
  no_hedging: 1.0       # No uncertain language
  format_ok: 1.0        # Proper JSON structure
```

### LLM Provider
```yaml
provider:
  name: "openai"
  model: "gpt-4o-mini"
  temperature: [0.2, 0.3, 0.4]  # Per variant
```

## 🧪 Testing

```bash
# Backend tests
cd backend && pytest test_main.py -v

# Frontend tests  
cd frontend && npm test

# Integration test
curl http://localhost:8000/api/config
```

## 📚 Documentation

- **[Setup Guide](SETUP.md)**: Detailed installation and configuration
- **[API Documentation](http://localhost:8000/docs)**: Interactive API docs (when running)
- **[Requirements](REQS.md)**: Original detailed requirements specification

## 🎯 Use Cases

- **Live demos** of prompt optimization concepts
- **Educational workshops** on DSPy and prompt engineering
- **Proof of concept** for real-time optimization systems
- **Benchmarking** different prompt strategies
- **Customer support** classification system prototype

## 🛠️ Development

### Adding New Categories
1. Update `labels` in `backend/config.yaml`
2. Add intent patterns in `backend/scoring.py`
3. Include example inputs in `demo_examples`

### Custom Scoring
Modify `backend/scoring.py` to add new evaluation criteria or adjust existing logic.

### New Prompt Variants
Edit `backend/optimizer.py` to experiment with different prompt strategies and parameters.

## 🚀 Deployment

### Production Checklist
- [ ] Set production API keys
- [ ] Configure CORS for your domain
- [ ] Set up HTTPS
- [ ] Enable rate limiting
- [ ] Configure monitoring/logging
- [ ] Test with production data

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Monitoring

The application includes:
- **Health checks** for both frontend and backend
- **Structured logging** with request tracing
- **Performance metrics** for optimization runs
- **Error tracking** with detailed context

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready to see prompt optimization in action?** 🚀

Start with the Quick Start guide above, or dive into the [detailed setup instructions](SETUP.md).