// ===== CHECKPOINT CLASS =====
export class Checkpoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.activated = false;
    }
    
    activate() {
        if (!this.activated) {
            this.activated = true;
            // Spawn activation particles
            if (window.particles && window.ParticleFactory) {
                const sparkles = window.ParticleFactory.createSparkleParticles(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    12
                );
                window.particles.push(...sparkles);
            }
            // Play sound
            if (window.audioManager) {
                audioManager.playSound('collect');
            }
        }
    }
    
    checkCollision(player) {
        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < this.y + this.height &&
               player.y + player.height > this.y;
    }
    
    isActivated() {
        return this.activated;
    }
    
    render(ctx, camera) {
        const renderX = this.x - camera.x;
        
        ctx.save();
        
        if (this.activated) {
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
        } else {
            ctx.fillStyle = '#888888';
        }
        
        // Flag pole
        ctx.fillRect(renderX + this.width / 2 - 2, this.y, 4, this.height);
        
        // Flag
        ctx.beginPath();
        ctx.moveTo(renderX + this.width / 2, this.y + 10);
        ctx.lineTo(renderX + this.width / 2 + 20, this.y + 20);
        ctx.lineTo(renderX + this.width / 2, this.y + 30);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}
