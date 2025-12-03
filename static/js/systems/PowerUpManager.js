// ===== POWER-UP MANAGER =====
export class PowerUpManager {
    constructor() {
        this.activePowerUps = new Map();
        this.gameSpeedMultiplier = 1.0;
    }
    
    activatePowerUp(type, player) {
        const config = this.getPowerUpConfig(type);
        
        // If power-up is already active, refresh duration
        if (this.activePowerUps.has(type)) {
            const existing = this.activePowerUps.get(type);
            existing.remainingTime = config.duration;
        } else {
            // Activate new power-up
            this.activePowerUps.set(type, {
                type: type,
                duration: config.duration,
                remainingTime: config.duration,
                effect: config.effect
            });
            
            // Apply initial effect
            config.effect.apply(player, this);
        }
        
        // Play activation sound
        if (window.audioManager) {
            window.audioManager.playSound(type === 'invincibility' ? 'collect' : 'jump');
        }
    }
    
    update(deltaTime, player) {
        const toRemove = [];
        
        for (const [type, powerUp] of this.activePowerUps) {
            powerUp.remainingTime -= deltaTime;
            
            if (powerUp.remainingTime <= 0) {
                // Power-up expired
                toRemove.push(type);
                this.deactivatePowerUp(type, player);
            }
        }
        
        // Remove expired power-ups
        for (const type of toRemove) {
            this.activePowerUps.delete(type);
        }
    }
    
    deactivatePowerUp(type, player) {
        const config = this.getPowerUpConfig(type);
        if (config.deactivate) {
            config.deactivate(player, this);
        }
    }
    
    isActive(type) {
        return this.activePowerUps.has(type);
    }
    
    getRemainingTime(type) {
        const powerUp = this.activePowerUps.get(type);
        return powerUp ? powerUp.remainingTime : 0;
    }
    
    deactivateAll(player) {
        for (const [type, powerUp] of this.activePowerUps) {
            this.deactivatePowerUp(type, player);
        }
        this.activePowerUps.clear();
    }
    
    getPowerUpConfig(type) {
        const configs = {
            speed: {
                duration: 5,
                effect: {
                    apply: (player, manager) => {
                        player.speedMultiplier = 1.5;
                    }
                },
                deactivate: (player, manager) => {
                    player.speedMultiplier = 1.0;
                }
            },
            invincibility: {
                duration: 8,
                effect: {
                    apply: (player, manager) => {
                        player.invincible = true;
                    }
                },
                deactivate: (player, manager) => {
                    player.invincible = false;
                }
            },
            doubleJump: {
                duration: 10,
                effect: {
                    apply: (player, manager) => {
                        player.hasDoubleJump = true;
                        player.doubleJumpAvailable = true;
                    }
                },
                deactivate: (player, manager) => {
                    player.hasDoubleJump = false;
                    player.doubleJumpAvailable = false;
                }
            },
            slowMotion: {
                duration: 4,
                effect: {
                    apply: (player, manager) => {
                        manager.gameSpeedMultiplier = 0.5;
                    }
                },
                deactivate: (player, manager) => {
                    manager.gameSpeedMultiplier = 1.0;
                }
            }
        };
        
        return configs[type] || { duration: 0, effect: { apply: () => {} } };
    }
    
    getGameSpeedMultiplier() {
        return this.gameSpeedMultiplier;
    }
}
