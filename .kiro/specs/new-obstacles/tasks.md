# Implementation Plan

- [x] 1. Create Obstacle base class
  - Define Obstacle base class with common properties
  - Add update and render methods
  - Implement collision detection interface
  - Add effect application method
  - _Requirements: 5.1, 5.2_

- [x] 2. Implement MovingPlatform class
  - Create MovingPlatform extending Obstacle
  - Add path following logic with waypoints
  - Implement direction reversal at path ends
  - Add smooth movement interpolation
  - Add motion trail visual effect
  - _Requirements: 1.1, 1.3, 1.5_

- [x] 2.1 Write property test for moving platform configuration
  - **Property 1: Moving platforms have valid configuration**
  - **Validates: Requirements 1.1**

- [x] 2.2 Write property test for path reversal
  - **Property 3: Moving platforms reverse at path end**
  - **Validates: Requirements 1.3**

- [x] 3. Add player-platform interaction
  - Detect when player is standing on moving platform
  - Apply platform velocity to player position
  - Handle player jumping off moving platform
  - Ensure smooth player movement with platform
  - _Requirements: 1.2_

- [x] 3.1 Write property test for platform carrying player
  - **Property 2: Moving platforms carry player**
  - **Validates: Requirements 1.2**

- [x] 4. Implement LaserHazard class
  - Create LaserHazard with timer-based activation
  - Add three phases: inactive, warning, active
  - Implement cycle timing logic
  - Add collision detection with player
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 4.1 Write property test for laser configuration
  - **Property 4: Laser hazards have valid pattern**
  - **Validates: Requirements 2.1**

- [x] 4.2 Write property test for warning duration
  - **Property 5: Laser warning duration is correct**
  - **Validates: Requirements 2.2**

- [x] 4.3 Write property test for laser damage
  - **Property 6: Active lasers cause damage**
  - **Validates: Requirements 2.3**

- [x] 4.4 Write property test for inactive laser safety
  - **Property 7: Inactive lasers are safe**
  - **Validates: Requirements 2.4**

- [x] 4.5 Write property test for laser timing consistency
  - **Property 8: Laser timing is consistent**
  - **Validates: Requirements 2.5**

- [x] 5. Add laser visual effects
  - Render warning indicator (flashing red)
  - Draw laser beam when active
  - Add particle effects on laser fire
  - Implement smooth phase transitions
  - _Requirements: 2.2, 2.3, 5.1, 5.3, 5.4_

- [x] 6. Implement SpikeTrap class
  - Create SpikeTrap with orientation support
  - Add collision detection with player
  - Implement damage and knockback application
  - Add visual warning indicators
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 6.1 Write property test for spike placement
  - **Property 9: Spikes are placed on valid surfaces**
  - **Validates: Requirements 3.1**

- [x] 6.2 Write property test for spike damage
  - **Property 10: Spikes cause damage and knockback**
  - **Validates: Requirements 3.2**

- [x] 7. Implement FallingPlatform class
  - Create FallingPlatform with timer logic
  - Add 0.5 second delay before falling
  - Implement falling with increasing speed
  - Add respawn after 5 seconds off-screen
  - Add timer cancellation when player leaves
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 7.1 Write property test for fall timer start
  - **Property 11: Falling platform timer starts on landing**
  - **Validates: Requirements 4.1**

- [x] 7.2 Write property test for platform drop
  - **Property 12: Falling platform drops after timer**
  - **Validates: Requirements 4.2**

- [x] 7.3 Write property test for platform respawn
  - **Property 13: Falling platforms respawn**
  - **Validates: Requirements 4.4**

- [x] 7.4 Write property test for timer cancellation
  - **Property 14: Leaving platform cancels timer**
  - **Validates: Requirements 4.5**

- [x] 8. Add falling platform visual effects
  - Display crumbling animation when falling
  - Add particle effects during fall
  - Show respawn animation
  - Implement state-based color indicators
  - _Requirements: 4.3, 5.2, 5.3, 5.4_

- [x] 9. Create ObstacleManager class
  - Define ObstacleManager to coordinate obstacles
  - Add methods to add, update, and render obstacles
  - Implement collision checking for all obstacles
  - Add pattern coordination logic
  - _Requirements: 1.4, 6.1, 6.2_

- [x] 10. Integrate obstacles into game loop
  - Add obstacle spawning to level initialization
  - Update all obstacles in game loop
  - Render obstacles with effects
  - Handle obstacle collisions with player
  - _Requirements: All_

- [x] 11. Add obstacle patterns
  - Create coordinated timing patterns for obstacles
  - Ensure windows of opportunity exist
  - Make patterns learnable and repeatable
  - Validate that solutions exist for all challenges
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 12. Add audio integration
  - Play laser warning sound
  - Play laser fire sound
  - Play spike damage sound
  - Play falling platform crumble sound
  - _Requirements: 3.4_

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

