# Next Session: Complete Modularization

## Current State
- Branch: `refactor/full-modularization`
- Status: Modularization in progress
- Completed: Particle system extracted to `js/entities/Particle.js`

## What's Done ✅
1. HTML updated to support ES6 modules (`type="module"`)
2. Module structure created:
   - `js/constants.js` - Game constants
   - `js/entities/` - Game entities
   - `js/systems/` - Game systems
   - `js/levels/` - Level configurations
   - `js/rendering/` - Rendering functions
3. Sample modules created:
   - `js/systems/Camera.js`
   - `js/systems/InputManager.js`
   - `js/systems/ScoreManager.js`
   - `js/systems/ScreenShake.js`
   - `js/entities/Particle.js` ✅ (Complete with ParticlePool, ParticleFactory)

## Next Steps 🎯

### 1. Extract Remaining Systems (~15 min)
- [ ] PowerUpManager → `js/systems/PowerUpManager.js`
- [ ] ObstacleManager → `js/systems/ObstacleManager.js`
- [ ] LevelManager → `js/systems/LevelManager.js`

### 2. Extract Entities (~20 min)
- [ ] Player → `js/entities/Player.js`
- [ ] Platform & MovingPlatform → `js/entities/Platform.js`
- [ ] Collectible → `js/entities/Collectible.js`
- [ ] PowerUp → `js/entities/PowerUp.js`
- [ ] Obstacle classes → `js/entities/Obstacle.js`
  - Obstacle (base)
  - LaserHazard
  - SpikeTrap
  - FallingPlatform
- [ ] Checkpoint → `js/entities/Checkpoint.js`
- [ ] DeployGate → `js/entities/DeployGate.js`

### 3. Extract Rendering (~10 min)
- [ ] All render functions → `js/rendering/Renderer.js`
- [ ] HUD → `js/rendering/HUD.js`
- [ ] Background → `js/rendering/Background.js`

### 4. Extract Levels (~10 min)
- [ ] Level 1 setup → `js/levels/Level1.js`
- [ ] Level 2 setup → `js/levels/Level2.js`

### 5. Update game.js (~15 min)
- [ ] Add all imports at top
- [ ] Remove extracted code
- [ ] Keep only game loop and initialization
- [ ] Ensure all references work

### 6. Test & Debug (~20 min)
- [ ] Run `npm test` - ensure all 59 tests pass
- [ ] Test game manually
- [ ] Fix any import/export issues
- [ ] Verify performance

## Estimated Total Time
~90 minutes of focused work

## Pattern to Follow

Each module should:
1. Import dependencies from other modules
2. Export classes/functions
3. Follow this template:

```javascript
// Import dependencies
import { CONSTANT } from '../constants.js';
import { OtherClass } from './OtherClass.js';

// Class definition
export class MyClass {
    // ... class code ...
}
```

## Testing Strategy
After each major extraction:
1. Run `npm test`
2. Check for import errors in browser console
3. Test game functionality

## Rollback Plan
If issues arise:
```bash
git checkout main
# Or
git reset --hard v1.0.0
```

## Success Criteria
- ✅ All 59 tests passing
- ✅ Game runs without errors
- ✅ All classes in separate files
- ✅ game.js < 500 lines
- ✅ Clear module structure

## Notes
- The Particle.js extraction is a perfect template
- Each class is already well-isolated
- Main challenge is managing imports/exports
- Take it one module at a time
