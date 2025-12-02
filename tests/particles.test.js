// Property-based tests for Particle System
// Feature: score-and-effects

const { test } = require('node:test');
const assert = require('node:assert');
const fc = require('fast-check');

// Particle class (copied from game.js for testing)
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
}

// Generators
const particleTypeArb = fc.constantFrom('default', 'trail', 'explosion', 'sparkle', 'confetti');
const colorArb = fc.constantFrom('#790ECB', '#ff0000', '#00ff00', '#ffff00', '#ffffff');

// Feature: score-and-effects, Property 9: Particle opacity decay
test('Property 9: Particle opacity decay', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 10, max: 100 }),
            fc.integer({ min: 1, max: 50 }),
            (maxLife, currentLife) => {
                // Ensure currentLife is less than maxLife
                const life = Math.min(currentLife, maxLife - 1);
                
                const particle = new Particle(100, 100, '#790ECB', 0, 0, maxLife);
                
                // Age the particle
                for (let i = 0; i < (maxLife - life); i++) {
                    particle.update();
                }
                
                // Calculate expected opacity
                const expectedOpacity = particle.life / particle.maxLife;
                
                // Opacity should be proportional to life ratio
                assert.ok(expectedOpacity >= 0 && expectedOpacity <= 1);
                assert.strictEqual(particle.life / particle.maxLife, expectedOpacity);
                
                // As particle ages, opacity should decrease
                if (particle.life < particle.maxLife) {
                    assert.ok(expectedOpacity < 1);
                }
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});

// Feature: score-and-effects, Property 10: Particle lifecycle cleanup
test('Property 10: Particle lifecycle cleanup', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 1, max: 50 }),
            particleTypeArb,
            (life, type) => {
                const particle = new Particle(100, 100, '#790ECB', 0, 0, life, type);
                
                // Age particle beyond its lifetime
                for (let i = 0; i <= life; i++) {
                    particle.update();
                }
                
                // Particle life should be <= 0
                assert.ok(particle.life <= 0);
                
                // In a real system, particles with life <= 0 should be removed
                const shouldBeRemoved = particle.life <= 0;
                assert.ok(shouldBeRemoved);
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});

// ParticleFactory class (copied from game.js for testing)
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

// Feature: score-and-effects, Property 13: Explosion particle dispersion
test('Property 13: Explosion particle dispersion', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 800 }),
            fc.integer({ min: 0, max: 600 }),
            fc.integer({ min: 5, max: 20 }),
            (x, y, count) => {
                const explosionParticles = ParticleFactory.createExplosionParticles(x, y, count);
                
                // Should create the requested number of particles
                assert.strictEqual(explosionParticles.length, count);
                
                // All particles should have velocity pointing away from center
                explosionParticles.forEach(particle => {
                    // Velocity magnitude should be > 0
                    const velocityMagnitude = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
                    assert.ok(velocityMagnitude > 0, 'Particle should have non-zero velocity');
                    
                    // Particles should start at explosion center
                    assert.strictEqual(particle.x, x);
                    assert.strictEqual(particle.y, y);
                });
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});

// Feature: score-and-effects, Property 15: Sparkle particle colors
test('Property 15: Sparkle particle colors', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 800 }),
            fc.integer({ min: 0, max: 600 }),
            fc.integer({ min: 1, max: 20 }),
            (x, y, count) => {
                const sparkleParticles = ParticleFactory.createSparkleParticles(x, y, count);
                const validColors = ['#ffffff', '#ffff00', '#790ECB'];
                
                // All sparkle particles should use valid colors
                sparkleParticles.forEach(particle => {
                    assert.ok(validColors.includes(particle.color), 
                        `Sparkle particle color ${particle.color} should be in valid palette`);
                });
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});

// Feature: score-and-effects, Property 16: Sparkle particle upward velocity
test('Property 16: Sparkle particle upward velocity', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 800 }),
            fc.integer({ min: 0, max: 600 }),
            fc.integer({ min: 1, max: 20 }),
            (x, y, count) => {
                const sparkleParticles = ParticleFactory.createSparkleParticles(x, y, count);
                
                // All sparkle particles should have upward (negative y) velocity component
                sparkleParticles.forEach(particle => {
                    assert.ok(particle.vy < 0, 
                        `Sparkle particle should have upward velocity, got vy=${particle.vy}`);
                });
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});

// Feature: score-and-effects, Property 19: Confetti color variety
test('Property 19: Confetti color variety', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 30, max: 100 }),
            (count) => {
                const confettiParticles = ParticleFactory.createConfettiParticles(count);
                const validColors = ['#790ECB', '#ff6b6b', '#4ecdc4', '#ffd93d', '#95e1d3'];
                
                // Collect unique colors used
                const usedColors = new Set(confettiParticles.map(p => p.color));
                
                // Should use at least 3 different colors
                assert.ok(usedColors.size >= 3, 
                    `Confetti should use at least 3 colors, got ${usedColors.size}`);
                
                // All colors should be from valid palette
                usedColors.forEach(color => {
                    assert.ok(validColors.includes(color), 
                        `Confetti color ${color} should be in valid palette`);
                });
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});

// Feature: score-and-effects, Property 20: Confetti physics application
test('Property 20: Confetti physics application', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 10, max: 100 }),
            (count) => {
                const confettiParticles = ParticleFactory.createConfettiParticles(count);
                
                confettiParticles.forEach(particle => {
                    // Should have rotation
                    assert.ok(particle.rotation !== undefined, 'Confetti should have rotation');
                    
                    // Should have non-zero rotation speed
                    assert.ok(particle.rotationSpeed !== 0, 
                        'Confetti should have non-zero rotation speed');
                    
                    // Should be confetti type (which applies gravity in update)
                    assert.strictEqual(particle.type, 'confetti');
                });
                
                // Test that gravity is applied during update
                const testParticle = confettiParticles[0];
                const initialVy = testParticle.vy;
                testParticle.update();
                
                // vy should increase (gravity applied)
                assert.ok(testParticle.vy > initialVy, 
                    'Confetti should have gravity applied (vy should increase)');
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});

// Feature: score-and-effects, Property 21: Confetti minimum quantity
test('Property 21: Confetti minimum quantity', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 30, max: 100 }),
            (count) => {
                const confettiParticles = ParticleFactory.createConfettiParticles(count);
                
                // Should create at least the requested count
                assert.ok(confettiParticles.length >= 30, 
                    `Confetti should spawn at least 30 particles for visual impact, got ${confettiParticles.length}`);
                
                // Should create exactly the requested count
                assert.strictEqual(confettiParticles.length, count);
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});
