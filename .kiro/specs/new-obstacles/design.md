# Design Document

## Overview

This design adds four new obstacle types to Super Kiro World: Moving Platforms, Laser Hazards, Spike Traps, and Falling Platforms. Each obstacle provides unique challenges with clear visual feedback, coordinated timing patterns, and fair gameplay mechanics.

## Architecture

### Component Overview

1. **Obstacle Base Class**: Shared functionality for all obstacles
2. **MovingPlatform**: Platform that follows defined path
3. **LaserHazard**: Timed beam with warning indicators
4. **SpikeTrap**: Static damage hazard
5. **FallingPlatform**: Platform that drops after player contact
6. **ObstacleManager**: Coordinates obstacle timing and patterns

### Data Flow

```
Level Init → ObstacleManager → Spawn Obstacles
     ↓
Game Loop → Update Obstacles → Check Collisions → Apply Effects
     ↓
Obstacle State Change → Visual Feedback → Player Response
```

## Components and Interfaces

### Obstacle Base Class

```javascript
class Obstacle {
    constructor(x, y, type)
    update(deltaTime): void
    render(ctx): void
    checkCollision(player): boolean
    applyEffect(player): void
    
    // Properties
    x, y: number
    type: string
    active: boolean
    dangerous: boolean
}
```

### MovingPlatform

```javascript
class MovingPlatform extends Obstacle {
    constructor(x, y, width, height, path, speed)
    update(deltaTime): void
    applyVelocityToPlayer(player): void
    reverseDirection(): void
    
    // Properties
    path: Array<{x, y}>
    currentPathIndex: number
    speed: number
    velocity: {x, y}
}
```

### LaserHazard

```javascript
class LaserHazard extends Obstacle {
    constructor(x, y, direction, pattern)
    update(deltaTime): void
    activate(): void
    deactivate(): void
    showWarning(): void
    
    // Properties
    direction: 'horizontal' | 'vertical'
    cycleTime: number
    warningTime: number
    activeTime: number
    currentPhase: 'inactive' | 'warning' | 'active'
}
```

### SpikeTrap

```javascript
class SpikeTrap extends Obstacle {
    constructor(x, y, orientation)
    checkCollision(player): boolean
    applyDamage(player): void
    
    // Properties
    orientation: 'up' | 'down' | 'left' | 'right'
    damage: number
    knockbackForce: number
}
```

### FallingPlatform

```javascript
class FallingPlatform extends Obstacle {
    constructor(x, y, width, height)
    update(deltaTime): void
    startFallTimer(): void
    cancelFallTimer(): void
    fall(): void
    respawn(): void
    
    // Properties
    fallDelay: number
    fallTimer: number
    falling: boolean
    fallSpeed: number
    respawnTime: number
    originalY: number
}
```

### ObstacleManager

```javascript
class ObstacleManager {
    constructor()
    addObstacle(obstacle): void
    updateAll(deltaTime): void
    renderAll(ctx): void
    checkCollisions(player): void
    coordinatePatterns(): void
    
    // Properties
    obstacles: Array<Obstacle>
    patterns: Array<ObstaclePattern>
}
```

## Data Models

### Obstacle Configuration

```javascript
{
    type: 'moving' | 'laser' | 'spike' | 'falling',
    x: number,
    y: number,
    properties: {
        // Type-specific properties
    }
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

### Laser Pattern

```javascript
{
    cycleTime: number,
    warningTime: number,
    activeTime: number,
    inactiveTime: number
}
```

### Obstacle Pattern

```javascript
{
    obstacles: Array<Obstacle>,
    timing: Array<{obstacleIndex, activationTime}>,
    repeatInterval: number
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Moving platforms have valid configuration
*For any* spawned moving platform, it should have a defined path with at least 2 points and a positive speed value
**Validates: Requirements 1.1**

Property 2: Moving platforms carry player
*For any* player standing on a moving platform, the player's position should change in the direction of platform movement
**Validates: Requirements 1.2**

Property 3: Moving platforms reverse at path end
*For any* moving platform at the end of its path, it should reverse direction without exceeding path boundaries
**Validates: Requirements 1.3**

Property 4: Laser hazards have valid pattern
*For any* spawned laser hazard, it should have defined cycle time, warning time, and active time values
**Validates: Requirements 2.1**

Property 5: Laser warning duration is correct
*For any* laser hazard, the warning phase should last exactly 1 second before activation
**Validates: Requirements 2.2**

Property 6: Active lasers cause damage
*For any* player collision with an active laser, the player should take damage
**Validates: Requirements 2.3**

Property 7: Inactive lasers are safe
*For any* player collision with an inactive laser, the player should not take damage
**Validates: Requirements 2.4**

Property 8: Laser timing is consistent
*For any* laser hazard, the cycle time between activations should remain constant across multiple cycles
**Validates: Requirements 2.5**

Property 9: Spikes are placed on valid surfaces
*For any* spike trap, it should be positioned on a platform or wall surface
**Validates: Requirements 3.1**

Property 10: Spikes cause damage and knockback
*For any* player collision with spikes, the player should take damage and receive knockback force
**Validates: Requirements 3.2**

Property 11: Falling platform timer starts on landing
*For any* falling platform, when the player lands on it, the fall timer should start after 0.5 seconds
**Validates: Requirements 4.1**

Property 12: Falling platform drops after timer
*For any* falling platform with expired timer, the platform should begin falling with increasing speed
**Validates: Requirements 4.2**

Property 13: Falling platforms respawn
*For any* falling platform that has fallen off-screen, it should respawn at original position after 5 seconds
**Validates: Requirements 4.4**

Property 14: Leaving platform cancels timer
*For any* falling platform with active timer, when the player leaves the platform, the timer should be cancelled
**Validates: Requirements 4.5**

## Error Handling

### Moving Platform Errors
- Validate path has at least 2 points before creating platform
- Prevent platforms from moving outside canvas bounds
- Handle edge case where player is between platforms

### Laser Hazard Errors
- Ensure timing values are positive and non-zero
- Prevent laser from spawning at player start position
- Handle case where laser overlaps with required path

### Spike Trap Errors
- Validate spike placement on valid surfaces
- Prevent spikes from blocking required paths
- Handle edge case where player spawns on spikes

### Falling Platform Errors
- Ensure fall timer doesn't go negative
- Handle case where player is on platform when it respawns
- Prevent falling platforms from being only path forward

## Testing Strategy

### Unit Tests
- Test moving platform path following
- Test laser cycle timing and phases
- Test spike collision detection
- Test falling platform timer logic
- Test obstacle state transitions

### Property-Based Tests
Using fast-check library for JavaScript:
- Each property test should run minimum 100 iterations
- Each test must reference the design document property with format: '**Feature: new-obstacles, Property {number}: {property_text}**'
- Generate random obstacle configurations, paths, and timings
- Test edge cases like simultaneous activations and rapid state changes

### Integration Tests
- Test player interaction with all obstacle types
- Test multiple obstacles active simultaneously
- Test obstacle coordination and patterns
- Test obstacle behavior across level transitions

