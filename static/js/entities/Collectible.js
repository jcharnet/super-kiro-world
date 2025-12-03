// ===== COLLECTIBLE CLASS =====
export class Collectible {
    constructor(x, y, type = 'metric') {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type;
        this.collected = false;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.renderY = y;
    }
    
    update(frame) {
        // Bobbing animation
        this.renderY = this.y + Math.sin(frame * 0.1 + this.bobOffset) * 5;
    }
    
    render(ctx, camera) {
        if (this.collected) return;
        
        const renderX = this.x - camera.x;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(
            renderX + this.width / 2, this.renderY + this.height / 2, 0,
            renderX + this.width / 2, this.renderY + this.height / 2, this.width
        );
        
        if (this.type === 'metric') {
            gradient.addColorStop(0, '#790ECB');
            gradient.addColorStop(1, '#790ECB00');
        } else {
            gradient.addColorStop(0, '#00ffff');
            gradient.addColorStop(1, '#00ffff00');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(renderX - 10, this.renderY - 10, this.width + 20, this.height + 20);
        
        // Core
        ctx.fillStyle = this.type === 'metric' ? '#790ECB' : '#00ffff';
        ctx.beginPath();
        ctx.arc(renderX + this.width / 2, this.renderY + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
