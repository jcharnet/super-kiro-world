# Super Kiro World - Codebase Guide

## File Structure

```
static/
├── game.js (2700 lines) - Main game engine
├── audio.js - Audio system
├── splash.js - Splash screen
├── kiro-logo.png - Game assets
└── js/ - Future modular structure
    ├── constants.js
    ├── entities/
    ├── systems/
    ├── levels/
    └── rendering/
```

## game.js Architecture

The main game file is organized into 7 clear sections:

### Section 1: Constants & Setup (Lines 1-85)
- Game constants (canvas size, physics, etc.)
- Canvas initialization
- Global game state variables
- Keyboard input handlers

### Section 2: Core Systems (Lines 85-830)
- **ScoreManager** - Handles score tracking and localStorage
- **ParticlePool** - Object pooling for particles
- **ScreenShake** - Camera shake effects
- **ParticleSystem** - Particle rendering and physics
- **ParticleFactory** - Creates different particle types
- **PowerUpManager** - Manages active power-ups

### Section 3: Entities (Lines 830-2070)
- **Obstacle** - Base class for hazards
  - **MovingPlatform** - Platforms that follow paths
  - **LaserHazard** - Timed laser obstacles
  - **SpikeTrap** - Static spike hazards
  - **FallingPlatform** - Platforms that fall when stepped on
- **ObstacleManager** - Manages all obstacles
- **LevelManager** - Handles level transitions
- **Checkpoint** - Save points for respawning
- **Player** - Main player character with physics
- **Platform** - Static platforms
- **Collectible** - Items to collect
- **PowerUp** - Power-up pickups
- **DeployGate** - Level end goal

### Section 4: Game Managers (Lines 2070-2090)
- **Camera** - Smooth camera following

### Section 5: Level Setup (Lines 2090-2310)
- Level 1 configuration
- Level 2 configuration (loadLevel2 function)
- Platform, collectible, and obstacle placement

### Section 6: Rendering (Lines 2310-2460)
- **renderBackground()** - Parallax background
- **renderHUD()** - Score, lives, time warps display
- **renderGameOver()** - Game over screen
- **renderLevelComplete()** - Victory screen
- **renderLevelTransition()** - Level transition screen

### Section 7: Game Loop (Lines 2460-2700)
- **gameLoop()** - Main game loop (60 FPS)
- **restartGame()** - Reset game state
- **submitScore()** - Backend score submission
- **startMainGame()** - Game initialization

## Key Classes

### Player
- Physics-based movement with acceleration
- Coyote time and jump buffering
- Time warp mechanic
- Power-up effects
- Checkpoint respawning

### MovingPlatform
- Path-following with waypoints
- Carries player with momentum transfer
- Smooth interpolation

### LaserHazard
- Three phases: inactive, warning, active
- Timed cycles
- Visual and audio feedback

### PowerUpManager
- Tracks active power-ups
- Handles duration and effects
- Game speed modification

## Game Flow

1. **Initialization** - Load splash screen, setup canvas
2. **Level 1** - Player starts, collects items, avoids obstacles
3. **Level Transition** - Reach deploy gate, 2-second transition
4. **Level 2** - More challenging layout, checkpoints, moving platforms
5. **Victory** - Complete Level 2, show stats, save score

## Testing

- 59 property-based tests using fast-check
- Tests cover all game mechanics
- Run with: `npm test`

## Future Refactoring

The codebase is ready for modularization:
- Extract classes to `js/entities/`
- Extract systems to `js/systems/`
- Extract levels to `js/levels/`
- Extract rendering to `js/rendering/`
- Convert to ES6 modules

See `.kiro/specs/refactor-game-js/` for detailed refactoring plan.
