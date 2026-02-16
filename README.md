# DSPyville

A Pokemon Diamond/Pearl inspired 3D town that teaches DSPy concepts through exploration and NPC dialogue.

Walk around a charming isometric world, talk to townsfolk, and learn the five pillars of DSPy -- all from your browser.

![DSPyville Screenshot](screenshot.png)

## Quick Start

```bash
cd frontend
npm install
npm start
```

Open [http://localhost:3100](http://localhost:3100) and press SPACE to begin.

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow keys | Move |
| SPACE | Start game / Talk to NPCs / Advance dialogue |

## What You'll Learn

Explore the town and chat with five NPCs, each teaching a core DSPy concept:

1. **DSPy Overview** -- Program language models, don't prompt them
2. **Signatures** -- Declare inputs and outputs declaratively
3. **Modules** -- Predict, ChainOfThought, ReAct and more
4. **Optimizers** -- BootstrapFewShot, MIPROv2 for automatic prompt tuning
5. **Metrics** -- Score outputs to guide the optimization loop

Your progress is tracked in the HUD. Learn all five to complete the game.

## Tech Stack

- React 19 + TypeScript
- React Three Fiber / Three.js
- Zustand for state management
- All 3D graphics are procedural (no external models)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See `CLAUDE.md` for architecture details, file structure, and common modification patterns.

## License

MIT
