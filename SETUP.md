# Live Optimizing Classifier - Setup Guide

This guide will help you set up and run the Live Optimizing Classifier demo application.

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn
- An LLM API key (OpenAI, Anthropic, or Azure)

## Quick Start with Docker

The fastest way to get started is using Docker Compose:

```bash
# 1. Clone and navigate to the project
git clone <repository-url>
cd live-optimizing-classifier

# 2. Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# 3. Run with Docker Compose
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Manual Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   PROVIDER=openai
   OPENAI_API_KEY=your_openai_api_key_here
   # OR
   PROVIDER=anthropic
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

5. **Run the backend:**
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   The default configuration should work for local development.

4. **Run the frontend:**
   ```bash
   npm start
   ```

## Configuration

### Backend Configuration

Edit `backend/config.yaml` to customize:

- **Classification labels:** Add/remove categories
- **Scoring weights:** Adjust importance of different criteria
- **Timeouts:** Modify per-variant and total timeouts
- **Variant count:** Change number of prompt variants to test

### Frontend Configuration

Environment variables in `frontend/.env`:

- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:8000)

## Testing

### Backend Tests

```bash
cd backend
pytest test_main.py -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Demo Usage

1. **Open the application** at http://localhost:3000

2. **Enter text to classify** or use one of the provided examples:
   - "I was double-charged after upgrading my plan"
   - "My internet connection keeps dropping"
   - "I want to cancel my subscription"

3. **Watch the optimization process:**
   - Multiple prompt variants are tested simultaneously
   - Each variant shows its output and score
   - The leaderboard updates in real-time
   - Progress meter shows completion status

4. **View results:**
   - Final panel shows the winning variant
   - Score breakdown explains why it won
   - Copy result JSON for analysis

5. **Use additional features:**
   - **Replay:** Re-animate the optimization without re-running
   - **Show Internals:** View prompt strategies for each variant
   - **Keyboard shortcuts:** Enter to run, Ctrl+R to replay

## Troubleshooting

### Common Issues

1. **API Key Errors:**
   - Ensure your API key is correctly set in `backend/.env`
   - Check that you have sufficient credits/quota
   - Verify the provider name matches your key type

2. **Connection Errors:**
   - Ensure backend is running on port 8000
   - Check CORS settings if accessing from different domain
   - Verify firewall settings allow the connections

3. **Slow Performance:**
   - Check your internet connection
   - Consider using a faster model (e.g., gpt-3.5-turbo vs gpt-4)
   - Adjust timeout values in config.yaml

4. **Build Errors:**
   - Ensure Node.js version is 18+
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Performance Optimization

- **For demos:** Use faster models like `gpt-3.5-turbo` or `claude-3-haiku`
- **For accuracy:** Use more capable models like `gpt-4` or `claude-3-sonnet`
- **Adjust timeouts** in config.yaml based on your model choice

## Development

### Adding New Classification Categories

1. Edit `backend/config.yaml` and add to the `labels` array
2. Update intent patterns in `backend/scoring.py`
3. Add example inputs to `demo_examples` in config

### Customizing Scoring

Edit the scoring logic in `backend/scoring.py`:
- Modify `intent_patterns` for better intent detection
- Adjust scoring weights in config.yaml
- Add new scoring components as needed

### Extending Prompt Variants

Modify `backend/optimizer.py` to add new prompt strategies:
- Add new variant specifications in `_create_variants()`
- Experiment with different instruction styles
- Adjust temperature and other model parameters

## Deployment

### Production Deployment

1. **Build for production:**
   ```bash
   # Frontend
   cd frontend && npm run build
   
   # Backend - no build needed, but ensure production settings
   ```

2. **Use production environment variables:**
   - Set `NODE_ENV=production`
   - Configure proper CORS origins
   - Use production API keys
   - Set appropriate log levels

3. **Deploy with Docker:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Security Considerations

- Never expose API keys in frontend code
- Use HTTPS in production
- Configure proper CORS origins
- Implement rate limiting for production use
- Consider authentication for sensitive deployments

## Support

For issues and questions:
1. Check this setup guide
2. Review the troubleshooting section
3. Check the application logs for error details
4. Ensure all prerequisites are met