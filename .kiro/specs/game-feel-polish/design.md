# Design Document

## Overview

This design enhances Super Kiro World's core gameplay feel through improved physics, visual feedback, and performance optimizations. The implementation focuses on making every player action feel responsive and satisfying while maintaining smooth 60 FPS performance through efficient rendering and object pooling.

## Architecture

### Component Overview

The feature consists of four main subsystems:

1. **Enhanced Physics System**: Improved movement with acceleration, coyote time, and jump buffering
2. **Visual Feedback System**: Screen shake, landing effects, and ambient particles
3. **Performance Optimization Layer**: Object pooling and viewport culling
4. **Camera Enhancement**: Look-ahead and improved smoothing

### Data Flow

```
Player Input → Physics System → Movement State
     ↓
Visual Feedback Triggers → Particle Pool → Renderer
     ↓
Camera System → Viewport Culling → Optimized Render
```

## Components and Interfaces

### Enhanced Player Physics

**Purpose**: Provides responsive, forgiving movement controls

**New Properties**:
```javascript
class Player {
    // Existing properties...
    
    // Enhanced movement
    acceleration: number = 0.8
    airAcceleration: number = 0.4
    maxSpeed: number = 5
    groundFriction: number = 0.85
    airFriction: number = 0.95
    
    // Jump improvements
    coyoteTime: number = 0.1  // seconds
    coyoteTimer: number = 0
    jumpBufferTime: number = 0.1
    jumpBufferTimer: number = 0
    isJumpHeld: boolean = false
    jumpReleaseGravity: number = 1.5
    
    // Animation state
    animationState: 'idle' | 'running' | 'jumping' | 'falling'
    idleTimer: number = 0
}
```

**Methods**:
- `updateMovement()`: Apply acceleration-based movement
- `updateCoyoteTime()`: Track grace period for jumping
- `updateJumpBuffer()`: Remember jump inputs
- `applyVariableJump()`: Adjust jump height based on button hold
- `updateAnimationState()`: Track current animation state

### Screen Shake System

**Purpose**: Adds impact feedback to collisions and events

**Interface**:
```javascript
class ScreenShake {
    intensity: number = 0
    duration: number = 0
    frequency: number = 0
    
    trigger(intensity, duration)
    update(deltaTime)
    getOffset(): { x: number, y: number }
}
```

### Particle Pool

**Purpose**: Reuses particle objects for performance

**Interface**:
```javascript
class ParticlePool {
    pool: Particle[] = []
    active: Particle[] = []
    maxSize: number = 500
    
    acquire(type): Particle
    release(particle): void
    update(): void
    render(ctx, camera): void
}
```

### Enhanced Camera

**Purpose**: Smooth following with look-ahead

**New Properties**:
```javascript
class Camera {
    // Existing properties...
    
    lookAheadDistance: number = 100
    lookAheadSmoothing: number = 0.05
    verticalOffset: number = 0
    targetVerticalOffset: number = 0
    deadzone: { x: number, y: number }
}
```

## Data Models

### Movement State

```javascript
{
    velocity: { x: number, y: number },
    acceleration: { x: number, y: number },
    onGround: boolean,
    coyoteTimeActive: boolean,
    jumpBuffered: boolean,
    animationState: string
}
```

### Visual Effect Configuration

```javascript
{
    screenShake: {
        landing: { intensity: 5, duration: 0.2 },
        collision: { intensity: 8, duration: 0.3 },
        damage: { intensity: 12, duration: 0.4 }
    },
    particles: {
        landing: { count: 8, color: '#ffffff', spread: 45 },
        running: { spawnRate: 0.2, color: '#790ECB' },
        idle: { count: 3, floatSpeed: 0.5 }
    }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Acceleration consistency
*For any* player movement input, applying acceleration should result in velocity that approaches target speed smoothly without exceeding maximum speed.
**Validates: Requirements 1.1**

### Property 2: Coyote time window
*For any* player leaving a platform, jump input within 0.1 seconds should be accepted and result in a valid jump.
**Validates: Requirements 2.1**

### Property 3: Jump buffer execution
*For any* jump input before landing, the jump should execute immediately upon the next ground contact within 0.1 seconds.
**Validates: Requirements 2.2**

### Property 4: Variable jump height
*For any* jump where the button is released early, the resulting jump height should be less than a full-duration jump.
**Validates: Requirements 2.3, 2.4**

### Property 5: Particle pool reuse
*For any* particle that expires, it should be returned to the pool and reused for new effects rather than creating new objects.
**Validates: Requirements 4.1**

### Property 6: Viewport culling efficiency
*For any* game object outside the camera viewport, it should not be rendered to the canvas.
**Validates: Requirements 4.2**

### Property 7: Camera look-ahead positioning
*For any* player moving horizontally, the camera should position to show more space in the direction of movement.
**Validates: Requirements 5.1**

### Property 8: Screen shake intensity decay
*For any* screen shake effect, the intensity should decrease over time until reaching zero.
**Validates: Requirements 3.1, 3.2, 3.3**

## Error Handling

### Physics Edge Cases

**Stuck in Platform**: 
- Detect when player is embedded in platform
- Apply correction force to push player out
- Prevent velocity from increasing while stuck

**Extreme Velocities**:
- Cap maximum velocity to prevent tunneling through platforms
- Apply velocity damping if speed exceeds safe threshold

### Performance Degradation

**Low Frame Rate**:
- Use delta time for physics calculations
- Reduce particle spawn rate if FPS drops below 45
- Disable non-essential visual effects temporarily

**Memory Pressure**:
- Limit particle pool growth
- Clear inactive particles more aggressively
- Reduce viewport culling margin

## Testing Strategy

### Unit Testing

**Movement Physics**:
- Test acceleration reaches target speed
- Test friction reduces velocity correctly
- Test air control is reduced compared to ground
- Test direction changes apply quick turnaround

**Coyote Time & Jump Buffer**:
- Test coyote time window accepts jumps
- Test jump buffer executes on landing
- Test timers expire correctly
- Test edge cases (multiple jumps, rapid inputs)

**Particle Pool**:
- Test particle acquisition from pool
- Test particle release back to pool
- Test pool doesn't exceed maximum size
- Test active particle tracking

### Integration Testing

**Gameplay Feel**:
- Playtest movement responsiveness
- Verify jump timing feels forgiving
- Check visual feedback is satisfying
- Confirm camera follows smoothly

**Performance**:
- Measure FPS with maximum particles
- Test viewport culling reduces draw calls
- Verify object pooling reduces allocations
- Check memory usage stays stable

## Implementation Notes

### Movement Tuning Values

These values provide a good starting point but should be adjusted based on playtesting:

```javascript
const MOVEMENT_CONFIG = {
    acceleration: 0.8,
    airAcceleration: 0.4,
    maxSpeed: 5,
    groundFriction: 0.85,
    airFriction: 0.95,
    coyoteTime: 0.1,
    jumpBufferTime: 0.1,
    jumpReleaseGravityMultiplier: 1.5
};
```

### Visual Effect Timing

```javascript
const EFFECT_CONFIG = {
    screenShake: {
        landing: { intensity: 5, duration: 200 },  // ms
        wallHit: { intensity: 8, duration: 300 },
        damage: { intensity: 12, duration: 400 }
    },
    particles: {
        landingCount: 8,
        runningSpawnRate: 0.2,  // probability per frame
        idleFloatSpeed: 0.5
    }
};
```

### Performance Targets

- Maintain 60 FPS with 500 active particles
- Viewport culling should reduce draw calls by 50%+ for large levels
- Object pooling should eliminate particle allocations during gameplay
- Memory usage should remain stable over extended play sessions

### Camera Tuning

```javascript
const CAMERA_CONFIG = {
    lookAheadDistance: 100,  // pixels ahead of player
    lookAheadSmoothing: 0.05,
    verticalOffset: -50,  // show more above player
    deadzone: { x: 50, y: 30 }  // area where camera doesn't move
};
```

## Future Enhancements

- Add squash and stretch animations for player sprite
- Implement dust clouds on direction changes
- Add motion blur effect during high-speed movement
- Create particle trails for collectibles
- Add parallax layers to background for depth
