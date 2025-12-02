---
inclusion: always
---

# Project Structure

```
game-application/
├── app.py                    # Flask backend server
├── requirements.txt          # Python dependencies
├── scores.json              # Score persistence (auto-generated)
├── README.md                # Project documentation
├── static/                  # Static assets
│   ├── game.js             # Main game logic and rendering
│   └── kiro-logo.png       # Character sprite
└── templates/              # HTML templates
    └── index.html          # Game canvas and UI shell
```

## File Responsibilities

### app.py
- Flask application setup and routing
- Score management (load/save to JSON)
- API endpoints for scores and statistics
- CORS configuration for development

### static/game.js
- Game state management
- Player class with physics and Time Warp mechanic
- Platform, Collectible, and DeployGate classes
- Particle system for visual effects
- Camera system with smooth following
- Collision detection
- Rendering pipeline (background, entities, HUD)
- Keyboard input handling
- Game loop (60 FPS target)

### templates/index.html
- Canvas element setup (800x600)
- Minimal styling (dark theme, Kiro purple accents)
- Game instructions display
- Script loading

### scores.json
- Auto-generated on first score submission
- Stores array of score entries with:
  - player name
  - score (collectibles)
  - time (seconds)
  - lives remaining
  - timestamp (ISO format)

## Code Organization Patterns

### Game Classes
- Each entity type has its own class (Player, Platform, Collectible, DeployGate, Particle, Camera)
- Classes have `update()` and `render(ctx, camera)` methods
- Collision detection uses AABB (Axis-Aligned Bounding Box)

### Game States
- `'playing'` - Active gameplay
- `'gameOver'` - Player lost all lives
- `'levelComplete'` - Player reached Deploy Gate

### Rendering Pipeline
1. Background (parallax layers)
2. Platforms
3. Collectibles
4. Deploy Gate
5. Particles
6. Player
7. HUD overlay
8. Game state screens (game over / level complete)

## Conventions

- Use ES6+ JavaScript features (classes, arrow functions, const/let)
- Canvas coordinates are world-space; subtract camera.x for screen-space rendering
- All colors use Kiro brand palette (purple #790ECB, dark backgrounds)
- Physics updates happen before rendering in game loop
- Screen shake and particles provide satisfying feedback for events
