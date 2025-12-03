import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_PARTICLES, MAX_TIME_WARPS } from './constants.js';
import { Camera } from './systems/Camera.js';
import { ScreenShake } from './systems/ScreenShake.js';
import { ScoreManager } from './systems/ScoreManager.js';
import { PowerUpManager } from './systems/PowerUpManager.js';
import { ObstacleManager } from './systems/ObstacleManager.js';
import { Player } from './entities/Player.js';
import { ParticleFactory, Particle } from './entities/Particle.js';
import { renderBackground } from './rendering/Background.js';
import { renderHUD, renderGameOver, renderLevelComplete, renderLevelTransition } from './rendering/HUD.js';
import { setupLevel1 } from './levels/Level1.js';
import { setupLevel2 } from './levels/Level2.js';

// ===== MAIN GAME CLASS =====
export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Game state
        this.gameState = 'playing';
        this.score = 0;
        this.highScore = 0;
        this.confettiTriggered = false;
        this.lives = 3;
        this.timeWarpsRemaining = MAX_TIME_WARPS;
        this.levelStartTime = Date.now();
        this.totalCollectibles = 0;
        this.currentLevel = 1;
        this.frame = 0;
        this.scoreSubmitted = false;
        
        // Systems
        this.scoreManager = new ScoreManager();
        this.camera = new Camera();
        this.screenShake = new ScreenShake();
        this.powerUpManager = new PowerUpManager();
        this.obstacleManager = new ObstacleManager();
        
        // Entities
        this.player = new Player(100, 400);
        this.platforms = [];
        this.collectibles = [];
        this.powerUps = [];
        this.checkpoints = [];
        this.particles = [];
        this.deployGate = null;
        this.activeCheckpoint = null;
        
        // Input
        this.keys = {};
        this.setupInput();
        
        // Make managers globally accessible for compatibility
        window.powerUpManager = this.powerUpManager;
        window.obstacleManager = this.obstacleManager;
        window.particles = this.particles;
        window.ParticleFactory = ParticleFactory;
        window.scoreSubmitted = false;
        
        // Load initial level
        this.loadLevel(1);
        this.highScore = this.scoreManager.getHighScore();
    }
    
    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.keys[e.code] = true;
            
            if (e.key === 'r' || e.key === 'R') {
                if (this.gameState === 'gameOver' || this.gameState === 'levelComplete') {
                    this.restart();
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.keys[e.code] = false;
        });
    }
    
    loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        
        // Clear existing level data
        this.platforms = [];
        this.collectibles = [];
        this.powerUps = [];
        this.checkpoints = [];
        this.particles = [];
        this.activeCheckpoint = null;
        
        // Load level configuration
        let levelConfig;
        if (levelNumber === 1) {
            levelConfig = setupLevel1();
        } else if (levelNumber === 2) {
            levelConfig = setupLevel2();
        }
        
        if (levelConfig) {
            this.platforms = levelConfig.platforms;
            this.collectibles = levelConfig.collectibles;
            this.powerUps = levelConfig.powerUps;
            this.checkpoints = levelConfig.checkpoints;
            this.deployGate = levelConfig.deployGate;
            this.totalCollectibles = this.collectibles.length;
            
            // Setup obstacle manager
            this.obstacleManager = new ObstacleManager();
            levelConfig.obstacles.forEach(obstacle => {
                this.obstacleManager.addObstacle(obstacle);
            });
            window.obstacleManager = this.obstacleManager;
            
            // Reset player
            this.player.x = levelConfig.playerStart.x;
            this.player.y = levelConfig.playerStart.y;
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.setCheckpoint(levelConfig.playerStart.x, levelConfig.playerStart.y);
            this.player.history = [];
            
            // Reset camera
            this.camera.x = 0;
        }
    }
    
    update() {
        this.frame++;
        
        // Update screen shake
        this.screenShake.update();
        
        if (this.gameState === 'playing') {
            // Update power-up manager
            this.powerUpManager.update(1/60, this.player);
            
            // Update power-ups
            this.powerUps.forEach(p => p.update(1/60, this.player));
            
            // Update obstacles
            this.obstacleManager.updateAll(1/60);
            this.obstacleManager.checkCollisions(this.player);
            
            // Check if player was hit by obstacle
            if (this.player.hitByObstacle) {
                this.player.hitByObstacle = false;
                const deathResult = this.player.die(this.lives, this.screenShake, this.createParticles.bind(this));
                if (typeof deathResult === 'object') {
                    this.lives = deathResult.lives;
                    if (deathResult.gameOver) {
                        this.gameState = 'gameOver';
                    }
                } else {
                    this.lives = deathResult;
                }
            }
            
            // Update player
            const playerResult = this.player.update(
                this.platforms,
                this.keys,
                this.particles,
                this.screenShake,
                this.timeWarpsRemaining,
                this.createParticles.bind(this)
            );
            
            if (playerResult.died) {
                const deathResult = this.player.die(this.lives, this.screenShake, this.createParticles.bind(this));
                if (typeof deathResult === 'object') {
                    this.lives = deathResult.lives;
                    if (deathResult.gameOver) {
                        this.gameState = 'gameOver';
                    }
                } else {
                    this.lives = deathResult;
                }
            }
            
            if (playerResult.timeWarpsRemaining !== undefined) {
                this.timeWarpsRemaining = playerResult.timeWarpsRemaining;
            }
            
            // Update camera
            this.camera.update(this.player);
            
            // Update collectibles
            this.collectibles.forEach(c => {
                c.update(this.frame);
                if (!c.collected && this.player.intersects(c)) {
                    c.collected = true;
                    this.score++;
                    
                    // Update high score
                    const previousHighScore = this.highScore;
                    if (this.score > this.highScore) {
                        this.highScore = this.score;
                        
                        // Trigger confetti on new high score
                        if (!this.confettiTriggered && this.score > previousHighScore) {
                            this.confettiTriggered = true;
                            const confettiParticles = ParticleFactory.createConfettiParticles(50);
                            this.particles.push(...confettiParticles);
                        }
                    }
                    
                    // Spawn sparkle particles
                    const sparkleParticles = ParticleFactory.createSparkleParticles(
                        c.x + c.width / 2,
                        c.y + c.height / 2,
                        8
                    );
                    this.particles.push(...sparkleParticles);
                    
                    // Play collect sound
                    if (typeof audioManager !== 'undefined') {
                        audioManager.playSound('collect');
                    }
                }
            });
            
            // Update particles
            this.particles.forEach(p => p.update());
            
            // Remove dead particles
            for (let i = this.particles.length - 1; i >= 0; i--) {
                if (this.particles[i].life <= 0) {
                    this.particles.splice(i, 1);
                }
            }
            
            // Limit particle count
            if (this.particles.length > MAX_PARTICLES) {
                this.particles.splice(0, this.particles.length - MAX_PARTICLES);
            }
            
            // Check checkpoints
            this.checkpoints.forEach(checkpoint => {
                if (!checkpoint.activated && checkpoint.checkCollision(this.player)) {
                    checkpoint.activate();
                    this.player.setCheckpoint(checkpoint.x, checkpoint.y);
                    this.activeCheckpoint = checkpoint;
                }
            });
            
            // Check deploy gate
            if (this.player.intersects(this.deployGate)) {
                if (this.currentLevel === 1) {
                    // Transition to level 2
                    this.gameState = 'levelTransition';
                    
                    if (typeof audioManager !== 'undefined') {
                        audioManager.playSound('collect');
                    }
                    
                    setTimeout(() => {
                        this.loadLevel(2);
                        this.gameState = 'playing';
                    }, 2000);
                } else {
                    // Final completion
                    this.gameState = 'levelComplete';
                    
                    if (typeof audioManager !== 'undefined') {
                        audioManager.playSound('collect');
                    }
                    
                    this.submitScore();
                }
            }
        }
    }
    
    render() {
        const shakeOffset = this.screenShake.getOffset();
        
        this.ctx.save();
        this.ctx.translate(shakeOffset.x, shakeOffset.y);
        
        if (this.gameState === 'playing') {
            renderBackground(this.ctx, this.camera, this.frame);
            
            this.platforms.forEach(p => p.render(this.ctx, this.camera));
            this.collectibles.forEach(c => c.render(this.ctx, this.camera));
            this.deployGate.render(this.ctx, this.camera, this.frame);
            
            this.obstacleManager.renderAll(this.ctx, this.camera);
            
            this.particles.forEach(p => p.render(this.ctx, this.camera));
            this.checkpoints.forEach(c => c.render(this.ctx, this.camera));
            this.player.render(this.ctx, this.camera);
            this.powerUps.forEach(p => p.render(this.ctx, this.camera));
            
            // Slow-motion visual filter
            if (this.powerUpManager.isActive('slowMotion')) {
                this.ctx.fillStyle = 'rgba(100, 100, 150, 0.2)';
                this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }
            
        } else if (this.gameState === 'levelTransition') {
            renderBackground(this.ctx, this.camera, this.frame);
            renderLevelTransition(this.ctx, CANVAS_WIDTH, CANVAS_HEIGHT, 2);
        } else if (this.gameState === 'gameOver') {
            renderBackground(this.ctx, this.camera, this.frame);
            this.platforms.forEach(p => p.render(this.ctx, this.camera));
            renderGameOver(this.ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else if (this.gameState === 'levelComplete') {
            renderBackground(this.ctx, this.camera, this.frame);
            this.platforms.forEach(p => p.render(this.ctx, this.camera));
            this.collectibles.forEach(c => c.render(this.ctx, this.camera));
            this.deployGate.render(this.ctx, this.camera, this.frame);
            this.player.render(this.ctx, this.camera);
            renderLevelComplete(
                this.ctx,
                CANVAS_WIDTH,
                CANVAS_HEIGHT,
                this.currentLevel,
                this.levelStartTime,
                this.score,
                this.totalCollectibles,
                this.lives,
                this.scoreSubmitted
            );
        }
        
        this.ctx.restore();
        
        // Render HUD after restore
        if (this.gameState === 'playing') {
            renderHUD(this.ctx, this.score, this.highScore, this.lives, this.timeWarpsRemaining);
        }
    }
    
    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 2;
            this.particles.push(new Particle(
                x, y, color,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 2,
                30 + Math.random() * 20
            ));
        }
    }
    
    restart() {
        this.gameState = 'playing';
        this.score = 0;
        this.highScore = this.scoreManager.getHighScore();
        this.confettiTriggered = false;
        this.lives = 3;
        this.timeWarpsRemaining = MAX_TIME_WARPS;
        this.levelStartTime = Date.now();
        this.scoreSubmitted = false;
        window.scoreSubmitted = false;
        
        // Reload level 1
        this.loadLevel(1);
        
        // Reset power-ups
        this.powerUpManager.deactivateAll(this.player);
        this.powerUps.forEach(p => {
            p.collected = false;
            p.respawnTimer = 0;
        });
    }
    
    async submitScore() {
        if (this.scoreSubmitted) return;
        this.scoreSubmitted = true;
        window.scoreSubmitted = true;
        
        const timeTaken = Math.floor((Date.now() - this.levelStartTime) / 1000);
        const playerName = this.scoreManager.getCurrentPlayerName();
        
        // Save to Local Storage
        const gameSession = {
            player: playerName,
            score: this.score,
            time: timeTaken,
            lives: this.lives
        };
        this.scoreManager.saveGameSession(gameSession);
        
        // Submit to backend
        try {
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    player: playerName,
                    score: this.score,
                    time: timeTaken,
                    lives: this.lives
                })
            });
            
            if (response.ok) {
                console.log('Score submitted successfully!');
            }
        } catch (error) {
            console.error('Failed to submit score:', error);
        }
    }
    
    loop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.loop());
    }
    
    start() {
        this.loop();
    }
}
