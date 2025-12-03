// ===== LEVEL MANAGER =====
export class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.levels = new Map();
        this.transitioning = false;
    }
    
    loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        const config = this.levels.get(levelNumber);
        return config;
    }
    
    completeLevel() {
        this.currentLevel++;
    }
    
    resetLevel() {
        // Reset to current level
    }
    
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    addLevelConfig(levelNumber, config) {
        this.levels.set(levelNumber, config);
    }
}
