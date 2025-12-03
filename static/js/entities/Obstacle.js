import { CANVAS_HEIGHT } from '../constants.js';
import { Particle } from './Particle.js';

// ===== BASE OBSTACLE CLASS =====
export class Obstacle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
        this.dangerous = false;
    }
    
    update(deltaTime) {
        // Override in subclasses
    }
    
    render(ctx, camera) {
        // Override in subclasses
    }
    
    checkCollision(player) {
        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < this.y + this.height &&
               player.y + player.height > this.y;
    }
    
    applyEffect(player) {
        // Override in subclasses
    }
}

// ===== LASER HAZARD =====
export class LaserHazard extends Obstacle {
    constructor(x, y, direction, cycleTime, warningTime, activeTime) {
        super(x, y, 'laser');
        this.direction = direction; // 'horizontal' or 'vertical'
        this.length = direction === 'horizontal' ? 200 : 150;
        this.width = direction === 'horizontal' ? this.length : 10;
        this.height = direction === 'horizontal' ? 10 : this.length;
        this.cycleTime = cycleTime || 3;
        this.warningTime = warningTime || 1;
        this.activeTime = activeTime || 1;
        this.currentTime = 0;
        this.currentPhase = 'inactive'; // 'inactive', 'warning', 'active'
        this.dangerous = false;
    }
    
    update(deltaTime) {
        const previousPhase = this.currentPhase;
        this.currentTime += deltaTime;
        
        const totalCycle = this.cycleTime;
        const timeInCycle = this.currentTime % totalCycle;
        
        if (timeInCycle < this.warningTime) {
            this.currentPhase = 'warning';
            this.dangerous = false;
            
            // Play warning sound when entering warning phase
            if (previousPhase !== 'warning' && typeof audioManager !== 'undefined') {
                audioManager.playSound('jump'); // Use jump sound as warning beep
            }
        } else if (timeInCycle < this.warningTime + this.activeTime) {
            this.currentPhase = 'active';
            this.dangerous = true;
            
            // Play fire sound when laser activates
            if (previousPhase !== 'active' && typeof audioManager !== 'undefined') {
                audioManager.playSound('damage'); // Use damage sound as laser fire
            }
        } else {
            this.currentPhase = 'inactive';
            this.dangerous = false;
        }
    }
    
    checkCollision(player) {
        if (!this.dangerous) return false;
        
        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < this.y + this.height &&
               player.y + player.height > this.y;
    }
    
    applyEffect(player) {
        if (this.dangerous && !player.invincible) {
            // Mark player as hit - Game.js will handle the death
            player.hitByObstacle = true;
        }
    }
    
    render(ctx, camera) {
        const renderX = this.x - camera.x;
        
        ctx.save();
        
        if (this.currentPhase === 'warning') {
            // Flashing red warning
            const flash = Math.sin(Date.now() / 100) > 0 ? 0.6 : 0.3;
            ctx.fillStyle = `rgba(255, 100, 100, ${flash})`;
            ctx.fillRect(renderX, this.y, this.width, this.height);
            
            // Warning border
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(renderX, this.y, this.width, this.height);
        } else if (this.currentPhase === 'active') {
            // Active laser beam
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(renderX, this.y, this.width, this.height);
            
            // Glow effect
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 15;
            ctx.fillRect(renderX, this.y, this.width, this.height);
            
            // Spawn particles occasionally
            if (Math.random() < 0.3 && window.particles) {
                window.particles.push(new Particle(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    '#ff6666',
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    10,
                    'sparkle'
                ));
            }
        } else {
            // Inactive - show faint outline
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(renderX, this.y, this.width, this.height);
        }
        
        ctx.restore();
    }
}

// ===== SPIKE TRAP =====
export class SpikeTrap extends Obstacle {
    constructor(x, y, orientation) {
        super(x, y, 'spike');
        this.orientation = orientation || 'up'; // 'up', 'down', 'left', 'right'
        this.width = orientation === 'left' || orientation === 'right' ? 20 : 40;
        this.height = orientation === 'up' || orientation === 'down' ? 20 : 40;
        this.dangerous = true;
        this.damage = 1;
        this.knockbackForce = 8;
    }
    
    checkCollision(player) {
        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < this.y + this.height &&
               player.y + player.height > this.y;
    }
    
    applyEffect(player) {
        if (player.invincible) return;
        
        // Apply knockback based on orientation
        switch (this.orientation) {
            case 'up':
                player.vy = -this.knockbackForce;
                break;
            case 'down':
                player.vy = this.knockbackForce;
                break;
            case 'left':
                player.vx = -this.knockbackForce;
                break;
            case 'right':
                player.vx = this.knockbackForce;
                break;
        }
        
        // Apply damage - mark player as hit
        player.hitByObstacle = true;
    }
    
    render(ctx, camera) {
        const renderX = this.x - camera.x;
        
        ctx.save();
        
        // Draw spike base
        ctx.fillStyle = '#666666';
        ctx.fillRect(renderX, this.y, this.width, this.height);
        
        // Draw spikes
        ctx.fillStyle = '#ff4444';
        ctx.strokeStyle = '#cc0000';
        ctx.lineWidth = 1;
        
        const spikeCount = this.orientation === 'up' || this.orientation === 'down' ? 4 : 3;
        const spikeWidth = this.width / spikeCount;
        const spikeHeight = this.height / spikeCount;
        
        for (let i = 0; i < spikeCount; i++) {
            ctx.beginPath();
            
            switch (this.orientation) {
                case 'up':
                    ctx.moveTo(renderX + i * spikeWidth, this.y + this.height);
                    ctx.lineTo(renderX + (i + 0.5) * spikeWidth, this.y);
                    ctx.lineTo(renderX + (i + 1) * spikeWidth, this.y + this.height);
                    break;
                case 'down':
                    ctx.moveTo(renderX + i * spikeWidth, this.y);
                    ctx.lineTo(renderX + (i + 0.5) * spikeWidth, this.y + this.height);
                    ctx.lineTo(renderX + (i + 1) * spikeWidth, this.y);
                    break;
                case 'left':
                    ctx.moveTo(renderX + this.width, this.y + i * spikeHeight);
                    ctx.lineTo(renderX, this.y + (i + 0.5) * spikeHeight);
                    ctx.lineTo(renderX + this.width, this.y + (i + 1) * spikeHeight);
                    break;
                case 'right':
                    ctx.moveTo(renderX, this.y + i * spikeHeight);
                    ctx.lineTo(renderX + this.width, this.y + (i + 0.5) * spikeHeight);
                    ctx.lineTo(renderX, this.y + (i + 1) * spikeHeight);
                    break;
            }
            
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        
        ctx.restore();
    }
}
