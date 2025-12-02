# Implementation Plan

- [x] 1. Implement Score Manager and Local Storage persistence
  - Create ScoreManager class with methods for loading/saving game history
  - Implement Local Storage read/write operations with error handling
  - Add high score calculation and tracking for current player
  - Add player name management (get/set)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.4_

- [x] 1.1 Write property test for game session storage
  - **Property 1: Game session storage completeness**
  - **Validates: Requirements 1.1, 1.2**

- [x] 1.2 Write property test for game history preservation
  - **Property 2: Game history preservation**
  - **Validates: Requirements 1.4**

- [x] 1.3 Write property test for player name association
  - **Property 3: Player name association**
  - **Validates: Requirements 1.5**

- [x] 1.4 Write property test for high score calculation
  - **Property 4: High score calculation accuracy**
  - **Validates: Requirements 2.1**

- [x] 1.5 Write property test for high score persistence
  - **Property 7: High score persistence round-trip**
  - **Validates: Requirements 2.4**

- [x] 2. Integrate Score Manager with game loop
  - Initialize ScoreManager on game start
  - Load game history and high score on initialization
  - Save game session on level complete
  - Update high score tracking when score changes
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.4_

- [x] 2.1 Write property test for high score update
  - **Property 5: High score update on achievement**
  - **Validates: Requirements 2.2**

- [x] 3. Update HUD to display high score
  - Modify renderHUD function to show current high score
  - Add visual distinction between current score and high score
  - Position high score display appropriately
  - _Requirements: 2.3, 2.5_

- [x] 3.1 Write property test for HUD display completeness
  - **Property 6: HUD display completeness**
  - **Validates: Requirements 2.3**

- [x] 4. Implement enhanced Particle class with specialized types
  - Extend Particle class with rotation and rotationSpeed properties
  - Add type property to distinguish particle types
  - Update render method to handle different particle types
  - Implement rotation rendering for confetti particles
  - _Requirements: 3.3, 6.3_

- [x] 4.1 Write property test for particle opacity decay
  - **Property 9: Particle opacity decay**
  - **Validates: Requirements 3.3**

- [x] 4.2 Write property test for particle lifecycle cleanup
  - **Property 10: Particle lifecycle cleanup**
  - **Validates: Requirements 3.4, 4.5, 5.4, 6.4**

- [x] 5. Create ParticleFactory for specialized particle effects
  - Implement createTrailParticle method with Kiro purple color
  - Implement createExplosionParticles with radial dispersion
  - Implement createSparkleParticles with upward velocity
  - Implement createConfettiParticles with gravity and rotation
  - Define color palettes for each particle type
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.5_

- [x] 5.1 Write property test for explosion particle dispersion
  - **Property 13: Explosion particle dispersion**
  - **Validates: Requirements 4.3, 4.4**

- [x] 5.2 Write property test for sparkle particle colors
  - **Property 15: Sparkle particle colors**
  - **Validates: Requirements 5.2**

- [x] 5.3 Write property test for sparkle upward velocity
  - **Property 16: Sparkle particle upward velocity**
  - **Validates: Requirements 5.3**

- [x] 5.4 Write property test for confetti color variety
  - **Property 19: Confetti color variety**
  - **Validates: Requirements 6.2**

- [x] 5.5 Write property test for confetti physics
  - **Property 20: Confetti physics application**
  - **Validates: Requirements 6.3**

- [x] 5.6 Write property test for confetti minimum quantity
  - **Property 21: Confetti minimum quantity**
  - **Validates: Requirements 6.5**

- [x] 6. Add trail particle generation to Player movement
  - Add trail particle spawning in Player.update() during movement
  - Implement velocity threshold check for particle generation
  - Use spawn rate probability to control particle density
  - Reduce particle generation when player is stationary
  - _Requirements: 3.1, 3.2, 3.5_

- [x] 6.1 Write property test for trail particle generation
  - **Property 8: Trail particle generation on movement**
  - **Validates: Requirements 3.1, 3.2**

- [x] 6.2 Write property test for stationary particle reduction
  - **Property 11: Stationary character particle reduction**
  - **Validates: Requirements 3.5**

- [x] 7. Add explosion particles to collision detection
  - Detect collision events in Player.update()
  - Spawn explosion particles at collision points
  - Handle both vertical (landing) and horizontal (wall) collisions
  - _Requirements: 4.1, 4.2_

- [x] 7.1 Write property test for collision explosion spawning
  - **Property 12: Collision explosion spawning**
  - **Validates: Requirements 4.1, 4.2**

- [x] 8. Add sparkle particles to collectible gathering
  - Modify collectible collection logic in game loop
  - Spawn sparkle particles at collectible position when collected
  - Ensure independent effects for rapid collection
  - _Requirements: 5.1, 5.5_

- [x] 8.1 Write property test for collectible sparkle spawning
  - **Property 14: Collectible sparkle spawning**
  - **Validates: Requirements 5.1**

- [x] 8.2 Write property test for independent sparkle effects
  - **Property 17: Independent sparkle effects**
  - **Validates: Requirements 5.5**

- [x] 9. Add confetti effect for new high scores
  - Detect when current score exceeds high score
  - Trigger confetti particle spawn on high score achievement
  - Spawn confetti across full screen width
  - Ensure confetti only triggers once per high score
  - _Requirements: 6.1_

- [x] 9.1 Write property test for high score confetti trigger
  - **Property 18: High score confetti trigger**
  - **Validates: Requirements 6.1**

- [x] 10. Implement particle count limiting for performance
  - Add maximum particle count constant (500)
  - Remove oldest particles when limit is reached
  - Ensure particle array cleanup is efficient
  - _Error Handling: Excessive Particle Count_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
