/**
 * SUPER KIRO WORLD - GAME ENGINE (Refactored)
 * 
 * This is the main entry point for the game.
 * All game logic has been modularized into separate files.
 */

import { Game } from './js/Game.js';

// ===== GAME INITIALIZATION =====
let game;

function startMainGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Create and start the game
    game = new Game(canvas, ctx);
    game.start();
}

function init() {
    const canvas = document.getElementById('gameCanvas');
    
    // Initialize splash screen, then start game
    // The splash.js file is loaded separately in the HTML and exports to window
    if (typeof window.initSplashScreen !== 'undefined') {
        window.initSplashScreen(canvas, startMainGame);
    } else {
        // If splash screen isn't available, start game directly
        console.warn('Splash screen not found, starting game directly');
        startMainGame();
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already ready
    init();
}
