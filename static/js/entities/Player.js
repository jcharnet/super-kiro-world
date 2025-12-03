import { CANVAS_HEIGHT, GRAVITY, JUMP_POWER, MOVE_SPEED, TIME_WARP_HISTORY_SECONDS } from '../constants.js';
import { ParticleFactory, Particle } from './Particle.js';

// ===== PLAYER CLASS =====
export class Player {
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
        
        // Power-up properties
        this.speedMultiplier = 1.0;
        this.invincible = false;
        this.hasDoubleJump = false;
        this.doubleJumpAvailable = false;
        this.wasJumpPressed = false;
        
        // Moving platform tracking
        this.lastPlatform = null;
    }
    
    update(platforms, keys, particles, screenShake, timeWarpsRemaining, createParticles) {
        if (this.isRewinding) {
            this.updateRewind(particles);
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
        const effectiveMaxSpeed = this.maxSpeed * this.speedMultiplier;
        
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.targetVx = -effectiveMaxSpeed;
        } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.targetVx = effectiveMaxSpeed;
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
        if (Math.abs(this.vx) > effectiveMaxSpeed) {
            this.vx = Math.sign(this.vx) * effectiveMaxSpeed;
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
        const canDoubleJump = this.hasDoubleJump && this.doubleJumpAvailable && !this.onGround && this.coyoteTimer <= 0;
        const shouldJump = (jumpPressed && canJump) || (this.jumpBufferTimer > 0 && this.onGround);
        const shouldDoubleJump = jumpPressed && canDoubleJump && !this.wasJumpPressed;
        
        if (shouldJump) {
            this.vy = -JUMP_POWER;
            this.onGround = false;
            this.coyoteTimer = 0;
            this.wasOnGround = false;
            this.jumpBufferTimer = 0;
            this.isJumping = true;
            
            // Transfer momentum from moving platform
            if (this.lastPlatform && this.lastPlatform.velocity) {
                // Add a portion of the platform's horizontal velocity to player
                this.vx += this.lastPlatform.velocity.x * 0.5;
            }
            
            // Play jump sound
            if (typeof audioManager !== 'undefined') {
                audioManager.playSound('jump');
            }
        } else if (shouldDoubleJump) {
            // Double jump
            this.vy = -JUMP_POWER;
            this.doubleJumpAvailable = false;
            this.isJumping = true;
            
            // Spawn double jump particles
            const sparkleParticles = ParticleFactory.createSparkleParticles(
                this.x + this.width / 2,
                this.y + this.height / 2,
                12
            );
            particles.push(...sparkleParticles);
            
            // Play jump sound
            if (typeof audioManager !== 'undefined') {
                audioManager.playSound('jump');
            }
        }
        
        // Track jump button state for double jump
        this.wasJumpPressed = jumpPressed;
        
        // Track if jump button is released
        if (!jumpPressed && this.isJumping) {
            this.isJumping = false;
        }
        
        // Time Warp activation
        if (keys['e'] || keys['E']) {
            if (timeWarpsRemaining > 0 && !this.isRewinding && this.history.length > 30) {
                this.startRewind(createParticles);
                keys['e'] = false;
                keys['E'] = false;
                return timeWarpsRemaining - 1;
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
        let standingOnMovingPlatform = null;
        
        for (const platform of platforms) {
            if (this.intersects(platform)) {
                // Vertical collision (landing on top or hitting bottom)
                if (this.vy > 0 && this.y + this.height - this.vy <= platform.y) {
                    // Landing on top
                    const landingSpeed = this.previousVy;
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    
                    // Track if standing on moving platform
                    if (platform.velocity && (platform.velocity.x !== 0 || platform.velocity.y !== 0)) {
                        standingOnMovingPlatform = platform;
                    }
                    
                    // Reset double jump on landing
                    if (this.hasDoubleJump) {
                        this.doubleJumpAvailable = true;
                    }
                    
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
                        
                        // Play landing sound
                        if (typeof audioManager !== 'undefined') {
                            audioManager.playSound('land');
                        }
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
        
        // Apply moving platform velocity if standing on one
        if (standingOnMovingPlatform && this.onGround) {
            // Apply platform's horizontal velocity to player
            this.x += standingOnMovingPlatform.velocity.x * (1/60) * 60;
            
            // Handle vertical platform movement
            // If platform is moving up, move player with it
            if (standingOnMovingPlatform.velocity.y < 0) {
                this.y += standingOnMovingPlatform.velocity.y * (1/60) * 60;
            }
            // If platform is moving down, player will naturally fall with it due to gravity
            
            // Track the platform for momentum transfer on jump
            this.lastPlatform = standingOnMovingPlatform;
        } else if (!this.onGround) {
            // Clear last platform when in air
            this.lastPlatform = null;
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
        
        // Speed boost trail effect
        if (this.speedMultiplier > 1.0 && Math.abs(this.vx) > 1) {
            // Spawn yellow trail particles
            if (Math.random() < 0.5) {
                particles.push(new Particle(
                    this.x + this.width / 2 + (Math.random() - 0.5) * this.width,
                    this.y + this.height / 2 + (Math.random() - 0.5) * this.height,
                    '#ffd93d',
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    15,
                    'trail'
                ));
            }
        }
        
        // Death check
        if (this.y > CANVAS_HEIGHT + 100) {
            return { died: true };
        }
        
        return { died: false, timeWarpsRemaining };
    }
    
    startRewind(createParticles) {
        this.isRewinding = true;
        this.rewindIndex = this.history.length - 1;
        
        // Create time warp particles
        createParticles(this.x + this.width / 2, this.y + this.height / 2, '#790ECB', 20);
        
        // Play time warp sound
        if (typeof audioManager !== 'undefined') {
            audioManager.playSound('timeWarp');
        }
    }
    
    updateRewind(particles) {
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
    
    die(lives, screenShake, createParticles) {
        // Check invincibility
        if (this.invincible) {
            return lives; // No damage when invincible
        }
        
        lives--;
        screenShake.trigger(12, 0.4);
        createParticles(this.x + this.width / 2, this.y + this.height / 2, '#ff0000', 15);
        
        // Play damage sound
        if (typeof audioManager !== 'undefined') {
            audioManager.playSound('damage');
        }
        
        if (lives <= 0) {
            return { lives: 0, gameOver: true };
        } else {
            this.respawn();
            return { lives, gameOver: false };
        }
    }
    
    respawn() {
        this.x = this.checkpointX;
        this.y = this.checkpointY;
        this.vx = 0;
        this.vy = 0;
        this.history = [];
    }
    
    setCheckpoint(x, y) {
        this.checkpointX = x;
        this.checkpointY = y;
    }
    
    render(ctx, camera) {
        const renderX = this.x - camera.x;
        
        // Apply subtle floating animation when idle
        let renderY = this.y;
        if (this.animationState === 'idle' && this.idleTimer > 0.5) {
            renderY += Math.sin(this.idleTimer * 3) * 2;
        }
        
        // Invincibility shield effect
        if (this.invincible) {
            const time = Date.now() / 1000;
            const pulseSize = 5 + Math.sin(time * 5) * 3;
            const pulseAlpha = 0.3 + Math.sin(time * 5) * 0.2;
            
            ctx.save();
            ctx.strokeStyle = `rgba(78, 205, 196, ${pulseAlpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
                renderX + this.width / 2,
                renderY + this.height / 2,
                this.width / 2 + pulseSize,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            
            // Inner shield glow
            const gradient = ctx.createRadialGradient(
                renderX + this.width / 2, renderY + this.height / 2, 0,
                renderX + this.width / 2, renderY + this.height / 2, this.width / 2 + pulseSize
            );
            gradient.addColorStop(0, 'rgba(78, 205, 196, 0)');
            gradient.addColorStop(1, `rgba(78, 205, 196, ${pulseAlpha * 0.5})`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                renderX + this.width / 2,
                renderY + this.height / 2,
                this.width / 2 + pulseSize,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.restore();
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
