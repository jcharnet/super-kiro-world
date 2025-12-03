# Refactoring Implementation Plan

## Phase 1: Setup Module Structure
- [ ] 1. Create directory structure (js/entities, js/systems, js/levels, js/rendering)
- [ ] 2. Create constants.js with all game constants
- [ ] 3. Update HTML to use type="module" for ES6 imports
- [ ] 4. Test that basic module loading works

## Phase 2: Extract System Classes
- [ ] 5. Extract InputManager to js/systems/InputManager.js
- [ ] 6. Extract Camera to js/systems/Camera.js  
- [ ] 7. Extract ScreenShake to js/systems/ScreenShake.js
- [ ] 8. Extract ScoreManager to js/systems/ScoreManager.js
- [ ] 9. Extract PowerUpManager to js/systems/PowerUpManager.js
- [ ] 10. Extract ObstacleManager to js/systems/ObstacleManager.js
- [ ] 11. Extract LevelManager to js/systems/LevelManager.js

## Phase 3: Extract Entity Classes
- [ ] 12. Extract Particle classes to js/entities/Particle.js
- [ ] 13. Extract Platform classes to js/entities/Platform.js
- [ ] 14. Extract Player to js/entities/Player.js
- [ ] 15. Extract Collectible to js/entities/Collectible.js
- [ ] 16. Extract PowerUp to js/entities/PowerUp.js
- [ ] 17. Extract Obstacle classes to js/entities/Obstacle.js
- [ ] 18. Extract Checkpoint to js/entities/Checkpoint.js
- [ ] 19. Extract DeployGate to js/entities/DeployGate.js

## Phase 4: Extract Rendering
- [ ] 20. Extract rendering functions to js/rendering/Renderer.js
- [ ] 21. Extract HUD rendering to js/rendering/HUD.js
- [ ] 22. Extract background rendering to js/rendering/Background.js

## Phase 5: Extract Level Configurations
- [ ] 23. Extract Level 1 setup to js/levels/Level1.js
- [ ] 24. Extract Level 2 setup to js/levels/Level2.js

## Phase 6: Create Main Game Module
- [ ] 25. Create js/Game.js as main game class
- [ ] 26. Update game.js to be minimal entry point
- [ ] 27. Ensure all imports/exports are correct

## Phase 7: Testing & Validation
- [ ] 28. Run all tests and ensure 59 tests pass
- [ ] 29. Test game functionality manually
- [ ] 30. Fix any import/export issues
- [ ] 31. Verify performance is maintained
