# Implementation Plan

- [x] 1. Create LevelManager class
  - Define LevelManager to handle level state and transitions
  - Add methods to load, complete, and reset levels
  - Implement level configuration storage
  - Add current level tracking
  - _Requirements: 1.1, 1.2_

- [x] 1.1 Write property test for level transition
  - **Property 1: Level transition loads level 2**
  - **Validates: Requirements 1.2**

- [x] 2. Implement level transition screen
  - Create transition screen UI
  - Add fade in/out animations
  - Display level number and title
  - Add callback for transition completion
  - _Requirements: 1.1_

- [x] 3. Create level 2 configuration
  - Define level 2 layout with platforms and gaps
  - Set spawn and end positions
  - Configure visual theme (colors, styles)
  - Set score multiplier for level 2
  - _Requirements: 5.1, 5.2, 6.5_

- [x] 3.1 Write property test for player state reset
  - **Property 2: Level 2 resets player state**
  - **Validates: Requirements 1.3**

- [x] 3.2 Write property test for score persistence
  - **Property 3: Level transition preserves scores**
  - **Validates: Requirements 1.4**

- [x] 3.3 Write property test for score multiplier
  - **Property 17: Level 2 has higher score multiplier**
  - **Validates: Requirements 6.5**

- [x] 4. Implement MovingPlatform class
  - Create MovingPlatform extending Platform
  - Add path following logic with waypoints
  - Implement direction reversal at path ends
  - Add smooth movement interpolation
  - _Requirements: 2.1, 2.4_

- [x] 4.1 Write property test for moving platform presence
  - **Property 4: Level 2 contains moving platforms**
  - **Validates: Requirements 2.1**

- [x] 4.2 Write property test for path bounds
  - **Property 6: Platforms stay within path bounds**
  - **Validates: Requirements 2.4**

- [x] 5. Add player-platform interaction
  - Detect when player is standing on moving platform
  - Apply platform velocity to player position
  - Handle player jumping off moving platform
  - Ensure smooth player movement with platform
  - _Requirements: 2.2, 2.3_

- [x] 5.1 Write property test for platform carrying player
  - **Property 5: Moving platforms carry player**
  - **Validates: Requirements 2.2, 2.3**

- [x] 6. Implement LaserHazard class
  - Create LaserHazard with timer-based activation
  - Add warning indicator before laser fires
  - Implement active/inactive cycle
  - Add collision detection with player
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 6.1 Write property test for laser presence
  - **Property 7: Level 2 contains laser hazards**
  - **Validates: Requirements 3.1**

- [x] 6.2 Write property test for laser damage
  - **Property 8: Active lasers cause damage**
  - **Validates: Requirements 3.3**

- [x] 6.3 Write property test for laser timing consistency
  - **Property 9: Laser timing is consistent**
  - **Validates: Requirements 3.5**

- [x] 7. Add laser visual effects
  - Render warning indicator (flashing)
  - Draw laser beam when active
  - Add particle effects on laser fire
  - Implement smooth activation/deactivation
  - _Requirements: 3.2, 3.4_

- [x] 8. Implement Checkpoint class
  - Create Checkpoint with position and state
  - Add activation detection on player collision
  - Implement visual activation effect
  - Store activated checkpoint reference
  - _Requirements: 4.1, 4.3_

- [x] 8.1 Write property test for checkpoint activation
  - **Property 10: Checkpoint saves progress**
  - **Validates: Requirements 4.1**

- [x] 9. Add checkpoint respawn system
  - Respawn player at checkpoint position on death
  - Track most recent activated checkpoint
  - Reset checkpoints on level restart
  - Handle multiple checkpoint scenario
  - _Requirements: 4.2, 4.4, 4.5_

- [x] 9.1 Write property test for checkpoint respawn
  - **Property 11: Death respawns at checkpoint**
  - **Validates: Requirements 4.2**

- [x] 9.2 Write property test for checkpoint reset
  - **Property 12: Level restart resets checkpoints**
  - **Validates: Requirements 4.4**

- [x] 9.3 Write property test for most recent checkpoint
  - **Property 13: Most recent checkpoint is used**
  - **Validates: Requirements 4.5**

- [x] 10. Design level 2 layout
  - Place platforms with larger gaps than level 1
  - Add moving platforms in strategic locations
  - Position laser hazards with fair timing
  - Place checkpoints at reasonable intervals
  - Add more collectibles than level 1
  - _Requirements: 6.1, 6.3, 6.4_

- [x] 10.1 Write property test for platform gaps
  - **Property 14: Level 2 has larger gaps**
  - **Validates: Requirements 6.1**

- [x] 10.2 Write property test for hazard density
  - **Property 15: Hazard density increases**
  - **Validates: Requirements 6.3**

- [x] 10.3 Write property test for collectible count
  - **Property 16: Level 2 has more collectibles**
  - **Validates: Requirements 6.4**

- [x] 11. Integrate level 2 into game loop
  - Add level 2 to level manager
  - Update game loop to handle level-specific mechanics
  - Render level-specific visual theme
  - Handle level completion and transition
  - _Requirements: 1.2, 1.5_

- [x] 12. Add victory screen
  - Create victory screen UI for level 2 completion
  - Display total stats (score, time, collectibles)
  - Add replay and menu options
  - Implement smooth transition to victory screen
  - _Requirements: 1.5_

- [x] 13. Add audio integration
  - Play transition sound between levels
  - Add checkpoint activation sound
  - Add laser warning and fire sounds
  - Play victory music on level 2 completion
  - _Requirements: 4.3_

- [x] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

