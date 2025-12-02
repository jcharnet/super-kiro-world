// ===== GAME CONSTANTS =====
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const LEVEL_WIDTH = 4000;
const GRAVITY = 0.5;
const JUMP_POWER = 12;
const MOVE_SPEED = 5;
const FRICTION = 0.85;
const MAX_TIME_WARPS = 3;
const TIME_WARP_HISTORY_SECONDS = 2.5;
const CAMERA_LERP = 0.1;
const MAX_PARTICLES = 500;

// ===== CANVAS SETUP =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'playing'; // 'playing', 'gameOver', 'levelComplete'
let score = 0;
let highScore = 0;
let confettiTriggered = false;
let lives = 3;
let timeWarpsRemaining = MAX_TIME_WARPS;
let levelStartTime = Date.now();
let totalCollectibles = 0;
let screenShake; // Will be initialized after class definitions

// ===== KEYBOARD INPUT =====
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    keys[e.code] = true;
    
    if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'gameOver' || gameState === 'levelComplete') {
            restartGame();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    keys[e.code] = false;
});

// ===== SCORE MANAGER =====
class ScoreManager {
    constructor() {
        this.storageKey = 'superKiroWorld_gameData';
        this.playerName = 'Player';
        this.gameHistory = [];
        this.highScores = {};
        this.loadFromStorage();
    }
    
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                this.playerName = parsed.playerName || 'Player';
                this.gameHistory = parsed.gameHistory || [];
                this.highScores = parsed.highScores || {};
            }
        } catch (error) {
            console.error('Failed to load game data from Local Storage:', error);
            // Initialize with empty data on error
            this.gameHistory = [];
            this.highScores = {};
        }
    }
    
    saveToStorage() {
        try {
            const data = {
                playerName: this.playerName,
                gameHistory: this.gameHistory,
                highScores: this.highScores
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save game data to Local Storage:', error);
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                // Keep only last 100 entries
                this.gameHistory = this.gameHistory.slice(-100);
                try {
                    const data = {
                        playerName: this.playerName,
                        gameHistory: this.gameHistory,
                        highScores: this.highScores
                    };
                    localStorage.setItem(this.storageKey, JSON.stringify(data));
                    console.log('Trimmed game history to fit storage quota');
                } catch (retryError) {
                    console.error('Still failed after trimming history:', retryError);
                }
            }
        }
    }
    
    loadGameHistory() {
        return this.gameHistory;
    }
    
    saveGameSession(session) {
        // Add timestamp if not present
        if (!session.timestamp) {
            session.timestamp = new Date().toISOString();
        }
        
        // Add to history
        this.gameHistory.push(session);
        
        // Update high score for this player
        const playerName = session.player;
        if (!this.highScores[playerName] || session.score > this.highScores[playerName]) {
            this.highScores[playerName] = session.score;
        }
        
        // Save to storage
        this.saveToStorage();
    }
    
    getHighScore(playerName) {
        if (!playerName) {
            playerName = this.playerName;
        }
        return this.highScores[playerName] || 0;
    }
    
    getCurrentPlayerName() {
        return this.playerName;
    }
    
    setPlayerName(name) {
        if (name && name.trim()) {
            this.playerName = name.trim();
            this.saveToStorage();
        }
    }
}

// ===== PARTICLE POOL =====
class ParticlePool {
    constructor(maxSize = 500) {
        this.pool = [];
        this.active = [];
        this.maxSize = maxSize;
        
        // Pre-allocate particles
        for (let i = 0; i < maxSize; i++) {
            this.pool.push(new Particle(0, 0, '#ffffff', 0, 0, 0));
        }
    }
    
    acquire(x, y, color, vx, vy, life, type = 'default', rotation = 0, rotationSpeed = 0) {
        let particle;
        
        if (this.pool.length > 0) {
            // Reuse from pool
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
            // Create new if pool empty
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

// ===== SCREEN SHAKE SYSTEM =====
class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
        this.maxDuration = 0;
    }
    
    trigger(intensity, duration) {
        // Only override if new shake is stronger
        if (intensity > this.intensity) {
            this.intensity = intensity;
            this.duration = duration;
            this.maxDuration = duration;
        }
    }
    
    update() {
        if (this.duration > 0) {
            this.duration -= 1 / 60; // Assuming 60 FPS
            
            // Decay intensity over time
            const progress = this.duration / this.maxDuration;
            this.intensity *= progress;
            
            if (this.duration <= 0) {
                this.intensity = 0;
                this.duration = 0;
            }
        }
    }
    
    getOffset() {
        if (this.intensity <= 0) {
            return { x: 0, y: 0 };
        }
        
        // Use sine wave for smooth shake
        const angle = Math.random() * Math.PI * 2;
        const magnitude = this.intensity;
        
        return {
            x: Math.cos(angle) * magnitude,
            y: Math.sin(angle) * magnitude
        };
    }
}

// Initialize screen shake after class definition
screenShake = new ScreenShake();

// ===== PARTICLE SYSTEM =====
class Particle {
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
            this.vy += 0.3; // Confetti falls with gravity
            this.rotation += this.rotationSpeed;
        } else if (this.type === 'sparkle') {
            this.vy += 0.1; // Sparkles float gently
        } else {
            this.vy += 0.2; // Default gravity
        }
        
        this.life--;
    }
    
    render(ctx, camera) {
        const alpha = this.life / this.maxLife;
        const renderX = this.x - camera.x;
        
        ctx.save();
        
        if (this.type === 'confetti') {
            // Render confetti as rotating rectangles
            ctx.translate(renderX, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fillRect(-3, -6, 6, 12);
        } else if (this.type === 'sparkle') {
            // Render sparkles as stars
            ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(renderX, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add sparkle glow
            ctx.strokeStyle = this.color + Math.floor(alpha * 128).toString(16).padStart(2, '0');
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(renderX - 4, this.y);
            ctx.lineTo(renderX + 4, this.y);
            ctx.moveTo(renderX, this.y - 4);
            ctx.lineTo(renderX, this.y + 4);
            ctx.stroke();
        } else if (this.type === 'trail') {
            // Render trail particles as small circles
            ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(renderX, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'explosion') {
            // Render explosion particles as squares
            ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fillRect(renderX - 2, this.y - 2, 4, 4);
        } else {
            // Default rendering
            ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fillRect(renderX, this.y, 3, 3);
        }
        
        ctx.restore();
    }
}

const particles = [];

// ===== PARTICLE FACTORY =====
class ParticleFactory {
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
            
            // Sparkles have upward and outward velocity
            const vx = Math.cos(angle) * speed;
            // Ensure vy is always negative (upward) by using absolute value
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
            // Spawn across screen width
            const x = Math.random() * 800;
            const y = -20 - Math.random() * 100; // Start above screen
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

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 2;
        particles.push(new Particle(
            x, y, color,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed - 2,
            30 + Math.random() * 20
        ));
    }
}

// ===== PLAYER CLASS =====
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.sprite = new Image();
        this.sprite.src = '/static/kiro-logo.png';
        this.checkpointX = x;
        this.checkpointY = y;
        
        // Enhanced movement physics
        this.acceleration = 0.8;
        this.airAcceleration = 0.4;
        this.maxSpeed = MOVE_SPEED;
        this.groundFriction = 0.85;
        this.airFriction = 0.95;
        this.targetVx = 0;
        
        // Coyote time (grace period for jumping after leaving platform)
        this.coyoteTime = 0.1; // seconds
        this.coyoteTimer = 0;
        this.wasOnGround = false;
        
        // Jump buffering (remember jump input before landing)
        this.jumpBufferTime = 0.1; // seconds
        this.jumpBufferTimer = 0;
        
        // Variable jump height
        this.isJumping = false;
        this.jumpReleaseGravityMultiplier = 1.5;
        
        // Landing detection
        this.justLanded = false;
        this.previousVy = 0;
        
        // Animation state
        this.animationState = 'idle';
        this.idleTimer = 0;
        this.runningTimer = 0;
        
        // Time warp history
        this.history = [];
        this.historyMaxFrames = Math.floor(TIME_WARP_HISTORY_SECONDS * 60);
        this.isRewinding = false;
        this.rewindIndex = 0;
    }
    
    update(platforms) {
        if (this.isRewinding) {
            this.updateRewind();
            return;
        }
        
        // Record history
        this.history.push({
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy
        });
        
        if (this.history.length > this.historyMaxFrames) {
            this.history.shift();
        }
        
        // Horizontal movement with acceleration
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.targetVx = -this.maxSpeed;
        } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.targetVx = this.maxSpeed;
        } else {
            this.targetVx = 0;
        }
        
        // Apply acceleration (different for ground vs air)
        const accel = this.onGround ? this.acceleration : this.airAcceleration;
        const friction = this.onGround ? this.groundFriction : this.airFriction;
        
        if (this.targetVx !== 0) {
            // Accelerate toward target speed
            const diff = this.targetVx - this.vx;
            this.vx += diff * accel;
            
            // Quick turnaround when changing direction
            if (Math.sign(this.targetVx) !== Math.sign(this.vx) && Math.abs(this.vx) > 0.5) {
                this.vx *= 0.7; // Reduce velocity faster when turning
            }
        } else {
            // Apply friction when no input
            this.vx *= friction;
            
            // Stop completely if velocity is very small
            if (Math.abs(this.vx) < 0.1) {
                this.vx = 0;
            }
        }
        
        // Clamp to max speed
        if (Math.abs(this.vx) > this.maxSpeed) {
            this.vx = Math.sign(this.vx) * this.maxSpeed;
        }
        
        // Update coyote time
        if (this.onGround) {
            this.coyoteTimer = this.coyoteTime;
            this.wasOnGround = true;
        } else if (this.wasOnGround) {
            // Just left the ground, start coyote timer
            this.coyoteTimer -= 1 / 60; // Assuming 60 FPS
            if (this.coyoteTimer <= 0) {
                this.wasOnGround = false;
            }
        }
        
        // Update jump buffer timer
        if (this.jumpBufferTimer > 0) {
            this.jumpBufferTimer -= 1 / 60;
        }
        
        // Check for jump input
        const jumpPressed = keys[' '] || keys['ArrowUp'] || keys['w'] || keys['W'];
        
        // Buffer jump input if pressed while in air
        if (jumpPressed && !this.onGround && this.coyoteTimer <= 0) {
            this.jumpBufferTimer = this.jumpBufferTime;
        }
        
        // Execute jump if conditions are met
        const canJump = this.onGround || this.coyoteTimer > 0;
        const shouldJump = (jumpPressed && canJump) || (this.jumpBufferTimer > 0 && this.onGround);
        
        if (shouldJump) {
            this.vy = -JUMP_POWER;
            this.onGround = false;
            this.coyoteTimer = 0; // Reset coyote timer after jumping
            this.wasOnGround = false;
            this.jumpBufferTimer = 0; // Clear jump buffer after executing
            this.isJumping = true; // Mark that we're in a jump
        }
        
        // Track if jump button is released
        if (!jumpPressed && this.isJumping) {
            this.isJumping = false;
        }
        
        // Time Warp activation
        if (keys['e'] || keys['E']) {
            if (timeWarpsRemaining > 0 && !this.isRewinding && this.history.length > 30) {
                this.startRewind();
                keys['e'] = false;
                keys['E'] = false;
            }
        }
        
        // Apply gravity with variable jump height
        let gravityMultiplier = 1;
        
        // Apply stronger gravity when falling or when jump button released early
        if (this.vy > 0) {
            // Falling - apply stronger gravity for snappier feel
            gravityMultiplier = this.jumpReleaseGravityMultiplier;
        } else if (this.vy < 0 && !jumpPressed && !this.isJumping) {
            // Rising but jump button not held - cut jump short
            gravityMultiplier = this.jumpReleaseGravityMultiplier;
        }
        
        this.vy += GRAVITY * gravityMultiplier;
        
        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Generate trail particles during movement
        const velocityMagnitude = Math.sqrt(this.vx ** 2 + this.vy ** 2);
        if (velocityMagnitude > 1 && Math.random() < 0.3) {
            const trailParticle = ParticleFactory.createTrailParticle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            );
            particles.push(trailParticle);
        }
        
        // Collision detection
        this.onGround = false;
        
        for (const platform of platforms) {
            if (this.intersects(platform)) {
                // Vertical collision (landing on top or hitting bottom)
                if (this.vy > 0 && this.y + this.height - this.vy <= platform.y) {
                    // Landing on top
                    const landingSpeed = this.previousVy;
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    
                    // Landing effects (only trigger once per landing)
                    if (!this.justLanded && landingSpeed > 3) {
                        this.justLanded = true;
                        
                        // Scale effects based on fall speed
                        const impactIntensity = Math.min(landingSpeed / 15, 1);
                        const particleCount = Math.floor(8 + impactIntensity * 8);
                        
                        // Spawn landing particles
                        const explosionParticles = ParticleFactory.createExplosionParticles(
                            this.x + this.width / 2,
                            this.y + this.height,
                            particleCount
                        );
                        particles.push(...explosionParticles);
                        
                        // Trigger screen shake based on impact
                        const shakeIntensity = 3 + impactIntensity * 5;
                        screenShake.trigger(shakeIntensity, 0.2);
                    }
                } else if (this.vy < 0 && this.y - this.vy >= platform.y + platform.height) {
                    // Hitting bottom
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                    
                    // Spawn explosion particles on ceiling hit
                    const explosionParticles = ParticleFactory.createExplosionParticles(
                        this.x + this.width / 2,
                        this.y,
                        8
                    );
                    particles.push(...explosionParticles);
                } else {
                    // Horizontal collision
                    if (this.vx > 0) {
                        this.x = platform.x - this.width;
                        
                        // Spawn explosion particles on right wall hit
                        const explosionParticles = ParticleFactory.createExplosionParticles(
                            this.x + this.width,
                            this.y + this.height / 2,
                            8
                        );
                        particles.push(...explosionParticles);
                    } else if (this.vx < 0) {
                        this.x = platform.x + platform.width;
                        
                        // Spawn explosion particles on left wall hit
                        const explosionParticles = ParticleFactory.createExplosionParticles(
                            this.x,
                            this.y + this.height / 2,
                            8
                        );
                        particles.push(...explosionParticles);
                    }
                    this.vx = 0;
                }
            }
        }
        
        // Update animation state
        if (!this.onGround) {
            this.animationState = this.vy < 0 ? 'jumping' : 'falling';
            this.idleTimer = 0;
            this.runningTimer = 0;
        } else if (Math.abs(this.vx) > 0.5) {
            this.animationState = 'running';
            this.idleTimer = 0;
            this.runningTimer += 1 / 60;
            
            // Spawn dust particles while running
            if (Math.random() < 0.15) {
                const dustParticle = ParticleFactory.createTrailParticle(
                    this.x + this.width / 2 + (Math.random() - 0.5) * this.width,
                    this.y + this.height,
                    (Math.random() - 0.5) * 1,
                    -Math.random() * 0.5,
                );
                particles.push(dustParticle);
            }
        } else {
            this.animationState = 'idle';
            this.idleTimer += 1 / 60;
            this.runningTimer = 0;
            
            // Spawn ambient floating particles when idle
            if (this.idleTimer > 1 && Math.random() < 0.02) {
                const floatParticle = ParticleFactory.createTrailParticle(
                    this.x + this.width / 2 + (Math.random() - 0.5) * this.width,
                    this.y + this.height / 2,
                    (Math.random() - 0.5) * 0.5,
                    -Math.random() * 0.3
                );
                particles.push(floatParticle);
            }
        }
        
        // Track velocity for next frame (for landing detection)
        this.previousVy = this.vy;
        
        // Reset landing flag when in air
        if (!this.onGround) {
            this.justLanded = false;
        }
        
        // Death check
        if (this.y > CANVAS_HEIGHT + 100) {
            this.die();
        }
    }
    
    startRewind() {
        this.isRewinding = true;
        this.rewindIndex = this.history.length - 1;
        timeWarpsRemaining--;
        
        // Create time warp particles
        createParticles(this.x + this.width / 2, this.y + this.height / 2, '#790ECB', 20);
    }
    
    updateRewind() {
        if (this.rewindIndex <= 0) {
            this.isRewinding = false;
            return;
        }
        
        // Smoothly interpolate through history (rewind 2 frames per update for speed)
        this.rewindIndex -= 2;
        if (this.rewindIndex < 0) this.rewindIndex = 0;
        
        const state = this.history[this.rewindIndex];
        this.x = state.x;
        this.y = state.y;
        this.vx = state.vx;
        this.vy = state.vy;
        
        // Ghost trail effect
        if (Math.random() < 0.3) {
            particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                '#790ECB',
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                20
            ));
        }
    }
    
    intersects(rect) {
        return this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }
    
    die() {
        lives--;
        screenShake.trigger(12, 0.4); // Stronger shake for damage
        createParticles(this.x + this.width / 2, this.y + this.height / 2, '#ff0000', 15);
        
        if (lives <= 0) {
            gameState = 'gameOver';
        } else {
            this.respawn();
        }
    }
    
    respawn() {
        this.x = this.checkpointX;
        this.y = this.checkpointY;
        this.vx = 0;
        this.vy = 0;
        this.history = [];
    }
    
    render(ctx, camera) {
        const renderX = this.x - camera.x;
        
        // Apply subtle floating animation when idle
        let renderY = this.y;
        if (this.animationState === 'idle' && this.idleTimer > 0.5) {
            renderY += Math.sin(this.idleTimer * 3) * 2;
        }
        
        // Draw sprite or fallback
        if (this.sprite.complete) {
            ctx.drawImage(this.sprite, renderX, renderY, this.width, this.height);
        } else {
            ctx.fillStyle = '#790ECB';
            ctx.fillRect(renderX, renderY, this.width, this.height);
        }
        
        // Rewind indicator
        if (this.isRewinding) {
            ctx.strokeStyle = '#790ECB';
            ctx.lineWidth = 3;
            ctx.strokeRect(renderX - 5, this.y - 5, this.width + 10, this.height + 10);
        }
    }
}

// ===== PLATFORM CLASS =====
class Platform {
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

// ===== COLLECTIBLE CLASS =====
class Collectible {
    constructor(x, y, type = 'metric') {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type;
        this.collected = false;
        this.bobOffset = Math.random() * Math.PI * 2;
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

// ===== DEPLOY GATE CLASS =====
class DeployGate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 100;
    }
    
    render(ctx, camera, frame) {
        const renderX = this.x - camera.x;
        
        // Animated gate
        ctx.fillStyle = '#00ff00' + Math.floor(128 + Math.sin(frame * 0.1) * 127).toString(16).padStart(2, '0');
        ctx.fillRect(renderX, this.y, this.width, this.height);
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(renderX, this.y, this.width, this.height);
        
        // Checkmark
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(renderX + 15, this.y + 50);
        ctx.lineTo(renderX + 25, this.y + 60);
        ctx.lineTo(renderX + 45, this.y + 40);
        ctx.stroke();
    }
}

// ===== CAMERA CLASS =====
class Camera {
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

// ===== LEVEL SETUP =====
const scoreManager = new ScoreManager();
highScore = scoreManager.getHighScore(); // Load high score on initialization
const player = new Player(100, 400);
const camera = new Camera();
const platforms = [];
const collectibles = [];

// Ground and platforms
platforms.push(new Platform(0, 550, 800, 50, 'dashboard'));
platforms.push(new Platform(900, 550, 400, 50, 'pipeline'));
platforms.push(new Platform(1400, 450, 300, 30, 'service'));
platforms.push(new Platform(1800, 350, 250, 30, 'dashboard'));
platforms.push(new Platform(2150, 450, 200, 30, 'pipeline'));
platforms.push(new Platform(2450, 350, 300, 30, 'service'));
platforms.push(new Platform(2850, 450, 250, 30, 'dashboard'));
platforms.push(new Platform(3200, 550, 600, 50, 'pipeline'));

// Collectibles
collectibles.push(new Collectible(400, 480));
collectibles.push(new Collectible(1100, 480));
collectibles.push(new Collectible(1500, 380));
collectibles.push(new Collectible(1900, 280));
collectibles.push(new Collectible(2250, 380));
collectibles.push(new Collectible(2550, 280));
collectibles.push(new Collectible(2950, 380));
collectibles.push(new Collectible(3400, 480));
collectibles.push(new Collectible(3600, 480));

totalCollectibles = collectibles.length;

// Deploy gate
const deployGate = new DeployGate(3700, 450);

// ===== PARALLAX BACKGROUND =====
function renderBackground(ctx, camera, frame) {
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

// ===== HUD =====
function renderHUD(ctx) {
    const leftMargin = 20;
    const lineHeight = 30;
    let yPos = 30;
    
    ctx.font = '20px Courier New';
    
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Score: ${score}`, leftMargin, yPos);
    yPos += lineHeight;
    
    // High score with visual distinction
    ctx.fillStyle = '#790ECB';
    ctx.fillText(`High Score: ${highScore}`, leftMargin, yPos);
    yPos += lineHeight + 10; // Extra spacing before next group
    
    // Lives
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Lives: ${lives}`, leftMargin, yPos);
    yPos += lineHeight;
    
    // Time Warps with icons
    ctx.fillText(`Time Warps: ${timeWarpsRemaining}`, leftMargin, yPos);
    
    // Time warp indicator icons (aligned to the right of the label)
    if (timeWarpsRemaining > 0) {
        ctx.fillStyle = '#790ECB';
        const iconStartX = leftMargin + 150; // Position after "Time Warps: " text
        for (let i = 0; i < timeWarpsRemaining; i++) {
            ctx.fillRect(iconStartX + i * 25, yPos - 15, 20, 20);
        }
    }
}

// ===== GAME OVER / COMPLETE SCREENS =====
function renderGameOver(ctx) {
    ctx.fillStyle = '#00000099';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('SYSTEM OUTAGE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Courier New';
    ctx.fillText('Press R to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.textAlign = 'left';
}

function renderLevelComplete(ctx) {
    const timeTaken = Math.floor((Date.now() - levelStartTime) / 1000);
    
    ctx.fillStyle = '#00000099';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('DEPLOY SUCCESSFUL!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Courier New';
    ctx.fillText(`Time: ${timeTaken}s`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.fillText(`Metrics: ${score} / ${totalCollectibles}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    ctx.fillText(`Lives Remaining: ${lives}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    
    ctx.font = '24px Courier New';
    ctx.fillText('Press R to Replay', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
    
    if (!window.scoreSubmitted) {
        ctx.font = '16px Courier New';
        ctx.fillStyle = '#790ECB';
        ctx.fillText('Score saved to leaderboard!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120);
    }
    
    ctx.textAlign = 'left';
}

// ===== GAME LOOP =====
let frame = 0;

function gameLoop() {
    frame++;
    
    // Update and apply screen shake
    screenShake.update();
    const shakeOffset = screenShake.getOffset();
    
    ctx.save();
    ctx.translate(shakeOffset.x, shakeOffset.y);
    
    if (gameState === 'playing') {
        // Update
        player.update(platforms);
        camera.update(player);
        
        collectibles.forEach(c => {
            c.update(frame);
            if (!c.collected && player.intersects(c)) {
                c.collected = true;
                score++;
                
                // Update high score if current score exceeds it
                const previousHighScore = highScore;
                if (score > highScore) {
                    highScore = score;
                    
                    // Trigger confetti on new high score (only once per game)
                    if (!confettiTriggered && score > previousHighScore) {
                        confettiTriggered = true;
                        const confettiParticles = ParticleFactory.createConfettiParticles(50);
                        particles.push(...confettiParticles);
                    }
                }
                
                // Spawn sparkle particles when collecting
                const sparkleParticles = ParticleFactory.createSparkleParticles(
                    c.x + c.width / 2,
                    c.y + c.height / 2,
                    8
                );
                particles.push(...sparkleParticles);
            }
        });
        
        // Update particles and remove dead ones
        particles.forEach(p => p.update());
        
        // Remove particles with life <= 0
        for (let i = particles.length - 1; i >= 0; i--) {
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        // Limit particle count for performance
        if (particles.length > MAX_PARTICLES) {
            // Remove oldest particles (from the beginning of the array)
            particles.splice(0, particles.length - MAX_PARTICLES);
        }
        
        // Check deploy gate
        if (player.intersects(deployGate)) {
            gameState = 'levelComplete';
            submitScore();
        }
        
        // Render
        renderBackground(ctx, camera, frame);
        
        platforms.forEach(p => p.render(ctx, camera));
        collectibles.forEach(c => c.render(ctx, camera));
        deployGate.render(ctx, camera, frame);
        particles.forEach(p => p.render(ctx, camera));
        player.render(ctx, camera);
        
    } else if (gameState === 'gameOver') {
        renderBackground(ctx, camera, frame);
        platforms.forEach(p => p.render(ctx, camera));
        renderGameOver(ctx);
    } else if (gameState === 'levelComplete') {
        renderBackground(ctx, camera, frame);
        platforms.forEach(p => p.render(ctx, camera));
        collectibles.forEach(c => c.render(ctx, camera));
        deployGate.render(ctx, camera, frame);
        player.render(ctx, camera);
        renderLevelComplete(ctx);
    }
    
    ctx.restore();
    
    // Render HUD after restore so it's not affected by screen shake
    if (gameState === 'playing') {
        renderHUD(ctx);
    }
    
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    gameState = 'playing';
    score = 0;
    highScore = scoreManager.getHighScore(); // Reload high score
    confettiTriggered = false; // Reset confetti flag
    lives = 3;
    timeWarpsRemaining = MAX_TIME_WARPS;
    levelStartTime = Date.now();
    player.x = 100;
    player.y = 400;
    player.vx = 0;
    player.vy = 0;
    player.history = [];
    player.isRewinding = false;
    camera.x = 0;
    collectibles.forEach(c => c.collected = false);
    particles.length = 0;
    window.scoreSubmitted = false;
}

// ===== BACKEND INTEGRATION =====
async function submitScore() {
    if (window.scoreSubmitted) return;
    window.scoreSubmitted = true;
    
    const timeTaken = Math.floor((Date.now() - levelStartTime) / 1000);
    const playerName = scoreManager.getCurrentPlayerName();
    
    // Save to Local Storage via ScoreManager
    const gameSession = {
        player: playerName,
        score: score,
        time: timeTaken,
        lives: lives
    };
    scoreManager.saveGameSession(gameSession);
    
    // Also submit to backend server
    try {
        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player: playerName,
                score: score,
                time: timeTaken,
                lives: lives
            })
        });
        
        if (response.ok) {
            console.log('Score submitted successfully!');
        }
    } catch (error) {
        console.error('Failed to submit score:', error);
    }
}

// ===== GAME INITIALIZATION =====
function startMainGame() {
    // Reset any splash-related keyboard listeners
    gameLoop();
}

// Initialize splash screen, then start game
initSplashScreen(canvas, startMainGame);
