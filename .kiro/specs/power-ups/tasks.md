# Implementation Plan

- [x] 1. Create PowerUp base class
  - Define PowerUp class with position, type, and state properties
  - Implement floating animation logic
  - Add glow effect with proximity detection
  - Implement collision detection with player
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 2. Implement PowerUpManager
  - Create PowerUpManager class to track active power-ups
  - Add methods to activate/deactivate power-ups
  - Implement duration tracking and expiration
  - Add support for multiple simultaneous power-ups
  - _Requirements: 5.5_

- [x] 2.1 Write property test for multiple power-ups stacking
  - **Property 10: Multiple power-ups stack effects**
  - **Validates: Requirements 5.5**

- [x] 3. Implement Speed Boost power-up
  - Create speed boost type with 5-second duration
  - Apply 1.5x movement speed multiplier
  - Add yellow trail particle effect
  - Implement expiration to restore normal speed
  - _Requirements: 1.1, 1.3_

- [x] 3.1 Write property test for speed boost activation
  - **Property 1: Speed boost increases movement speed**
  - **Validates: Requirements 1.1**

- [x] 3.2 Write property test for speed boost expiration
  - **Property 2: Speed boost expiration restores normal speed**
  - **Validates: Requirements 1.3**

- [x] 4. Implement Invincibility Shield power-up
  - Create invincibility type with 8-second duration
  - Prevent damage from all sources
  - Add pulsing blue shield visual effect
  - Allow safe passage through hazards
  - _Requirements: 2.1, 2.4_

- [x] 4.1 Write property test for invincibility damage prevention
  - **Property 3: Invincibility prevents damage**
  - **Validates: Requirements 2.1**

- [x] 4.2 Write property test for invincibility hazard passage
  - **Property 4: Invincibility allows hazard passage**
  - **Validates: Requirements 2.4**

- [x] 5. Implement Double Jump power-up
  - Create double jump type with 10-second duration
  - Allow one additional jump while airborne
  - Reset double jump on landing
  - Add jump counter indicator
  - _Requirements: 3.1, 3.4, 3.5_

- [x] 5.1 Write property test for double jump availability
  - **Property 5: Double jump allows additional airborne jump**
  - **Validates: Requirements 3.1**

- [x] 5.2 Write property test for double jump reset on landing
  - **Property 6: Landing resets double jump**
  - **Validates: Requirements 3.4**

- [x] 5.3 Write property test for double jump expiration
  - **Property 7: Double jump expires after duration**
  - **Validates: Requirements 3.5**

- [x] 6. Implement Slow-Motion power-up
  - Create slow-motion type with 4-second duration
  - Reduce game speed to 0.5x
  - Maintain normal player input responsiveness
  - Add desaturated visual filter
  - Smoothly restore normal speed on expiration
  - _Requirements: 4.1, 4.4_

- [x] 6.1 Write property test for slow-motion activation
  - **Property 8: Slow-motion reduces game speed**
  - **Validates: Requirements 4.1**

- [x] 6.2 Write property test for slow-motion expiration
  - **Property 9: Slow-motion expiration restores normal speed**
  - **Validates: Requirements 4.4**

- [x] 7. Implement power-up respawn system
  - Add respawn timer to PowerUp class
  - Start timer when power-up is collected
  - Make power-up available again after timer completes
  - Add spawn animation on respawn
  - _Requirements: 6.1, 6.2_

- [x] 7.1 Write property test for respawn timer start
  - **Property 11: Collection starts respawn timer**
  - **Validates: Requirements 6.1**

- [x] 7.2 Write property test for respawn completion
  - **Property 12: Respawn timer makes power-up available**
  - **Validates: Requirements 6.2**

- [x] 8. Integrate power-ups with game loop
  - Add power-up spawning to level initialization
  - Update power-ups in game loop
  - Render power-ups with effects
  - Handle power-up collection in player collision
  - Display active power-up indicators in HUD
  - _Requirements: 1.4, 3.3_

- [x] 9. Add power-up state management
  - Reset power-ups on level restart
  - Handle power-up effects during game pause
  - Save/load power-up states if needed
  - _Requirements: 6.4_

- [x] 9.1 Write property test for level restart reset
  - **Property 13: Level restart resets power-up states**
  - **Validates: Requirements 6.4**

- [x] 10. Add audio integration
  - Play collection sound when power-up is collected
  - Play activation sounds for each power-up type
  - Play expiration warning sound
  - _Requirements: 1.5, 2.5_

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

