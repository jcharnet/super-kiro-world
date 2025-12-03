# Design Document: Game.js Refactoring

## Overview

This design outlines the refactoring of a monolithic 2500+ line game.js file into a modular, maintainable architecture using ES6 modules. The refactoring will preserve all existing functionality while improving code organization, maintainability, and testability.

## Architecture

### Module Organization

The refactored codebase will follow a clear directory structure:

```
static/js/
├── constants.js          # Game constants and configuration
├── Game.js              # Main game orchestrator
├── entities/            # Game objects
│   ├── Player.js
│   ├── Platform.js
│   ├── Collectible.js
│   ├── PowerUp.js
│   ├── Obstacle.js
│   ├── Checkpoint.js
│   ├── DeployGate.js
│   └── Particle.js
├── systems/             # Game logic managers
│   ├── InputManager.js
│   ├── Camera.js
│   ├── ScreenShake.js
│   ├── ScoreManager.js
│   ├── PowerUpManager.js
│   ├── ObstacleManager.js
│   └── LevelManager.js
├── levels/              # Level configurations
│   ├── Level1.js
│   └── Level2.js
└── rendering/           # Rendering logic
    ├── Renderer.js
    ├── HUD.js
    └── Background.js
```

### Design Principles

1. **Single Responsibility**: Each module has one clear purpose
2. **Dependency Injection**: Systems receive dependencies rather than creating them
3. **ES6 Modules**: Use import/export for clean module boundaries
4. **Backward Compatibility**: Maintain all existing functionality and test compatibility

## Components and Interfaces

### Core Systems

#### InputManager
Manages keyboard input state and provides query methods.

```javascript
class InputManager {
  constructor()
  isKeyPressed(key)
  isKeyDown(key)
  update()
}
```

#### Camera
Handles viewport positioning and smooth following.

```javascript
class Camera {
  constructor(x, y, levelWidth, canvasWidth)
  follow(target, lerp)
  getX()
  getY()
}
```

#### ScreenShake
Manages screen shake effects for game feel.

```javascript
class ScreenShake {
  constructor()
  shake(intensity)
  update()
  getOffset()
}
```

#### ScoreManager
Handles scoring, high scores, and persistence.

```javascript
class ScoreManager {
  constructor()
  addScore(points)
  getScore()
  getHighScore()
  saveGame(data)
  loadFromStorage()
}
```

#### PowerUpManager
Manages active power-ups and their effects.

```javascript
class PowerUpManager {
  constructor()
  activatePowerUp(type, duration)
  update(deltaTime)
  isActive(type)
  getRemainingTime(type)
}
```

#### ObstacleManager
Manages obstacle spawning and lifecycle.

```javascript
class ObstacleManager {
  constructor()
  spawnObstacle(type, x, y, config)
  update(deltaTime)
  checkCollisions(player)
  getObstacles()
}
```

#### LevelManager
Handles level loading and transitions.

```javascript
class LevelManager {
  constructor()
  loadLevel(levelNumber)
  getCurrentLevel()
  transitionToNextLevel()
}
```

### Entities

#### Player
The player character with movement, jumping, and collision.

```javascript
class Player {
  constructor(x, y)
  update(inputManager, platforms, deltaTime)
  jump()
  takeDamage()
  render(ctx, camera)
}
```

#### Platform
Static and moving platforms.

```javascript
class Platform {
  constructor(x, y, width, height)
  update(deltaTime)
  render(ctx, camera)
}

class MovingPlatform extends Platform {
  constructor(x, y, width, height, moveX, moveY, speed)
}
```

#### Collectible
Items that can be collected for points.

```javascript
class Collectible {
  constructor(x, y, type)
  checkCollision(player)
  render(ctx, camera)
}
```

#### PowerUp
Special items that grant temporary abilities.

```javascript
class PowerUp {
  constructor(x, y, type)
  checkCollision(player)
  render(ctx, camera)
}
```

#### Obstacle
Hazards that damage the player.

```javascript
class Obstacle {
  constructor(x, y, type, config)
  update(deltaTime)
  checkCollision(player)
  render(ctx, camera)
}
```

#### Particle
Visual effects particles.

```javascript
class Particle {
  constructor(x, y, vx, vy, color, size, lifetime)
  update(deltaTime)
  render(ctx, camera)
  isDead()
}
```

### Rendering

#### Renderer
Main rendering coordinator.

```javascript
class Renderer {
  constructor(ctx, canvas)
  renderBackground(camera, level)
  renderEntities(entities, camera)
  renderEffects(particles, camera)
}
```

#### HUD
Heads-up display rendering.

```javascript
class HUD {
  constructor(ctx, canvas)
  render(score, lives, powerUps, timeWarps)
}
```

### Levels

Level configurations export setup functions:

```javascript
export function setupLevel1() {
  return {
    platforms: [...],
    collectibles: [...],
    powerUps: [...],
    obstacles: [...],
    checkpoints: [...],
    deployGate: {...}
  };
}
```

## Data Models

### Game State
```javascript
{
  state: 'playing' | 'gameOver' | 'levelComplete',
  score: number,
  lives: number,
  timeWarpsRemaining: number,
  currentLevel: number,
  levelStartTime: number
}
```

### Entity Base Properties
```javascript
{
  x: number,
  y: number,
  width: number,
  height: number,
  vx: number,  // velocity x
  vy: number   // velocity y
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Module Isolation
*For any* refactored module, importing and instantiating it should not cause side effects or errors in isolation.
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Functionality Preservation
*For any* game action sequence, the refactored code should produce the same game state as the original monolithic code.
**Validates: Requirements 1.5, 3.2**

### Property 3: Test Compatibility
*For any* existing test, the refactored code should pass all tests that passed before refactoring.
**Validates: Requirements 3.1**

### Property 4: Import/Export Consistency
*For any* module that exports a class or function, importing and using it should work without undefined references.
**Validates: Requirements 1.4**

### Property 5: Performance Preservation
*For any* game loop iteration, the refactored code should execute within the same time bounds as the original code.
**Validates: Requirements 3.4**

## Error Handling

### Module Loading Errors
- If a module fails to load, log a clear error message indicating which module and why
- Provide fallback behavior where possible
- Fail fast if critical modules cannot be loaded

### Circular Dependencies
- Design module dependencies as a directed acyclic graph (DAG)
- Use dependency injection to break circular dependencies
- Document dependency relationships clearly

### Runtime Errors
- Preserve all existing error handling from the monolithic code
- Add try-catch blocks around module initialization
- Ensure errors in one module don't crash the entire game

## Testing Strategy

### Unit Tests
- Test each extracted module in isolation
- Verify that existing tests continue to pass
- Focus on testing public interfaces of each module

### Integration Tests
- Test that modules work together correctly
- Verify game state transitions work as before
- Test level loading and transitions

### Manual Testing
- Play through both levels completely
- Verify all game mechanics work (jumping, collecting, power-ups, obstacles)
- Check that visual effects render correctly
- Confirm score persistence works

### Regression Testing
- Run all 59 existing tests after each extraction phase
- Compare game behavior before and after refactoring
- Verify performance metrics remain consistent

## Implementation Strategy

### Phase-Based Approach

1. **Phase 1: Setup** - Create directory structure and constants
2. **Phase 2: Systems** - Extract system classes (already completed: InputManager, Camera, ScreenShake, ScoreManager)
3. **Phase 3: Entities** - Extract entity classes
4. **Phase 4: Rendering** - Extract rendering logic
5. **Phase 5: Levels** - Extract level configurations
6. **Phase 6: Integration** - Wire everything together in main Game.js
7. **Phase 7: Testing** - Comprehensive testing and validation

### Extraction Pattern

For each module extraction:
1. Identify the class/functions to extract
2. Identify dependencies
3. Create new module file with proper exports
4. Update game.js to import the module
5. Test that functionality still works
6. Run test suite

### Dependency Management

- Start with modules that have no dependencies (constants, utilities)
- Progress to modules with minimal dependencies (entities)
- Extract systems that depend on entities
- Finally extract the main game orchestrator

## Migration Path

### Current State
- Single 2500+ line game.js file
- Some systems already extracted (Camera, InputManager, ScoreManager, ScreenShake)
- All tests passing

### Target State
- Modular architecture with ~20 focused modules
- Clear separation of concerns
- All tests passing
- Identical game behavior

### Rollback Strategy
- Keep original game.js as game.js.bak
- Each phase can be rolled back independently
- Git commits after each successful phase

## Performance Considerations

- ES6 module loading is done once at startup, no runtime overhead
- Keep hot path code (game loop, rendering) optimized
- Avoid creating new objects in the game loop
- Maintain existing object pooling patterns (particles)

## Future Extensibility

The modular architecture enables:
- Easy addition of new entity types
- Simple level creation workflow
- Pluggable rendering backends
- Testable game logic
- Reusable components across projects
