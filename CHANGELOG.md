# Changelog

## [2.0.0] - 2024-12-02

### 🎉 Major Refactoring Release

Complete architectural overhaul of the game codebase from monolithic to modular design.

### Added
- **Modular Architecture**: Split 2,718-line monolithic file into 20+ focused modules
- **ES6 Modules**: Full ES6 module support with proper import/export
- **Clear Separation of Concerns**: Organized code into systems, entities, rendering, and levels
- **Improved Testability**: Tests now import actual refactored classes instead of mocks

### Changed
- **Package Version**: Bumped to 2.0.0 to reflect major architectural changes
- **Module System**: Converted from CommonJS to ES modules (`"type": "module"`)
- **Test Suite**: Updated tests to use ES6 imports and real class implementations
- **File Organization**: 
  - Systems: 8 manager classes (Camera, ScoreManager, PowerUpManager, etc.)
  - Entities: 8 entity classes (Player, Platform, Collectible, PowerUp, etc.)
  - Rendering: 2 rendering modules (Background, HUD)
  - Levels: 2 level configuration files

### Fixed
- **Lives System**: Fixed bug where lives weren't decreasing when player falls
- **Laser Collision**: Fixed freeze when player hits laser hazards
- **Obstacle Death Handling**: Proper death handling with correct parameter passing
- **Module Loading**: Fixed splash screen initialization in ES6 module context

### Technical Improvements
- **Maintainability**: Each module has single, clear responsibility
- **Extensibility**: Easy to add new features without touching existing code
- **Readability**: Logical organization makes code easy to navigate
- **Performance**: ES6 modules load once at startup, no runtime overhead

### Testing
- ✅ All 59 property-based tests passing
- ✅ Tests now import real classes (Particle, ScoreManager)
- ✅ No diagnostic errors
- ✅ Full functionality preserved

### Migration Notes
- Original monolithic code backed up to `static/game.js.backup`
- All existing functionality preserved
- No breaking changes to game behavior
- Browser compatibility maintained

### File Structure
```
static/js/
├── constants.js          # Game constants
├── Game.js              # Main game orchestrator
├── entities/            # 8 entity classes
├── systems/             # 8 system managers
├── levels/              # 2 level configurations
└── rendering/           # 2 rendering modules
```

### Metrics
| Metric | v1.0.0 | v2.0.0 | Improvement |
|--------|--------|--------|-------------|
| Lines per file | 2,718 | ~100-200 | 93% reduction |
| Number of files | 1 | 20+ | Better organization |
| Test coverage | 59 tests | 59 tests | Maintained |
| Maintainability | Low | High | ⭐⭐⭐⭐⭐ |

---

## [1.0.0] - Initial Release

Initial monolithic implementation of Super Kiro World platformer game.
