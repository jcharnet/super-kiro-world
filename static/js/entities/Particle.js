// ===== PARTICLE SYSTEM =====
export class Particle {
    constructor(x, y, color, vx, vy, life, type = 'default', rotation = 0, rotationSpeed = 0) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.type = type;
        this.rotation = rotation;
        this.rotationSpeed = rotationSpeed;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Apply gravity based on particle type
        if (this.type === 'confetti') {
            this.vy += 0.3;
            this.rotation += this.rotationSpeed;
        } else if (this.type === 'sparkle') {
            this.vy += 0.1;
        } else {
            this.vy += 0.2;
        }
        
        this.life--;
    }
    
    render(ctx, camera) {
        const alpha = this.life / this.maxLife;
        const renderX = this.x - camera.x;
        
        ctx.save();
        
        if (this.type === 'confetti') {
            ctx.translate(renderX, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fillRect(-3, -6, 6, 12);
        } else if (this.type === 'sparkle') {
            ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(renderX, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = this.color + Math.floor(alpha * 128).toString(16).padStart(2, '0');
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(renderX - 4, this.y);
            ctx.lineTo(renderX + 4, this.y);
            ctx.moveTo(renderX, this.y - 4);
            ctx.lineTo(renderX, this.y + 4);
            ctx.stroke();
        } else if (this.type === 'trail') {
            ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(renderX, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'explosion') {
            ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fillRect(renderX - 2, this.y - 2, 4, 4);
        } else {
            ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fillRect(renderX, this.y, 3, 3);
        }
        
        ctx.restore();
    }
}

export class ParticlePool {
    constructor(maxSize = 500) {
        this.pool = [];
        this.active = [];
        this.maxSize = maxSize;
        
        for (let i = 0; i < maxSize; i++) {
            this.pool.push(new Particle(0, 0, '#ffffff', 0, 0, 0));
        }
    }
    
    acquire(x, y, color, vx, vy, life, type = 'default', rotation = 0, rotationSpeed = 0) {
        let particle;
        
        if (this.pool.length > 0) {
            particle = this.pool.pop();
            particle.x = x;
            particle.y = y;
            particle.color = color;
            particle.vx = vx;
            particle.vy = vy;
            particle.life = life;
            particle.maxLife = life;
            particle.type = type;
            particle.rotation = rotation;
            particle.rotationSpeed = rotationSpeed;
        } else {
            particle = new Particle(x, y, color, vx, vy, life, type, rotation, rotationSpeed);
        }
        
        this.active.push(particle);
        return particle;
    }
    
    release(particle) {
        const index = this.active.indexOf(particle);
        if (index > -1) {
            this.active.splice(index, 1);
            if (this.pool.length < this.maxSize) {
                this.pool.push(particle);
            }
        }
    }
    
    update() {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const particle = this.active[i];
            particle.update();
            
            if (particle.life <= 0) {
                this.release(particle);
            }
        }
    }
    
    render(ctx, camera) {
        for (const particle of this.active) {
            particle.render(ctx, camera);
        }
    }
    
    clear() {
        while (this.active.length > 0) {
            this.release(this.active[0]);
        }
    }
}

export class ParticleFactory {
    static createTrailParticle(x, y, vx, vy) {
        const life = 15;
        return new Particle(x, y, '#790ECB', vx, vy, life, 'trail');
    }
    
    static createExplosionParticles(x, y, count = 12) {
        const explosionParticles = [];
        const colors = ['#ff6b6b', '#ffd93d', '#ff8c42'];
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 3 + Math.random() * 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const life = 25;
            
            explosionParticles.push(new Particle(
                x, y, color,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                life,
                'explosion'
            ));
        }
        
        return explosionParticles;
    }
    
    static createSparkleParticles(x, y, count = 8) {
        const sparkleParticles = [];
        const colors = ['#ffffff', '#ffff00', '#790ECB'];
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 1 + Math.random() * 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const life = 30;
            
            const vx = Math.cos(angle) * speed;
            const vy = -(Math.abs(Math.sin(angle) * speed) + 1);
            
            sparkleParticles.push(new Particle(
                x, y, color,
                vx, vy,
                life,
                'sparkle'
            ));
        }
        
        return sparkleParticles;
    }
    
    static createConfettiParticles(count = 50) {
        const confettiParticles = [];
        const colors = ['#790ECB', '#ff6b6b', '#4ecdc4', '#ffd93d', '#95e1d3'];
        
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 800;
            const y = -20 - Math.random() * 100;
            const vx = (Math.random() - 0.5) * 4;
            const vy = Math.random() * 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const life = 120;
            const rotation = Math.random() * Math.PI * 2;
            const rotationSpeed = (Math.random() - 0.5) * 0.2;
            
            confettiParticles.push(new Particle(
                x, y, color,
                vx, vy,
                life,
                'confetti',
                rotation,
                rotationSpeed
            ));
        }
        
        return confettiParticles;
    }
}
