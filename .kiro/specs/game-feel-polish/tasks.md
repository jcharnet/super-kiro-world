# Implementation Plan

- [x] 1. Implement enhanced movement physics with acceleration
  - Add acceleration and friction properties to Player class
  - Replace instant velocity changes with gradual acceleration
  - Implement separate ground and air acceleration values
  - Add quick turnaround when changing direction
  - Test movement feels responsive and smooth
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Add coyote time for forgiving jumps
  - Add coyote time timer to Player class
  - Start timer when player leaves platform
  - Allow jump if timer hasn't expired
  - Reset timer on landing or successful jump
  - Test jump timing feels forgiving
  - _Requirements: 2.1_

- [x] 3. Implement jump buffering system
  - Add jump buffer timer to Player class
  - Store jump input when pressed in air
  - Execute buffered jump immediately on landing
  - Clear buffer after execution or timeout
  - Test jump inputs feel responsive
  - _Requirements: 2.2_

- [x] 4. Add variable jump height control
  - Track whether jump button is held
  - Apply normal gravity when button held
  - Apply increased gravity when button released early
  - Adjust jump feel based on hold duration
  - Test jump height control feels natural
  - _Requirements: 2.3, 2.4, 2.5_

- [x] 5. Create ScreenShake class for impact feedback
  - Implement ScreenShake class with intensity and duration
  - Add trigger method for different shake types
  - Calculate shake offset using sine wave or noise
  - Apply shake to camera transform
  - Test screen shake adds satisfying impact
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Add landing particles and effects
  - Spawn particles when player lands on platform
  - Trigger screen shake on landing
  - Add dust cloud effect on ground impact
  - Scale effect intensity based on fall speed
  - Test landing feels impactful
  - _Requirements: 3.1_

- [x] 7. Implement idle and running animations
  - Add animation state tracking to Player
  - Create subtle floating animation for idle state
  - Spawn dust particles while running
  - Transition smoothly between animation states
  - Test animations add life to character
  - _Requirements: 3.4, 3.5_

- [x] 8. Create ParticlePool for performance
  - Implement ParticlePool class with acquire/release methods
  - Pre-allocate particle objects in pool
  - Reuse particles instead of creating new ones
  - Track active and inactive particles separately
  - Test particle system has no per-frame allocations
  - _Requirements: 4.1_

- [x] 9. Implement viewport culling for rendering
  - Calculate camera viewport bounds
  - Check if objects are within viewport before rendering
  - Skip rendering for off-screen platforms and collectibles
  - Test rendering performance improves for large levels
  - _Requirements: 4.2_

- [x] 10. Optimize particle update and cleanup
  - Batch particle updates for efficiency
  - Use single loop for update and cleanup
  - Remove dead particles without creating garbage
  - Limit particle count with pool recycling
  - Test particle system maintains 60 FPS
  - _Requirements: 4.3, 4.4_

- [x] 11. Add camera look-ahead system
  - Calculate look-ahead offset based on player direction
  - Smooth look-ahead changes with lerp
  - Add vertical offset to show more above player
  - Implement camera deadzone for stability
  - Test camera shows upcoming obstacles clearly
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 12. Improve collectible visual feedback
  - Add pulsing glow effect to collectibles
  - Increase glow when player is nearby
  - Add subtle attraction effect toward player
  - Enhance collection particle burst
  - Test collectibles feel rewarding to gather
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 13. Final polish and tuning pass
  - Playtest all movement changes
  - Adjust acceleration and friction values
  - Fine-tune jump timing and height
  - Balance visual effect intensities
  - Verify 60 FPS performance maintained
  - _Requirements: All_

- [x] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
