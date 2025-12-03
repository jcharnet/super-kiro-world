import { Platform, MovingPlatform, FallingPlatform } from '../entities/Platform.js';
import { Collectible } from '../entities/Collectible.js';
import { PowerUp } from '../entities/PowerUp.js';
import { LaserHazard, SpikeTrap } from '../entities/Obstacle.js';
import { DeployGate } from '../entities/DeployGate.js';

// ===== LEVEL 1 CONFIGURATION =====
export function setupLevel1() {
    const platforms = [];
    const collectibles = [];
    const powerUps = [];
    const obstacles = [];
    const checkpoints = [];
    
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
    
    // Add power-ups to the level
    powerUps.push(new PowerUp(600, 480, 'speed'));
    powerUps.push(new PowerUp(1600, 380, 'invincibility'));
    powerUps.push(new PowerUp(2300, 380, 'doubleJump'));
    powerUps.push(new PowerUp(3000, 380, 'slowMotion'));
    
    // Add moving platforms
    const movingPlatform1 = new MovingPlatform(1000, 400, 100, 20, [
        { x: 1000, y: 400 },
        { x: 1200, y: 400 }
    ], 2);
    obstacles.push(movingPlatform1);
    platforms.push(movingPlatform1); // Also add to platforms for collision
    
    const movingPlatform2 = new MovingPlatform(2600, 300, 100, 20, [
        { x: 2600, y: 300 },
        { x: 2600, y: 450 }
    ], 1.5);
    obstacles.push(movingPlatform2);
    platforms.push(movingPlatform2);
    
    // Add laser hazards
    obstacles.push(new LaserHazard(1300, 500, 'horizontal', 3, 1, 1));
    obstacles.push(new LaserHazard(2100, 400, 'vertical', 4, 1, 1.5));
    
    // Add spike traps
    obstacles.push(new SpikeTrap(1700, 330, 'up'));
    obstacles.push(new SpikeTrap(2800, 430, 'up'));
    
    // Add falling platforms
    const fallingPlatform1 = new FallingPlatform(2000, 400, 80, 20);
    obstacles.push(fallingPlatform1);
    platforms.push(fallingPlatform1);
    
    // Deploy gate
    const deployGate = new DeployGate(3700, 450);
    
    return {
        platforms,
        collectibles,
        powerUps,
        obstacles,
        checkpoints,
        deployGate,
        playerStart: { x: 100, y: 400 }
    };
}
