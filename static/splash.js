// ===== SUPER KIRO WORLD - SPLASH SCREEN MODULE =====
// Cinematic "Booting the Cloud" intro sequence

function initSplashScreen(canvas, startGame) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // ===== STATE =====
    let splashActive = true;
    let frame = 0;
    let bootProgress = 0;
    let bootComplete = false;
    let fadeOut = false;
    let fadeAlpha = 0;
    
    // ===== BOOT LOG =====
    const bootLogs = [
        { text: '[OK] Initializing Cloud Services...', delay: 20, visible: false },
        { text: '[OK] Mounting Dashboards...', delay: 40, visible: false },
        { text: '[OK] Loading Pipeline Modules...', delay: 60, visible: false },
        { text: '[OK] Connecting to Deploy Gates...', delay: 80, visible: false },
        { text: '[OK] Spawning Kiro...', delay: 100, visible: false },
        { text: '[OK] Time Warp Systems Online...', delay: 120, visible: false },
        { text: '[READY] All Systems Operational', delay: 140, visible: false }
    ];
    
    // ===== CLOUD NODES (BACKGROUND) =====
    const cloudNodes = [];
    for (let i = 0; i < 15; i++) {
        cloudNodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            width: 40 + Math.random() * 60,
            height: 30 + Math.random() * 40,
            speed: 0.2 + Math.random() * 0.5,
            alpha: 0.1 + Math.random() * 0.15
        });
    }
    
    // ===== SCANLINES =====
    let scanlineOffset = 0;
    
    // ===== KIRO SPRITE =====
    const kiroSprite = new Image();
    kiroSprite.src = '/static/kiro-logo.png';
    let kiroLoaded = false;
    kiroSprite.onload = () => { kiroLoaded = true; };
    
    // ===== TITLE ANIMATION =====
    let titleAlpha = 0;
    let titleScale = 0.8;
    
    // ===== KEYBOARD START =====
    let waitingForStart = false;
    
    function handleKeyPress(e) {
        // Only respond to ENTER key
        if (e.key === 'Enter' && splashActive) {
            if (!bootComplete) {
                // Skip boot animation and go to waiting state
                bootProgress = 100;
                bootComplete = true;
                waitingForStart = true;
                bootLogs.forEach(log => log.visible = true);
            } else if (waitingForStart) {
                // Start the game
                fadeOut = true;
            }
        }
    }
    
    window.addEventListener('keydown', handleKeyPress);
    
    // ===== UPDATE =====
    function update() {
        frame++;
        
        // Update cloud nodes
        cloudNodes.forEach(node => {
            node.x -= node.speed;
            if (node.x + node.width < 0) {
                node.x = width + 20;
                node.y = Math.random() * height;
            }
        });
        
        // Update boot logs
        bootLogs.forEach(log => {
            if (frame >= log.delay && !log.visible) {
                log.visible = true;
            }
        });
        
        // Update boot progress
        if (frame > 30 && bootProgress < 100) {
            bootProgress += 0.8;
            if (bootProgress > 100) bootProgress = 100;
        }
        
        // Title fade in
        if (frame > 80) {
            titleAlpha += 0.02;
            if (titleAlpha > 1) titleAlpha = 1;
            
            titleScale += (1 - titleScale) * 0.05;
        }
        
        // Boot complete check
        if (bootProgress >= 100 && !bootComplete) {
            bootComplete = true;
            waitingForStart = true;
            // Do NOT auto-start - wait for ENTER key
        }
        
        // Fade out
        if (fadeOut) {
            fadeAlpha += 0.05;
            if (fadeAlpha >= 1) {
                splashActive = false;
                window.removeEventListener('keydown', handleKeyPress);
                startGame();
                return;
            }
        }
        
        // Scanline animation
        scanlineOffset = (scanlineOffset + 2) % height;
    }
    
    // ===== RENDER =====
    function render() {
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Purple glow overlay
        const glowGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
        glowGradient.addColorStop(0, 'rgba(121, 14, 203, 0.15)');
        glowGradient.addColorStop(1, 'rgba(121, 14, 203, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Cloud nodes (drifting servers)
        cloudNodes.forEach(node => {
            ctx.fillStyle = `rgba(22, 33, 62, ${node.alpha})`;
            ctx.fillRect(node.x, node.y, node.width, node.height);
            
            // Node border
            ctx.strokeStyle = `rgba(121, 14, 203, ${node.alpha * 0.5})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(node.x, node.y, node.width, node.height);
        });
        
        // Title (SUPER KIRO WORLD)
        if (titleAlpha > 0) {
            ctx.save();
            ctx.translate(width / 2, height / 2 - 80);
            ctx.scale(titleScale, titleScale);
            
            // Title glow
            ctx.shadowColor = '#790ECB';
            ctx.shadowBlur = 30;
            ctx.fillStyle = `rgba(121, 14, 203, ${titleAlpha})`;
            ctx.font = 'bold 64px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('SUPER KIRO WORLD', 0, 0);
            
            // Title text (white)
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(255, 255, 255, ${titleAlpha})`;
            ctx.fillText('SUPER KIRO WORLD', 0, 0);
            
            ctx.restore();
            
            // Tagline
            ctx.fillStyle = `rgba(121, 14, 203, ${titleAlpha * 0.8})`;
            ctx.font = '20px Courier New';
            ctx.textAlign = 'center';
            
            // Typing effect for tagline
            const tagline = 'Booting the Cloud… Please Stand By';
            const charsToShow = Math.min(tagline.length, Math.floor((frame - 80) / 2));
            const visibleTagline = tagline.substring(0, charsToShow);
            
            ctx.fillText(visibleTagline, width / 2, height / 2 - 20);
            
            // Blinking cursor
            if (charsToShow < tagline.length && frame % 20 < 10) {
                ctx.fillText('_', width / 2 + ctx.measureText(visibleTagline).width / 2 + 5, height / 2 - 20);
            }
        }
        
        // Kiro sprite (floating animation)
        if (kiroLoaded && titleAlpha > 0.5) {
            const kiroSize = 80;
            const kiroX = width / 2 - kiroSize / 2;
            const kiroY = height / 2 + 40 + Math.sin(frame * 0.05) * 10;
            
            // Glow behind Kiro
            ctx.shadowColor = '#790ECB';
            ctx.shadowBlur = 20;
            ctx.drawImage(kiroSprite, kiroX, kiroY, kiroSize, kiroSize);
            ctx.shadowBlur = 0;
        }
        
        // Boot logs
        ctx.fillStyle = '#00ff00';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'left';
        
        let logY = height - 180;
        bootLogs.forEach((log, index) => {
            if (log.visible) {
                const logAlpha = Math.min(1, (frame - log.delay) / 20);
                ctx.fillStyle = `rgba(0, 255, 0, ${logAlpha})`;
                ctx.fillText(log.text, 30, logY + index * 20);
            }
        });
        
        // Boot progress
        if (bootProgress > 0) {
            const progressY = height - 50;
            const progressWidth = 300;
            const progressX = width / 2 - progressWidth / 2;
            
            // Progress bar background
            ctx.strokeStyle = '#790ECB';
            ctx.lineWidth = 2;
            ctx.strokeRect(progressX, progressY, progressWidth, 20);
            
            // Progress bar fill
            const fillWidth = (progressWidth - 4) * (bootProgress / 100);
            const progressGradient = ctx.createLinearGradient(progressX, 0, progressX + progressWidth, 0);
            progressGradient.addColorStop(0, '#790ECB');
            progressGradient.addColorStop(1, '#a855f7');
            ctx.fillStyle = progressGradient;
            ctx.fillRect(progressX + 2, progressY + 2, fillWidth, 16);
            
            // Progress text
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.floor(bootProgress)}%`, width / 2, progressY + 14);
        }
        
        // "Press ENTER" prompt
        if (bootProgress > 20) {
            const pulseAlpha = 0.5 + Math.sin(frame * 0.1) * 0.3;
            const pulseScale = 1 + Math.sin(frame * 0.1) * 0.05;
            
            ctx.save();
            ctx.translate(width / 2, height - 20);
            ctx.scale(pulseScale, pulseScale);
            
            ctx.fillStyle = `rgba(121, 14, 203, ${pulseAlpha})`;
            ctx.font = '16px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(bootComplete ? 'Press ENTER to Start' : 'Press ENTER to Skip Boot', 0, 0);
            
            ctx.restore();
        }
        
        // Scanline effect
        ctx.fillStyle = 'rgba(121, 14, 203, 0.03)';
        for (let i = 0; i < height; i += 4) {
            const y = (i + scanlineOffset) % height;
            ctx.fillRect(0, y, width, 2);
        }
        
        // Glitch effect (occasional)
        if (frame % 120 === 0 && Math.random() < 0.3) {
            const glitchY = Math.random() * height;
            const glitchHeight = 20 + Math.random() * 40;
            const glitchOffset = (Math.random() - 0.5) * 10;
            
            const imageData = ctx.getImageData(0, glitchY, width, glitchHeight);
            ctx.putImageData(imageData, glitchOffset, glitchY);
        }
        
        // Fade out overlay
        if (fadeOut) {
            ctx.fillStyle = `rgba(10, 10, 10, ${fadeAlpha})`;
            ctx.fillRect(0, 0, width, height);
        }
    }
    
    // ===== SPLASH LOOP =====
    function splashLoop() {
        if (!splashActive) return;
        
        update();
        render();
        
        requestAnimationFrame(splashLoop);
    }
    
    // Start the splash sequence
    splashLoop();
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initSplashScreen };
}
