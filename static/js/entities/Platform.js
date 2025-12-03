import { CANVAS_HEIGHT, GRAVITY } from '../constants.js';

// ===== PLATFORM CLASS =====
export class Platform {
    constructor(x, y, width, height, type = 'dashboard') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }
    
    render(ctx, camera) {
        const renderX = this.x - camera.x;
        
        // Platform styling based on type
        const colors = {
            dashboard: '#1a1a2e',
            pipeline: '#16213e',
            service: '#0f3460'
        };
        
        ctx.fillStyle = colors[this.type] || colors.dashboard;
        ctx.fillRect(renderX, this.y, this.width, this.height);
        
        // Border
        ctx.strokeStyle = '#790ECB';
        ctx.lineWidth = 2;
        ctx.strokeRect(renderX, this.y, this.width, this.height);
        
        // Grid pattern
        ctx.strokeStyle = '#790ECB33';
        ctx.lineWidth = 1;
        for (let i = 10; i < this.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(renderX + i, this.y);
            ctx.lineTo(renderX + i, this.y + this.height);
            ctx.stroke();
        }
    }
}

// ===== MOVING PLATFORM CLASS =====
export class MovingPlatform {
    constructor(x, y, width, height, path, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.path = path; // Array of {x, y} waypoints
        this.speed = speed;
        this.currentPathIndex = 0;
        this.direction = 1; // 1 for forward, -1 for reverse
        this.velocity = { x: 0, y: 0 };
        this.dangerous = false;
        this.type = 'movingPlatform';
        
        // Calculate initial velocity
        if (path && path.length > 1) {
            this.updateVelocity();
        }
    }
    
    update(deltaTime) {
        if (!this.path || this.path.length < 2) return;
        
        // Move toward current target
        this.x += this.velocity.x * deltaTime * 60;
        this.y += this.velocity.y * deltaTime * 60;
        
        // Check if reached current waypoint
        const target = this.path[this.currentPathIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.speed) {
            // Reached waypoint, move to next
            if (this.direction === 1) {
                this.currentPathIndex++;
                if (this.currentPathIndex >= this.path.length) {
                    // Reached end, reverse
                    this.currentPathIndex = this.path.length - 2;
                    this.direction = -1;
                }
            } else {
                this.currentPathIndex--;
                if (this.currentPathIndex < 0) {
                    // Reached start, go forward
                    this.currentPathIndex = 1;
                    this.direction = 1;
                }
            }
            
            this.updateVelocity();
        }
    }
    
    updateVelocity() {
        const target = this.path[this.currentPathIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.velocity.x = (dx / distance) * this.speed;
            this.velocity.y = (dy / distance) * this.speed;
        }
    }
    
    applyVelocityToPlayer(player) {
        // Apply platform velocity to player when standing on it
        player.x += this.velocity.x * (1/60) * 60;
    }
    
    render(ctx, camera) {
        const renderX = this.x - camera.x;
        
        ctx.save();
        
        // Platform
        ctx.fillStyle = '#2a2a4e';
        ctx.fillRect(renderX, this.y, this.width, this.height);
        
        // Border
        ctx.strokeStyle = '#4a4a8e';
        ctx.lineWidth = 2;
        ctx.strokeRect(renderX, this.y, this.width, this.height);
        
        // Motion trail effect
        if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
            ctx.fillStyle = 'rgba(74, 74, 142, 0.3)';
            ctx.fillRect(
                renderX - this.velocity.x * 2,
                this.y - this.velocity.y * 2,
                this.width,
                this.height
            );
        }
        
        ctx.restore();
    }
}

// ===== FALLING PLATFORM CLASS =====
export class FallingPlatform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.fallDelay = 0.5;
        this.fallTimer = 0;
        this.falling = false;
        this.fallSpeed = 0;
        this.respawnTime = 5;
        this.respawnTimer = 0;
        this.originalY = y;
        this.playerOnPlatform = false;
        this.dangerous = false;
        this.type = 'fallingPlatform';
    }
    
    update(deltaTime) {
        if (this.falling) {
            // Accelerate downward
            this.fallSpeed += GRAVITY * 2;
            this.y += this.fallSpeed;
            
            // Check if off-screen
            if (this.y > CANVAS_HEIGHT + 100) {
                this.falling = false;
                this.respawnTimer = 0;
            }
        } else if (this.y > this.originalY) {
            // Respawning
            this.respawnTimer += deltaTime;
            if (this.respawnTimer >= this.respawnTime) {
                this.y = this.originalY;
                this.fallSpeed = 0;
                this.fallTimer = 0;
                this.respawnTimer = 0;
            }
        } else if (this.playerOnPlatform && !this.falling) {
            // Player on platform, start fall timer
            this.fallTimer += deltaTime;
            if (this.fallTimer >= this.fallDelay) {
                this.falling = true;
            }
        }
        
        // Reset player on platform flag (will be set by collision detection)
        this.playerOnPlatform = false;
    }
    
    startFallTimer() {
        if (!this.falling && this.y === this.originalY) {
            this.playerOnPlatform = true;
        }
    }
    
    cancelFallTimer() {
        if (!this.falling) {
            this.fallTimer = 0;
            this.playerOnPlatform = false;
        }
    }
    
    render(ctx, camera) {
        if (this.y > CANVAS_HEIGHT) return; // Don't render if off-screen
        
        const renderX = this.x - camera.x;
        
        ctx.save();
        
        // Platform color based on state
        let alpha = 1.0;
        if (this.fallTimer > 0 && !this.falling) {
            // Crumbling - flash and fade
            alpha = 1.0 - (this.fallTimer / this.fallDelay) * 0.5;
            if (Math.sin(Date.now() / 100) > 0) {
                alpha *= 0.7;
            }
        } else if (this.y > this.originalY) {
            // Respawning - fade in
            alpha = Math.min(this.respawnTimer / this.respawnTime, 1.0);
        }
        
        ctx.fillStyle = `rgba(100, 100, 120, ${alpha})`;
        ctx.fillRect(renderX, this.y, this.width, this.height);
        
        // Border
        ctx.strokeStyle = `rgba(150, 150, 170, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(renderX, this.y, this.width, this.height);
        
        // Cracks if about to fall
        if (this.fallTimer > 0 && !this.falling) {
            ctx.strokeStyle = `rgba(200, 100, 100, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(renderX + this.width * 0.3, this.y);
            ctx.lineTo(renderX + this.width * 0.3, this.y + this.height);
            ctx.moveTo(renderX + this.width * 0.7, this.y);
            ctx.lineTo(renderX + this.width * 0.7, this.y + this.height);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}
