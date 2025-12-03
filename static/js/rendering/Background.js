import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

// ===== PARALLAX BACKGROUND =====
export function renderBackground(ctx, camera, frame) {
    // Dark gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Cloud shapes (parallax)
    ctx.fillStyle = '#16213e44';
    for (let i = 0; i < 5; i++) {
        const x = (i * 600 - camera.x * 0.3) % (CANVAS_WIDTH + 200) - 100;
        const y = 100 + i * 80;
        ctx.fillRect(x, y, 150, 60);
        ctx.fillRect(x + 30, y - 20, 90, 60);
    }
    
    // Grid floor
    ctx.strokeStyle = '#790ECB22';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, CANVAS_HEIGHT - 100);
        ctx.lineTo(i, CANVAS_HEIGHT);
        ctx.stroke();
    }
}
