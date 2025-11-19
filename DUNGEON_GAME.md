# 🎮 DSPy Dungeon - A Pokemon-Style Prompt Optimization Adventure

![16-bit Adventure](https://img.shields.io/badge/Style-16bit_Pokemon_Blue-9bbc0f?style=for-the-badge)
![DSPy](https://img.shields.io/badge/Powered_by-DSPy-0f380f?style=for-the-badge)

## 🌟 Overview

**DSPy Dungeon** is a retro Pokemon Blue-style adventure game that teaches prompt engineering through interactive gameplay. Walk through a dungeon, consult three wise elders to learn the secrets of effective prompting, and then optimize your prompts using DSPy!

### 🎯 Game Concept

You are an adventurer seeking to master the art of prompt engineering. Deep within the dungeon dwell three wise elders, each holding a key principle:

- **Elder of Clarity** 🧙 - Teaches you to be specific and clear
- **Elder of Context** 🧙 - Shows you the power of examples and background
- **Elder of Structure** 🧙 - Reveals the importance of step-by-step thinking

After consulting all three elders, you can access the **DSPy Optimization Terminal** 💻 where their combined wisdom is optimized using real DSPy algorithms!

## 🎮 How to Play

### Controls
- **Arrow Keys** or **WASD** - Move your character
- **SPACE** or **ENTER** - Interact with NPCs and advance dialogue

### Objective
1. Walk around the dungeon using arrow keys or WASD
2. Approach each of the three elders (they're against the walls)
3. Press SPACE when facing an elder to receive their wisdom
4. Once all three elders are consulted (3/3 wisdom collected)
5. Go to the computer terminal on the opposite side
6. Press SPACE to run DSPy optimization!

## 🎨 Features

### 16-Bit Pokemon Blue Aesthetic
- **Classic GameBoy colors** - Authentic green tones (#9bbc0f, #0f380f)
- **Pixel-perfect rendering** - Crisp pixel art with proper image rendering
- **Press Start 2P font** - Retro gaming typography
- **CRT scanline effect** - Nostalgic screen effect
- **Animated sprites** - Idle animations for NPCs
- **Dialogue boxes** - Classic Pokemon-style text boxes

### Game Mechanics
- **Grid-based movement** - Smooth tile-by-tile navigation
- **Collision detection** - Can't walk through walls or NPCs
- **Progressive unlocking** - Computer only accessible after consulting all elders
- **Status tracking** - Visual indicators for wisdom collected
- **State management** - Tracks which elders you've consulted

### DSPy Integration
- **Real optimization** - Connects to backend DSPy instance
- **Three-prompt synthesis** - Combines principles from all three elders
- **Performance scoring** - Shows optimization metrics
- **Fallback demo** - Works even without backend running

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (for frontend)
- Python 3.9+ (for backend DSPy optimization)

### Installation

1. **Clone and navigate to project**
   ```bash
   cd /Users/mohammadkhalaf/Projects/disper
   ```

2. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend runs on `http://localhost:3100`

3. **Start the backend (optional, for real DSPy optimization)**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```
   Backend runs on `http://localhost:8000`

4. **Open your browser**
   Navigate to `http://localhost:3100` and click **START GAME**!

## 🏗️ Technical Architecture

### Frontend Stack
- **React** - UI framework
- **TypeScript** - Type safety
- **Framer Motion** - Smooth animations
- **CSS** - Custom GameBoy-style styling

### Game Engine Features
- Grid-based tilemap system (15x11 tiles)
- Directional movement with 4-way facing
- NPC interaction system
- Dialogue state machine
- Keyboard input handling
- Collision detection

### Backend Stack
- **FastAPI** - Python web framework
- **DSPy** - Prompt optimization framework
- **Async processing** - Non-blocking optimization

### API Endpoint
```
POST /api/optimize
{
  "prompts": [
    "Be specific and clear...",
    "Provide context and examples...",
    "Use structured thinking..."
  ],
  "task": "general_qa"
}

Response:
{
  "best_prompt": "Master Prompt Strategy: ...",
  "score": 96.5,
  "individual_scores": [78.2, 82.1, 80.5],
  "improvement": 14.4,
  "optimization_steps": [...]
}
```

## 🎓 The Three Principles of Prompting

### 1. Clarity (Elder 1)
**Teaching**: Be specific and clear in your instructions.

**Example**:
- ❌ "Tell me about this"
- ✅ "Summarize this article in 3 bullet points focusing on key findings"

### 2. Context (Elder 2)
**Teaching**: Provide context and examples.

**Example**:
- ❌ "What deductions apply?"
- ✅ "You are a tax expert. Given this tax scenario: [details], what deductions apply? Here's a similar case: [example]"

### 3. Structure (Elder 3)
**Teaching**: Use structured, step-by-step thinking.

**Example**:
- ❌ "Solve this problem"
- ✅ "Let's solve this step-by-step: 1) Identify key factors 2) Analyze each factor 3) Draw conclusion"

## 🎯 Game Flow

```
┌─────────────────────────────────────────┐
│          START SCREEN                   │
│      ▶ START GAME button                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         DUNGEON EXPLORATION             │
│   🧙  🧙  🧙  (Three Elders)            │
│                                         │
│         🧑 (Player)                      │
│                                         │
│         💻 (Computer)                    │
└─────────────────────────────────────────┘
                  ↓
        Consult Each Elder
        (SPACE to interact)
                  ↓
┌─────────────────────────────────────────┐
│    WISDOM COLLECTED: 3/3 ✓              │
│    Computer Access: READY ✓             │
└─────────────────────────────────────────┘
                  ↓
      Interact with Computer
                  ↓
┌─────────────────────────────────────────┐
│      DSPy OPTIMIZATION RUNNING          │
│           [Progress Bar]                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      OPTIMIZATION COMPLETE!             │
│   Best Prompt: [Combined Wisdom]        │
│   Score: 96.5%                          │
│   Improvement: +14.4%                   │
└─────────────────────────────────────────┘
```

## 📁 Project Structure

```
disper/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main app entry
│   │   ├── game/
│   │   │   ├── DungeonGame.tsx  # Core game component
│   │   │   └── DungeonGame.css  # Pokemon Blue styling
│   │   └── ...
│   └── package.json
│
└── backend/
    ├── main.py                   # FastAPI endpoints
    ├── dungeon_optimizer.py      # Game optimization logic
    ├── optimizer.py              # DSPy optimizer
    └── requirements.txt
```

## 🎨 Customization

### Adding More Elders
Edit `DungeonGame.tsx` and add to the `npcs` array:
```typescript
{
  id: 'elder4',
  x: 10,
  y: 5,
  name: 'Elder of Examples',
  type: 'elder',
  consulted: false,
  dialogue: [
    'Your dialogue here...',
    'More dialogue...',
  ],
  wisdom: 'Your wisdom principle here'
}
```

### Changing Dungeon Size
Modify constants in `DungeonGame.tsx`:
```typescript
const GRID_WIDTH = 20;  // Change width
const GRID_HEIGHT = 15; // Change height
```

### Custom Styling
Edit `DungeonGame.css` to change colors, fonts, or effects:
```css
.tile.floor {
  background: #9bbc0f;  /* Change floor color */
}
```

## 🐛 Troubleshooting

### Game Not Loading
- Check browser console for errors (F12)
- Ensure React dev server is running on port 3100
- Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Optimization Not Working
- Check if backend is running on port 8000
- Verify CORS settings include localhost:3100
- Game will fallback to demo results if backend unavailable

### Movement Not Responsive
- Click on the game area to ensure keyboard focus
- Try using WASD instead of arrow keys (or vice versa)

## 🎮 Speedrun Tips
1. Move directly up to center elder first
2. Move left to Elder 1, then right to Elder 3
3. Move down to computer terminal
4. Optimal time: ~45 seconds! ⚡

## 📝 Future Enhancements
- [ ] Add sound effects (Pokemon-style beeps)
- [ ] Music (8-bit chiptune)
- [ ] More dungeon levels
- [ ] Different NPC types (trainers, shopkeepers)
- [ ] Save game state
- [ ] Multiplayer mode
- [ ] Mobile touch controls
- [ ] Achievements system

## 🙏 Credits
- **Game Style**: Inspired by Pokemon Blue (1998)
- **Framework**: React + TypeScript
- **Optimization**: DSPy by Stanford NLP
- **Font**: Press Start 2P by CodeMan38

## 📜 License
GPL-3.0 (see LICENSE file)

---

**Enjoy your prompt optimization adventure!** 🎮✨

*Remember: The wisdom of the elders + the power of DSPy = Prompt mastery!*
