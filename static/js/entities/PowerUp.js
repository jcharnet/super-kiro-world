// ===== POWER-UP ENTITY =====
export class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type; // 'speed', 'invincibility', 'doubleJump', 'slowMotion'
        this.collected = false;
        this.respawnTimer = 0;
        this.respawnDuration = 10; // seconds
        this.glowIntensity = 0.5;
        this.floatOffset = 0;
        this.floatSpeed = 2;
        this.originalY = y;
    }
    
    update(deltaTime, player) {
        if (this.collected) {
            // Update respawn timer
            this.respawnTimer += deltaTime;
            if (this.respawnTimer >= this.respawnDuration) {
                this.collected = false;
                this.respawnTimer = 0;
            }
            return;
        }
        
        // Floating animation
        this.floatOffset = Math.sin(Date.now() / 1000 * this.floatSpeed) * 10;
        
        // Glow effect based on proximity to player
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            this.glowIntensity = 0.8 + Math.sin(Date.now() / 100) * 0.2;
        } else {
            this.glowIntensity = 0.5 + Math.sin(Date.now() / 200) * 0.1;
        }
        
        // Check collision with player
        if (this.isColliding(player)) {
            this.collect(player);
        }
    }
    
    isColliding(player) {
        const currentY = this.originalY + this.floatOffset;
        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < currentY + this.height &&
               player.y + player.height > currentY;
    }
    
    collect(player) {
        this.collected = true;
        this.respawnTimer = 0;
        
        // Trigger power-up effect through PowerUpManager
        if (window.powerUpManager) {
            window.powerUpManager.activatePowerUp(this.type, player);
        }
        
        // Play collection sound
        if (window.audioManager) {
            audioManager.playSound('collect');
        }
        
        // Spawn collection particles
        if (window.particlePool) {
            const color = this.getColor();
            for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 * i) / 12;
                const speed = 2 + Math.random() * 2;
                particlePool.acquire(
                    this.x + this.width / 2,
                    this.originalY + this.floatOffset + this.height / 2,
                    color,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    30,
                    'sparkle'
                );
            }
        }
    }
    
    render(ctx, camera) {
        if (this.collected) {
            // Show respawn countdown
            const timeLeft = Math.ceil(this.respawnDuration - this.respawnTimer);
            if (timeLeft > 0) {
                ctx.save();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(timeLeft, this.x + this.width / 2 - camera.x, this.originalY + this.height / 2);
                ctx.restore();
            }
            return;
        }
        
        const renderX = this.x - camera.x;
        const renderY = this.originalY + this.floatOffset;
        
        ctx.save();
        
        // Draw glow effect
        const gradient = ctx.createRadialGradient(
            renderX + this.width / 2, renderY + this.height / 2, 0,
            renderX + this.width / 2, renderY + this.height / 2, this.width
        );
        const color = this.getColor();
        gradient.addColorStop(0, color + Math.floor(this.glowIntensity * 100).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, color + '00');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(renderX - 10, renderY - 10, this.width + 20, this.height + 20);
        
        // Draw power-up icon
        ctx.fillStyle = color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        switch (this.type) {
            case 'speed':
                // Lightning bolt
                ctx.beginPath();
                ctx.moveTo(renderX + this.width / 2, renderY + 5);
                ctx.lineTo(renderX + this.width / 2 - 5, renderY + this.height / 2);
                ctx.lineTo(renderX + this.width / 2 + 2, renderY + this.height / 2);
                ctx.lineTo(renderX + this.width / 2 - 3, renderY + this.height - 5);
                ctx.lineTo(renderX + this.width / 2 + 5, renderY + this.height / 2 - 2);
                ctx.lineTo(renderX + this.width / 2 - 2, renderY + this.height / 2 - 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'invincibility':
                // Shield
                ctx.beginPath();
                ctx.moveTo(renderX + this.width / 2, renderY + 5);
                ctx.lineTo(renderX + this.width - 5, renderY + 10);
                ctx.lineTo(renderX + this.width - 5, renderY + this.height - 10);
                ctx.lineTo(renderX + this.width / 2, renderY + this.height - 5);
                ctx.lineTo(renderX + 5, renderY + this.height - 10);
                ctx.lineTo(renderX + 5, renderY + 10);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'doubleJump':
                // Double arrow up
                ctx.beginPath();
                ctx.moveTo(renderX + this.width / 2, renderY + 8);
                ctx.lineTo(renderX + this.width / 2 - 6, renderY + 14);
                ctx.lineTo(renderX + this.width / 2 + 6, renderY + 14);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(renderX + this.width / 2, renderY + 16);
                ctx.lineTo(renderX + this.width / 2 - 6, renderY + 22);
                ctx.lineTo(renderX + this.width / 2 + 6, renderY + 22);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'slowMotion':
                // Clock
                ctx.beginPath();
                ctx.arc(renderX + this.width / 2, renderY + this.height / 2, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                
                // Clock hands
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(renderX + this.width / 2, renderY + this.height / 2);
                ctx.lineTo(renderX + this.width / 2, renderY + this.height / 2 - 6);
                ctx.moveTo(renderX + this.width / 2, renderY + this.height / 2);
                ctx.lineTo(renderX + this.width / 2 + 4, renderY + this.height / 2);
                ctx.stroke();
                break;
        }
        
        ctx.restore();
    }
    
    getColor() {
        switch (this.type) {
            case 'speed': return '#ffd93d'; // Yellow
            case 'invincibility': return '#4ecdc4'; // Blue
            case 'doubleJump': return '#95e1d3'; // Light blue
            case 'slowMotion': return '#ff6b6b'; // Red
            default: return '#ffffff';
        }
    }
}
