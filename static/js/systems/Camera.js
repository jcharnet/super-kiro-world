import { CANVAS_WIDTH, LEVEL_WIDTH, CAMERA_LERP } from '../constants.js';

// ===== CAMERA CLASS =====
export class Camera {
    constructor() {
        this.x = 0;
        this.targetX = 0;
    }
    
    update(player) {
        // Center camera on player with boundaries
        this.targetX = player.x - CANVAS_WIDTH / 2 + player.width / 2;
        this.targetX = Math.max(0, Math.min(this.targetX, LEVEL_WIDTH - CANVAS_WIDTH));
        
        // Smooth lerp
        this.x += (this.targetX - this.x) * CAMERA_LERP;
    }
}
