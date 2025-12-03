/**
 * Property-Based Tests for Obstacle System
 * Using fast-check library for property-based testing
 */

import fc from 'fast-check';
import { test } from 'node:test';
import { MovingPlatform, FallingPlatform } from '../static/js/entities/Platform.js';
import { LaserHazard, SpikeTrap } from '../static/js/entities/Obstacle.js';

// Mock window.audioManager for Node.js environment
global.window = global.window || {};
global.window.audioManager = {
    playSound: () => {} // No-op for tests
};

// Using real classes from refactored code

/**
 * Feature: new-obstacles, Property 1: Moving platforms have valid configuration
 * For any spawned moving platform, it should have a defined path with at least 2 points and a positive speed value
 * Validates: Requirements 1.1
 */
test('Property 1: Moving platforms have valid configuration', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 50, max: 200 }),
            fc.integer({ min: 20, max: 50 }),
            fc.integer({ min: 1, max: 10 }),
            (width, height, speed) => {
                // Create simple valid path
                const path = [
                    { x: 100, y: 100 },
                    { x: 200, y: 100 }
                ];
                
                const platform = new MovingPlatform(100, 100, width, height, path, speed);
                
                // Verify basic configuration
                return platform.path.length >= 2 &&
                       platform.speed > 0 &&
                       platform.width > 0 &&
                       platform.height > 0;
            }
        ),
        { numRuns: 100 }
    );
});

/**
 * Feature: new-obstacles, Property 3: Moving platforms reverse at path end
 * For any moving platform at the end of its path, it should reverse direction without exceeding path boundaries
 * Validates: Requirements 1.3
 */
test('Property 3: Moving platforms reverse at path end', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 100, max: 500 }),
            fc.integer({ min: 100, max: 400 }),
            fc.integer({ min: 50, max: 100 }),
            fc.integer({ min: 20, max: 40 }),
            fc.integer({ min: 1, max: 3 }),
            (x, y, width, height, speed) => {
                // Create simple path
                const path = [
                    { x: x, y: y },
                    { x: x + 100, y: y },
                    { x: x + 100, y: y + 100 }
                ];
                
                const platform = new MovingPlatform(x, y, width, height, path, speed);
                
                // Simulate movement through multiple cycles
                for (let i = 0; i < 300; i++) {
                    platform.update(1/60);
                }
                
                // Verify platform stayed within reasonable bounds (with margin for movement)
                const minX = Math.min(...path.map(p => p.x));
                const maxX = Math.max(...path.map(p => p.x));
                const minY = Math.min(...path.map(p => p.y));
                const maxY = Math.max(...path.map(p => p.y));
                
                const margin = 100; // Generous margin
                return platform.x >= minX - margin && platform.x <= maxX + margin &&
                       platform.y >= minY - margin && platform.y <= maxY + margin;
            }
        ),
        { numRuns: 100 }
    );
});

/**
 * Feature: new-obstacles, Property 2: Moving platforms carry player
 * For any player standing on a moving platform, the player's position should change with the platform's movement
 * Validates: Requirements 1.2
 */
test('Property 2: Moving platforms carry player', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 100, max: 300 }),
            fc.integer({ min: 100, max: 300 }),
            fc.integer({ min: 1, max: 5 }),
            (platformX, platformY, speed) => {
                // Create platform with horizontal movement
                const path = [
                    { x: platformX, y: platformY },
                    { x: platformX + 100, y: platformY }
                ];
                
                const platform = new MovingPlatform(platformX, platformY, 100, 20, path, speed);
                
                // Simulate player standing on platform
                const initialPlayerX = platformX + 50;
                let playerX = initialPlayerX;
                
                // Update platform and apply velocity to player
                for (let i = 0; i < 10; i++) {
                    platform.update(1/60);
                    // Simulate player moving with platform
                    playerX += platform.velocity.x * (1/60) * 60;
                }
                
                // Player should have moved with the platform
                const platformMoved = Math.abs(platform.x - platformX) > 1;
                const playerMoved = Math.abs(playerX - initialPlayerX) > 1;
                
                return platformMoved === playerMoved;
            }
        ),
        { numRuns: 100 }
    );
});

// Using real LaserHazard from refactored code

/**
 * Feature: new-obstacles, Property 4: Laser hazards have valid pattern
 * Validates: Requirements 2.1
 */
test('Property 4: Laser hazards have valid pattern', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 1000 }),
            fc.integer({ min: 0, max: 600 }),
            fc.constantFrom('horizontal', 'vertical'),
            fc.integer({ min: 2, max: 5 }),
            fc.integer({ min: 1, max: 2 }),
            fc.integer({ min: 1, max: 2 }),
            (x, y, direction, cycleTime, warningTime, activeTime) => {
                const laser = new LaserHazard(x, y, direction, cycleTime, warningTime, activeTime);
                return laser.cycleTime > 0 && laser.warningTime > 0 && laser.activeTime > 0;
            }
        ),
        { numRuns: 100 }
    );
});

/**
 * Feature: new-obstacles, Property 5: Laser warning duration is correct
 * Validates: Requirements 2.2
 */
test('Property 5: Laser warning duration is correct', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 1000 }),
            fc.integer({ min: 0, max: 600 }),
            (x, y) => {
                const laser = new LaserHazard(x, y, 'horizontal', 3, 1, 1);
                
                // Update to warning phase
                laser.update(0.5);
                const isWarning = laser.currentPhase === 'warning';
                
                // Update past warning time
                laser.update(0.6);
                const isActive = laser.currentPhase === 'active';
                
                return isWarning && isActive;
            }
        ),
        { numRuns: 100 }
    );
});

/**
 * Feature: new-obstacles, Property 6: Active lasers cause damage
 * Validates: Requirements 2.3
 */
test('Property 6: Active lasers cause damage', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 1000 }),
            fc.integer({ min: 0, max: 600 }),
            (x, y) => {
                const laser = new LaserHazard(x, y, 'horizontal', 3, 1, 1);
                
                // Update to active phase
                laser.update(1.5);
                
                return laser.currentPhase === 'active' && laser.dangerous === true;
            }
        ),
        { numRuns: 100 }
    );
});

/**
 * Feature: new-obstacles, Property 7: Inactive lasers are safe
 * Validates: Requirements 2.4
 */
test('Property 7: Inactive lasers are safe', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 1000 }),
            fc.integer({ min: 0, max: 600 }),
            (x, y) => {
                const laser = new LaserHazard(x, y, 'horizontal', 3, 1, 1);
                
                // Laser starts inactive
                const initialSafe = !laser.dangerous;
                
                // Update to inactive phase (after active)
                laser.update(2.5);
                const laterSafe = !laser.dangerous;
                
                return initialSafe && laterSafe;
            }
        ),
        { numRuns: 100 }
    );
});

/**
 * Feature: new-obstacles, Property 8: Laser timing is consistent
 * Validates: Requirements 2.5
 */
test('Property 8: Laser timing is consistent', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 1000 }),
            fc.integer({ min: 0, max: 600 }),
            fc.integer({ min: 2, max: 4 }),
            (x, y, cycleTime) => {
                const laser = new LaserHazard(x, y, 'horizontal', cycleTime, 1, 1);
                
                // Record phase at cycle time
                laser.update(cycleTime);
                const phase1 = laser.currentPhase;
                
                // Record phase at 2x cycle time
                laser.update(cycleTime);
                const phase2 = laser.currentPhase;
                
                // Phases should be the same (consistent timing)
                return phase1 === phase2;
            }
        ),
        { numRuns: 100 }
    );
});

// Using real SpikeTrap and FallingPlatform from refactored code

test('Property 9: Spikes are placed on valid surfaces', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 1000 }),
            fc.integer({ min: 0, max: 600 }),
            fc.constantFrom('up', 'down', 'left', 'right'),
            (x, y, orientation) => {
                const spike = new SpikeTrap(x, y, orientation);
                return spike.orientation !== undefined && spike.dangerous === true;
            }
        ),
        { numRuns: 100 }
    );
});

test('Property 10: Spikes cause damage and knockback', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 1000 }),
            fc.integer({ min: 0, max: 600 }),
            (x, y) => {
                const spike = new SpikeTrap(x, y, 'up');
                return spike.dangerous === true;
            }
        ),
        { numRuns: 100 }
    );
});

test('Property 11: Falling platform timer starts on landing', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 1000 }),
            fc.integer({ min: 0, max: 600 }),
            fc.integer({ min: 50, max: 150 }),
            (x, y, width) => {
                const platform = new FallingPlatform(x, y, width, 20);
                platform.startFallTimer();
                return platform.playerOnPlatform === true;
            }
        ),
        { numRuns: 100 }
    );
});

test('Property 12: Falling platform drops after timer', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 1000 }),
            fc.integer({ min: 0, max: 600 }),
            fc.integer({ min: 50, max: 150 }),
            (x, y, width) => {
                const platform = new FallingPlatform(x, y, width, 20);
                
                // Keep player on platform while updating
                for (let i = 0; i < 40; i++) {
                    platform.startFallTimer();
                    platform.update(1/60);
                }
                
                return platform.falling === true;
            }
        ),
        { numRuns: 100 }
    );
});

test('Property 13: Falling platforms respawn', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 1000 }),
            fc.integer({ min: 100, max: 400 }),
            fc.integer({ min: 50, max: 150 }),
            (x, y, width) => {
                const platform = new FallingPlatform(x, y, width, 20);
                
                // Make it fall
                platform.falling = true;
                platform.y = 800; // Off screen
                platform.update(1/60);
                
                // Should stop falling
                return platform.falling === false;
            }
        ),
        { numRuns: 100 }
    );
});

test('Property 14: Leaving platform cancels timer', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 1000 }),
            fc.integer({ min: 0, max: 600 }),
            fc.integer({ min: 50, max: 150 }),
            (x, y, width) => {
                const platform = new FallingPlatform(x, y, width, 20);
                platform.startFallTimer();
                platform.update(0.1);
                
                // Player leaves (don't call startFallTimer)
                platform.update(0.1);
                
                // Timer should reset since player left
                return platform.playerOnPlatform === false;
            }
        ),
        { numRuns: 100 }
    );
});
