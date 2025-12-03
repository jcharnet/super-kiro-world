import { Platform, MovingPlatform, FallingPlatform } from '../entities/Platform.js';
import { Collectible } from '../entities/Collectible.js';
import { PowerUp } from '../entities/PowerUp.js';
import { LaserHazard, SpikeTrap } from '../entities/Obstacle.js';
import { Checkpoint } from '../entities/Checkpoint.js';
import { DeployGate } from '../entities/DeployGate.js';

// ===== LEVEL 2 CONFIGURATION =====
export function setupLevel2() {
    const platforms = [];
    const collectibles = [];
    const powerUps = [];
    const obstacles = [];
    const checkpoints = [];
    
    // Level 2 platforms - larger gaps, more challenging
    platforms.push(new Platform(0, 550, 200, 50, 'dashboard'));
    platforms.push(new Platform(350, 500, 120, 30, 'service'));
    platforms.push(new Platform(600, 450, 100, 30, 'pipeline'));
    platforms.push(new Platform(850, 400, 100, 30, 'dashboard'));
    platforms.push(new Platform(1100, 350, 120, 30, 'service'));
    platforms.push(new Platform(1400, 450, 100, 30, 'pipeline'));
    platforms.push(new Platform(1650, 400, 100, 30, 'dashboard'));
    platforms.push(new Platform(1900, 350, 120, 30, 'service'));
    platforms.push(new Platform(2200, 450, 100, 30, 'pipeline'));
    platforms.push(new Platform(2500, 400, 100, 30, 'dashboard'));
    platforms.push(new Platform(2800, 350, 120, 30, 'service'));
    platforms.push(new Platform(3100, 450, 100, 30, 'pipeline'));
    platforms.push(new Platform(3400, 400, 100, 30, 'dashboard'));
    platforms.push(new Platform(3700, 550, 400, 50, 'service'));
    
    // Level 2 collectibles - more than level 1
    collectibles.push(new Collectible(400, 470));
    collectibles.push(new Collectible(650, 420));
    collectibles.push(new Collectible(900, 370));
    collectibles.push(new Collectible(1150, 320));
    collectibles.push(new Collectible(1450, 420));
    collectibles.push(new Collectible(1700, 370));
    collectibles.push(new Collectible(1950, 320));
    collectibles.push(new Collectible(2250, 420));
    collectibles.push(new Collectible(2550, 370));
    collectibles.push(new Collectible(2850, 320));
    collectibles.push(new Collectible(3150, 420));
    collectibles.push(new Collectible(3450, 370));
    collectibles.push(new Collectible(3800, 480));
    collectibles.push(new Collectible(3900, 480));
    
    // Level 2 power-ups
    powerUps.push(new PowerUp(500, 470, 'speed'));
    powerUps.push(new PowerUp(1250, 320, 'invincibility'));
    powerUps.push(new PowerUp(2050, 320, 'doubleJump'));
    powerUps.push(new PowerUp(2950, 320, 'slowMotion'));
    
    // More moving platforms with complex paths
    const mp1 = new MovingPlatform(750, 300, 100, 20, [
        { x: 750, y: 300 },
        { x: 950, y: 300 }
    ], 2);
    obstacles.push(mp1);
    platforms.push(mp1);
    
    const mp2 = new MovingPlatform(1250, 250, 100, 20, [
        { x: 1250, y: 250 },
        { x: 1250, y: 450 },
        { x: 1350, y: 450 }
    ], 1.5);
    obstacles.push(mp2);
    platforms.push(mp2);
    
    const mp3 = new MovingPlatform(2350, 300, 100, 20, [
        { x: 2350, y: 300 },
        { x: 2350, y: 500 }
    ], 2);
    obstacles.push(mp3);
    platforms.push(mp3);
    
    const mp4 = new MovingPlatform(3250, 250, 100, 20, [
        { x: 3250, y: 250 },
        { x: 3250, y: 400 }
    ], 1.8);
    obstacles.push(mp4);
    platforms.push(mp4);
    
    // More laser hazards with varied timing
    obstacles.push(new LaserHazard(550, 500, 'horizontal', 2.5, 0.8, 1));
    obstacles.push(new LaserHazard(1500, 500, 'horizontal', 3, 1, 1.2));
    obstacles.push(new LaserHazard(1800, 250, 'vertical', 3.5, 1, 1.5));
    obstacles.push(new LaserHazard(2650, 500, 'horizontal', 2.8, 0.9, 1.1));
    obstacles.push(new LaserHazard(3300, 300, 'vertical', 3.2, 1, 1.3));
    
    // More spike traps
    obstacles.push(new SpikeTrap(700, 430, 'up'));
    obstacles.push(new SpikeTrap(1550, 380, 'up'));
    obstacles.push(new SpikeTrap(2300, 430, 'up'));
    obstacles.push(new SpikeTrap(3050, 330, 'up'));
    
    // Falling platforms
    const fp1 = new FallingPlatform(1550, 300, 80, 20);
    obstacles.push(fp1);
    platforms.push(fp1);
    
    const fp2 = new FallingPlatform(2650, 350, 80, 20);
    obstacles.push(fp2);
    platforms.push(fp2);
    
    // Checkpoints at strategic locations
    checkpoints.push(new Checkpoint(1000, 290));
    checkpoints.push(new Checkpoint(2000, 290));
    checkpoints.push(new Checkpoint(3000, 290));
    
    // Deploy gate at end of level 2
    const deployGate = new DeployGate(3900, 450);
    
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
