// ===== HUD RENDERING =====
export function renderHUD(ctx, score, highScore, lives, timeWarpsRemaining) {
    ctx.save(); // Save context state
    
    // Reset any transforms or clipping
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const leftMargin = 40;
    const lineHeight = 30;
    let yPos = 40;
    
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
        const iconStartX = leftMargin + 170; // Position after "Time Warps: " text
        for (let i = 0; i < timeWarpsRemaining; i++) {
            ctx.fillRect(iconStartX + i * 25, yPos - 15, 20, 20);
        }
    }
    
    ctx.restore(); // Restore context state
}

// ===== GAME OVER SCREEN =====
export function renderGameOver(ctx, canvasWidth, canvasHeight) {
    ctx.fillStyle = '#00000099';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('SYSTEM OUTAGE', canvasWidth / 2, canvasHeight / 2 - 40);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Courier New';
    ctx.fillText('Press R to Restart', canvasWidth / 2, canvasHeight / 2 + 20);
    ctx.textAlign = 'left';
}

// ===== LEVEL COMPLETE SCREEN =====
export function renderLevelComplete(ctx, canvasWidth, canvasHeight, currentLevel, levelStartTime, score, totalCollectibles, lives, scoreSubmitted) {
    const timeTaken = Math.floor((Date.now() - levelStartTime) / 1000);
    
    ctx.fillStyle = '#00000099';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Different message for Level 2 completion
    if (currentLevel === 2) {
        ctx.fillStyle = '#FFD700'; // Gold color for victory
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 VICTORY! 🎉', canvasWidth / 2, canvasHeight / 2 - 100);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 32px Courier New';
        ctx.fillText('All Levels Complete!', canvasWidth / 2, canvasHeight / 2 - 60);
    } else {
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('DEPLOY SUCCESSFUL!', canvasWidth / 2, canvasHeight / 2 - 80);
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Courier New';
    ctx.fillText(`Level: ${currentLevel}`, canvasWidth / 2, canvasHeight / 2 - 20);
    ctx.fillText(`Time: ${timeTaken}s`, canvasWidth / 2, canvasHeight / 2 + 5);
    ctx.fillText(`Score: ${score}`, canvasWidth / 2, canvasHeight / 2 + 30);
    ctx.fillText(`Collectibles: ${score} / ${totalCollectibles}`, canvasWidth / 2, canvasHeight / 2 + 55);
    ctx.fillText(`Lives Remaining: ${lives}`, canvasWidth / 2, canvasHeight / 2 + 80);
    
    ctx.font = '24px Courier New';
    ctx.fillText('Press R to Replay', canvasWidth / 2, canvasHeight / 2 + 120);
    
    if (!scoreSubmitted) {
        ctx.font = '16px Courier New';
        ctx.fillStyle = '#790ECB';
        ctx.fillText('Score saved to leaderboard!', canvasWidth / 2, canvasHeight / 2 + 150);
    }
    
    ctx.textAlign = 'left';
}

// ===== LEVEL TRANSITION SCREEN =====
export function renderLevelTransition(ctx, canvasWidth, canvasHeight, nextLevel) {
    ctx.fillStyle = '#000000dd';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.fillStyle = '#790ECB';
    ctx.font = 'bold 48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${nextLevel}`, canvasWidth / 2, canvasHeight / 2 - 20);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Courier New';
    ctx.fillText('Get Ready!', canvasWidth / 2, canvasHeight / 2 + 30);
    ctx.textAlign = 'left';
}
