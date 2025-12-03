// ===== OBSTACLE MANAGER =====
export class ObstacleManager {
    constructor() {
        this.obstacles = [];
    }
    
    addObstacle(obstacle) {
        this.obstacles.push(obstacle);
    }
    
    updateAll(deltaTime) {
        for (const obstacle of this.obstacles) {
            if (obstacle.update) {
                obstacle.update(deltaTime);
            }
        }
    }
    
    renderAll(ctx, camera) {
        for (const obstacle of this.obstacles) {
            if (obstacle.render) {
                obstacle.render(ctx, camera);
            }
        }
    }
    
    checkCollisions(player) {
        for (const obstacle of this.obstacles) {
            if (obstacle.checkCollision && obstacle.checkCollision(player)) {
                if (obstacle.applyEffect) {
                    obstacle.applyEffect(player);
                }
            }
        }
    }
}
