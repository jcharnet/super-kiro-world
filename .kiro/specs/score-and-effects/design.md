# Design Document

## Overview

This design extends Super Kiro World with a comprehensive score persistence system and enhanced visual feedback through particle effects. The system will store game history in browser Local Storage, track personal high scores, and provide rich visual effects including trail particles, collision explosions, obstacle sparkles, and celebratory confetti.

The implementation leverages the existing particle system architecture while extending it with new particle types and behaviors. Score persistence will be handled client-side using Local Storage, complementing the existing server-side leaderboard system.

## Architecture

### Component Overview

The feature consists of three main subsystems:

1. **Score Persistence Layer**: Manages Local Storage operations for game history and high scores
2. **Particle Effect System**: Extends the existing Particle class with specialized particle types
3. **Game State Integration**: Connects persistence and effects to game events

### Data Flow

```
Game Events → Score Manager → Local Storage
     ↓
Particle Factory → Particle System → Renderer
     ↓
High Score Tracker → HUD Display
```

## Components and Interfaces

### Score Manager

**Purpose**: Handles all score persistence operations and high score tracking

**Interface**:
```javascript
class ScoreManager {
    constructor()
    loadGameHistory()           // Returns array of game sessions
    saveGameSession(session)    // Stores completed game to history
    getHighScore(playerName)    // Returns highest score for player
    getCurrentPlayerName()      // Returns current player name
    setPlayerName(name)         // Updates player name
}
```

**Storage Schema**:
```javascript
{
    playerName: string,
    gameHistory: [
        {
            player: string,
            score: number,
            time: number,
            lives: number,
            timestamp: string (ISO 8601)
        }
    ]
}
```

### Particle Factory

**Purpose**: Creates specialized particle effects for different game events

**Interface**:
```javascript
class ParticleFactory {
    static createTrailParticle(x, y, vx, vy)
    static createExplosionParticles(x, y, count)
    static createSparkleParticles(x, y, count)
    static createConfettiParticles(count)
}
```

### Enhanced Particle Class

**Purpose**: Extends existing Particle class with rotation and specialized rendering

**Properties**:
```javascript
class Particle {
    x, y              // Position
    vx, vy            // Velocity
    color             // Color string
    life, maxLife     // Lifetime tracking
    rotation          // Rotation angle (for confetti)
    rotationSpeed     // Angular velocity (for confetti)
    type              // 'trail', 'explosion', 'sparkle', 'confetti'
}
```

## Data Models

### Game Session Model

```javascript
{
    player: string,        // Player name
    score: number,         // Collectibles gathered
    time: number,          // Seconds to complete
    lives: number,         // Lives remaining
    timestamp: string      // ISO 8601 datetime
}
```

### Local Storage Structure

```javascript
{
    playerName: string,           // Current player name
    gameHistory: GameSession[],   // All completed games
    highScores: {                 // Per-player high scores
        [playerName]: number
    }
}
```

### Particle Configuration

```javascript
{
    trail: {
        color: '#790ECB',
        life: 15,
        size: 2,
        spawnRate: 0.3  // Probability per frame
    },
    explosion: {
        colors: ['#ff6b6b', '#ffd93d', '#ff8c42'],
        life: 25,
        count: 12,
        speed: 3-5
    },
    sparkle: {
        colors: ['#ffffff', '#ffff00', '#790ECB'],
        life: 30,
        count: 8,
        speed: 1-3
    },
    confetti: {
        colors: ['#790ECB', '#ff6b6b', '#4ecdc4', '#ffd93d', '#95e1d3'],
        life: 120,
        count: 50,
        gravity: 0.3
    }
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Game session storage completeness
*For any* completed game session with player name, score, time, lives, and timestamp, storing it to Local Storage and then loading it back should return a session with all fields intact and equal to the original values.
**Validates: Requirements 1.1, 1.2**

### Property 2: Game history preservation
*For any* existing game history and any new game session, storing the new session should result in the history containing all previous sessions plus the new one, with no data loss or corruption.
**Validates: Requirements 1.4**

### Property 3: Player name association
*For any* player name change and subsequent game session, the new session should be associated with the updated player name, not the previous one.
**Validates: Requirements 1.5**

### Property 4: High score calculation accuracy
*For any* collection of game sessions for a player, the calculated high score should equal the maximum score value present in that player's session history.
**Validates: Requirements 2.1**

### Property 5: High score update on achievement
*For any* current high score and any new score greater than it, submitting the new score should result in the high score being updated to the new value.
**Validates: Requirements 2.2**

### Property 6: HUD display completeness
*For any* game state with a current score and high score, rendering the HUD should produce output containing both the current score value and the high score value.
**Validates: Requirements 2.3**

### Property 7: High score persistence round-trip
*For any* new high score achievement, the high score should be persisted to Local Storage such that loading the data returns the same high score value.
**Validates: Requirements 2.4**

### Property 8: Trail particle generation on movement
*For any* character movement (horizontal or vertical), if the character velocity exceeds a threshold, trail particles should be spawned within a reasonable proximity to the character's position.
**Validates: Requirements 3.1, 3.2**

### Property 9: Particle opacity decay
*For any* particle with a current life value less than its maximum life, the rendered opacity should be proportional to the ratio of current life to maximum life.
**Validates: Requirements 3.3**

### Property 10: Particle lifecycle cleanup
*For any* particle with life value less than or equal to zero, the particle should be removed from the active particle array on the next update cycle.
**Validates: Requirements 3.4, 4.5, 5.4, 6.4**

### Property 11: Stationary character particle reduction
*For any* character with velocity magnitude below a threshold, the trail particle spawn rate should be significantly lower than during active movement.
**Validates: Requirements 3.5**

### Property 12: Collision explosion spawning
*For any* collision between the character and a platform, explosion particles should be spawned at coordinates within the collision bounds.
**Validates: Requirements 4.1, 4.2**

### Property 13: Explosion particle dispersion
*For any* explosion particle set created at a point, all particles should have velocity vectors pointing away from the explosion center with magnitude greater than zero.
**Validates: Requirements 4.3, 4.4**

### Property 14: Collectible sparkle spawning
*For any* collectible item that transitions from uncollected to collected state, sparkle particles should be spawned at the collectible's position coordinates.
**Validates: Requirements 5.1**

### Property 15: Sparkle particle colors
*For any* sparkle particle created, its color should be one of the designated bright colors from the sparkle color palette.
**Validates: Requirements 5.2**

### Property 16: Sparkle particle upward velocity
*For any* sparkle particle created, its initial velocity vector should have a positive (upward) y-component.
**Validates: Requirements 5.3**

### Property 17: Independent sparkle effects
*For any* sequence of N collectibles gathered in rapid succession, the total number of sparkle particles spawned should be at least N times the minimum sparkle count per collectible.
**Validates: Requirements 5.5**

### Property 18: High score confetti trigger
*For any* score submission that exceeds the previous high score, confetti particles should be spawned with a count greater than a minimum threshold.
**Validates: Requirements 6.1**

### Property 19: Confetti color variety
*For any* set of confetti particles created, the particles should use at least 3 different colors from the Kiro brand palette.
**Validates: Requirements 6.2**

### Property 20: Confetti physics application
*For any* confetti particle, it should have both a non-zero rotation speed and be affected by gravity (positive y-acceleration).
**Validates: Requirements 6.3**

### Property 21: Confetti minimum quantity
*For any* confetti effect triggered, the number of confetti particles spawned should be at least 30 to ensure visual impact.
**Validates: Requirements 6.5**

## Error Handling

### Local Storage Errors

**Quota Exceeded**: 
- Implement try-catch around Local Storage operations
- If quota exceeded, remove oldest game history entries (keep last 100)
- Display warning message to player
- Continue game operation without persistence

**Storage Unavailable**:
- Detect if Local Storage is disabled or unavailable
- Fall back to in-memory storage for current session
- Display notification that scores won't persist
- Allow gameplay to continue normally

**Corrupted Data**:
- Validate loaded data structure before use
- If validation fails, reset to empty history
- Log error to console for debugging
- Initialize with default values

### Particle System Errors

**Excessive Particle Count**:
- Implement maximum particle limit (e.g., 500 particles)
- When limit reached, remove oldest particles first
- Prevents performance degradation
- Maintains visual quality with most recent effects

**Invalid Particle Parameters**:
- Validate particle creation parameters (position, velocity, color)
- Use default values if parameters are invalid
- Log warning for debugging
- Continue particle system operation

## Testing Strategy

### Unit Testing

The implementation will include unit tests for:

**Score Manager**:
- Local Storage read/write operations
- High score calculation with various input sets
- Player name updates and associations
- Empty state initialization
- Data validation and error recovery

**Particle Factory**:
- Correct particle type creation
- Parameter validation
- Color palette selection
- Velocity vector calculations

**Particle Lifecycle**:
- Opacity calculation based on life ratio
- Cleanup of expired particles
- Update and render methods

### Property-Based Testing

Property-based tests will be implemented using **fast-check** (JavaScript property testing library). Each test will run a minimum of 100 iterations with randomly generated inputs.

**Configuration**:
```javascript
fc.assert(
    fc.property(/* generators */, (/* inputs */) => {
        // Test implementation
    }),
    { numRuns: 100 }
);
```

**Test Tagging Format**:
Each property-based test will include a comment tag:
```javascript
// Feature: score-and-effects, Property 1: Game session storage completeness
```

**Property Test Coverage**:
- Each correctness property from the design document will have one corresponding property-based test
- Tests will use smart generators that produce valid game states, scores, and particle configurations
- Generators will include edge cases (empty histories, zero scores, boundary values)
- Tests will verify invariants hold across all generated inputs

**Generator Strategy**:
- Game sessions: random player names, scores (0-100), times (1-1000s), lives (0-3)
- Particle positions: within canvas bounds (0-800, 0-600)
- Velocities: reasonable ranges (-10 to 10)
- Colors: from defined palettes
- Edge cases: empty arrays, zero values, maximum values

### Integration Testing

Integration tests will verify:
- Score persistence across page reloads
- Particle effects triggered by actual game events
- HUD updates reflecting score changes
- Confetti triggering on high score achievement
- Multiple particle types coexisting correctly

### Performance Testing

Performance considerations:
- Particle count limits prevent frame rate drops
- Local Storage operations are async-safe
- Particle updates use efficient array operations
- Rendering optimizations for large particle counts

## Implementation Notes

### Browser Compatibility

- Local Storage is supported in all modern browsers
- Use feature detection before accessing Local Storage
- Provide graceful degradation if unavailable

### Performance Optimization

- Batch particle updates for efficiency
- Use object pooling for particles if needed
- Limit particle array size to prevent memory issues
- Use requestAnimationFrame for smooth rendering

### Visual Polish

- Trail particles use Kiro purple (#790ECB) for brand consistency
- Explosion particles use warm colors (red, orange, yellow)
- Sparkle particles use bright colors (white, yellow, purple)
- Confetti uses full Kiro brand palette for celebration
- All particles use alpha blending for smooth appearance

### Future Enhancements

- Cloud sync for cross-device score persistence
- Particle effect customization options
- Achievement system with special effects
- Replay system using stored game history
- Statistics dashboard showing score trends
