# Design Document

## Overview

This design adds a power-up system to Super Kiro World with four distinct collectible abilities: Speed Boost, Invincibility Shield, Double Jump, and Slow-Motion. Each power-up provides temporary enhancements with visual feedback, duration timers, and respawn mechanics.

## Architecture

### Component Overview

1. **PowerUp Class**: Base class for all power-up types
2. **PowerUpManager**: Manages active power-ups and their effects
3. **PowerUpRenderer**: Handles visual effects and animations
4. **PowerUpSpawner**: Controls power-up placement and respawning

### Data Flow

```
Player Collision → PowerUp.collect() → PowerUpManager.activate()
     ↓
PowerUpManager → Apply Effect → Player State
     ↓
Update Loop → Check Duration → Deactivate Effect
     ↓
Respawn Timer → PowerUpSpawner → New PowerUp
```

## Components and Interfaces

### PowerUp Class

```javascript
class PowerUp {
    constructor(x, y, type)
    update(deltaTime): void
    render(ctx): void
    collect(player): void
    isColliding(player): boolean
    
    // Properties
    x, y: number
    type: string
    collected: boolean
    respawnTime: number
    glowIntensity: number
}
```

### PowerUpManager

```javascript
class PowerUpManager {
    constructor()
    activatePowerUp(type, duration): void
    update(deltaTime): void
    isActive(type): boolean
    getRemainingTime(type): number
    deactivateAll(): void
    
    // Active power-ups tracking
    activePowerUps: Map<string, {duration, effect}>
}
```

### Power-Up Types

#### Speed Boost
- Duration: 5 seconds
- Effect: 1.5x movement speed multiplier
- Visual: Yellow trail particles
- Icon: Lightning bolt

#### Invincibility Shield
- Duration: 8 seconds
- Effect: Prevents damage, allows hazard passage
- Visual: Pulsing blue shield circle
- Icon: Shield

#### Double Jump
- Duration: 10 seconds
- Effect: Allows one additional jump while airborne
- Visual: Jump counter indicator
- Icon: Double arrow up

#### Slow-Motion
- Duration: 4 seconds
- Effect: 0.5x game speed (except player input)
- Visual: Desaturated color filter
- Icon: Clock

## Data Models

### PowerUp Data Structure

```javascript
{
    x: number,
    y: number,
    type: 'speed' | 'invincibility' | 'doubleJump' | 'slowMotion',
    collected: boolean,
    respawnTimer: number,
    respawnDuration: number,
    glowIntensity: number,
    floatOffset: number
}
```

### Active Power-Up State

```javascript
{
    type: string,
    duration: number,
    remainingTime: number,
    effect: Function
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Speed boost increases movement speed
*For any* player state, when a speed boost is collected, the movement speed multiplier should be 1.5x for the duration
**Validates: Requirements 1.1**

Property 2: Speed boost expiration restores normal speed
*For any* player state, when a speed boost is activated and then expires, the movement speed should return to the original value
**Validates: Requirements 1.3**

Property 3: Invincibility prevents damage
*For any* damage source, when invincibility is active, the player should not take damage
**Validates: Requirements 2.1**

Property 4: Invincibility allows hazard passage
*For any* hazard collision, when invincibility is active, the player should pass through safely without damage
**Validates: Requirements 2.4**

Property 5: Double jump allows additional airborne jump
*For any* player state while airborne, when double jump is collected, the player should be able to jump one additional time
**Validates: Requirements 3.1**

Property 6: Landing resets double jump
*For any* player state, when double jump is used and the player lands, the double jump should become available again
**Validates: Requirements 3.4**

Property 7: Double jump expires after duration
*For any* player state, when double jump is collected, it should expire after 10 seconds
**Validates: Requirements 3.5**

Property 8: Slow-motion reduces game speed
*For any* game state, when slow-motion is collected, the game speed should be reduced to 0.5x for the duration
**Validates: Requirements 4.1**

Property 9: Slow-motion expiration restores normal speed
*For any* game state, when slow-motion is activated and then expires, the game speed should return to normal
**Validates: Requirements 4.4**

Property 10: Multiple power-ups stack effects
*For any* combination of power-ups, when multiple power-ups are active simultaneously, all effects should be applied without conflict
**Validates: Requirements 5.5**

Property 11: Collection starts respawn timer
*For any* power-up, when it is collected, the respawn timer should start immediately
**Validates: Requirements 6.1**

Property 12: Respawn timer makes power-up available
*For any* power-up, when the respawn timer completes, the power-up should become available for collection again
**Validates: Requirements 6.2**

Property 13: Level restart resets power-up states
*For any* game state with collected power-ups, when the level restarts, all power-ups should be reset to their initial uncollected state
**Validates: Requirements 6.4**

## Error Handling

### Power-Up Collection Errors
- Prevent collecting the same power-up multiple times simultaneously
- Handle edge case where power-up is collected during respawn
- Validate power-up type before activation

### Duration Management Errors
- Ensure timers don't go negative
- Handle multiple activations of same power-up type (refresh duration)
- Prevent duration overflow

### State Consistency Errors
- Ensure power-up effects are properly removed on expiration
- Handle level restart during active power-ups
- Maintain consistent state across game pause/resume

## Testing Strategy

### Unit Tests
- Test power-up collision detection
- Test respawn timer logic
- Test power-up state transitions
- Test effect application and removal

### Property-Based Tests
Using fast-check library for JavaScript:
- Each property test should run minimum 100 iterations
- Each test must reference the design document property with format: '**Feature: power-ups, Property {number}: {property_text}**'
- Generate random power-up types, positions, and durations
- Test edge cases like simultaneous collections and rapid state changes

### Integration Tests
- Test power-up interaction with player movement
- Test multiple power-ups active simultaneously
- Test power-up effects during level transitions
- Test respawn behavior across game sessions

