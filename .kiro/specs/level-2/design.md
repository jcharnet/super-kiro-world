# Design Document

## Overview

This design adds a second level to Super Kiro World featuring moving platforms, timed laser hazards, checkpoints, and a unique visual theme. Level 2 provides increased difficulty with larger gaps, more precise timing requirements, and new mechanics while maintaining the core gameplay feel.

## Architecture

### Component Overview

1. **LevelManager**: Handles level transitions and state
2. **MovingPlatform**: Platform that travels along defined paths
3. **LaserHazard**: Timed obstacle with warning indicators
4. **Checkpoint**: Save point for respawning
5. **LevelTheme**: Visual styling configuration per level

### Data Flow

```
Level Complete → LevelManager → Transition Screen → Load Level 2
     ↓
Level 2 Init → Spawn Platforms/Hazards/Checkpoints
     ↓
Game Loop → Update Moving Platforms → Update Lasers → Check Collisions
     ↓
Player Death → Respawn at Checkpoint
```

## Components and Interfaces

### LevelManager

```javascript
class LevelManager {
    constructor()
    loadLevel(levelNumber): void
    completeLevel(): void
    showTransition(callback): void
    getCurrentLevel(): number
    resetLevel(): void
    
    // Properties
    currentLevel: number
    levelData: Map<number, LevelConfig>
}
```

### MovingPlatform

```javascript
class MovingPlatform extends Platform {
    constructor(x, y, width, height, path, speed)
    update(deltaTime): void
    render(ctx): void
    applyVelocityToPlayer(player): void
    
    // Properties
    path: Array<{x, y}>
    currentPathIndex: number
    speed: number
    direction: number
}
```

### LaserHazard

```javascript
class LaserHazard {
    constructor(x, y, direction, cycleTime)
    update(deltaTime): void
    render(ctx): void
    isActive(): boolean
    checkCollision(player): boolean
    
    // Properties
    x, y: number
    direction: 'horizontal' | 'vertical'
    cycleTime: number
    warningTime: number
    activeTime: number
    currentTime: number
}
```

### Checkpoint

```javascript
class Checkpoint {
    constructor(x, y)
    activate(): void
    render(ctx): void
    isActivated(): boolean
    
    // Properties
    x, y: number
    activated: boolean
}
```

## Data Models

### Level Configuration

```javascript
{
    levelNumber: number,
    theme: {
        backgroundColor: string,
        platformColor: string,
        accentColor: string,
        particleColor: string
    },
    platforms: Array<PlatformConfig>,
    movingPlatforms: Array<MovingPlatformConfig>,
    hazards: Array<HazardConfig>,
    checkpoints: Array<{x, y}>,
    collectibles: Array<{x, y}>,
    startPosition: {x, y},
    endPosition: {x, y},
    scoreMultiplier: number
}
```

### Moving Platform Path

```javascript
{
    points: Array<{x, y}>,
    speed: number,
    loopType: 'reverse' | 'circular'
}
```

### Laser Hazard Configuration

```javascript
{
    x: number,
    y: number,
    direction: 'horizontal' | 'vertical',
    length: number,
    cycleTime: number,
    warningTime: number,
    activeTime: number
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Level transition loads level 2
*For any* game state where level 1 is completed, completing the transition should result in level 2 being loaded
**Validates: Requirements 1.2**

Property 2: Level 2 resets player state
*For any* player state, when level 2 loads, the player position and lives should be reset to initial values
**Validates: Requirements 1.3**

Property 3: Level transition preserves scores
*For any* score and high score values, when transitioning from level 1 to level 2, these values should be maintained
**Validates: Requirements 1.4**

Property 4: Level 2 contains moving platforms
*For any* level 2 initialization, the level should contain at least one moving platform
**Validates: Requirements 2.1**

Property 5: Moving platforms carry player
*For any* player standing on a moving platform, the player's position should change with the platform's movement
**Validates: Requirements 2.2, 2.3**

Property 6: Platforms stay within path bounds
*For any* moving platform, when it reaches the end of its path, it should reverse direction or loop without exceeding path boundaries
**Validates: Requirements 2.4**

Property 7: Level 2 contains laser hazards
*For any* level 2 initialization, the level should contain at least one laser hazard with timer
**Validates: Requirements 3.1**

Property 8: Active lasers cause damage
*For any* player collision with an active laser, the player should take damage
**Validates: Requirements 3.3**

Property 9: Laser timing is consistent
*For any* laser hazard, the cycle time between activations should remain constant across multiple cycles
**Validates: Requirements 3.5**

Property 10: Checkpoint saves progress
*For any* checkpoint, when the player reaches it, the checkpoint should be marked as activated
**Validates: Requirements 4.1**

Property 11: Death respawns at checkpoint
*For any* activated checkpoint, when the player dies, the player should respawn at the checkpoint position
**Validates: Requirements 4.2**

Property 12: Level restart resets checkpoints
*For any* set of activated checkpoints, when the level restarts, all checkpoints should return to inactive state
**Validates: Requirements 4.4**

Property 13: Most recent checkpoint is used
*For any* sequence of checkpoint activations, when the player dies, they should respawn at the most recently activated checkpoint
**Validates: Requirements 4.5**

Property 14: Level 2 has larger gaps
*For any* platform gap measurement, the average gap size in level 2 should be larger than in level 1
**Validates: Requirements 6.1**

Property 15: Hazard density increases
*For any* section of level 2, hazard count should increase as the player progresses through the level
**Validates: Requirements 6.3**

Property 16: Level 2 has more collectibles
*For any* collectible count, level 2 should have more collectibles than level 1
**Validates: Requirements 6.4**

Property 17: Level 2 has higher score multiplier
*For any* level completion, level 2 should apply a higher score multiplier than level 1
**Validates: Requirements 6.5**

## Error Handling

### Level Transition Errors
- Handle case where level 2 data fails to load
- Validate level configuration before loading
- Provide fallback to level 1 if level 2 is unavailable

### Moving Platform Errors
- Prevent platforms from moving outside canvas bounds
- Handle edge case where player is between platforms
- Validate path data before creating moving platforms

### Laser Hazard Errors
- Ensure laser timers don't go negative
- Handle case where laser overlaps with spawn point
- Validate laser configuration parameters

### Checkpoint Errors
- Prevent checkpoint activation while player is in air
- Handle case where checkpoint position is invalid
- Ensure checkpoint respawn doesn't place player in hazard

## Testing Strategy

### Unit Tests
- Test level transition logic
- Test moving platform path following
- Test laser cycle timing
- Test checkpoint activation and respawn
- Test level configuration loading

### Property-Based Tests
Using fast-check library for JavaScript:
- Each property test should run minimum 100 iterations
- Each test must reference the design document property with format: '**Feature: level-2, Property {number}: {property_text}**'
- Generate random level configurations, platform paths, and laser timings
- Test edge cases like simultaneous checkpoint activations and rapid level transitions

### Integration Tests
- Test complete level 1 to level 2 transition
- Test player interaction with all level 2 mechanics
- Test checkpoint system across multiple deaths
- Test score persistence across levels

