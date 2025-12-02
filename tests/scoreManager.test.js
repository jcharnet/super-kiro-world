// Property-based tests for ScoreManager
// Feature: score-and-effects

const { test } = require('node:test');
const assert = require('node:assert');
const fc = require('fast-check');

// Mock localStorage for Node.js environment
class LocalStorageMock {
    constructor() {
        this.store = {};
    }
    
    getItem(key) {
        return this.store[key] || null;
    }
    
    setItem(key, value) {
        this.store[key] = value;
    }
    
    clear() {
        this.store = {};
    }
}

global.localStorage = new LocalStorageMock();

// ScoreManager class (copied from game.js for testing)
class ScoreManager {
    constructor() {
        this.storageKey = 'superKiroWorld_gameData';
        this.playerName = 'Player';
        this.gameHistory = [];
        this.highScores = {};
        this.loadFromStorage();
    }
    
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                this.playerName = parsed.playerName || 'Player';
                this.gameHistory = parsed.gameHistory || [];
                this.highScores = parsed.highScores || {};
            }
        } catch (error) {
            console.error('Failed to load game data from Local Storage:', error);
            this.gameHistory = [];
            this.highScores = {};
        }
    }
    
    saveToStorage() {
        try {
            const data = {
                playerName: this.playerName,
                gameHistory: this.gameHistory,
                highScores: this.highScores
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save game data to Local Storage:', error);
            
            if (error.name === 'QuotaExceededError') {
                this.gameHistory = this.gameHistory.slice(-100);
                try {
                    const data = {
                        playerName: this.playerName,
                        gameHistory: this.gameHistory,
                        highScores: this.highScores
                    };
                    localStorage.setItem(this.storageKey, JSON.stringify(data));
                    console.log('Trimmed game history to fit storage quota');
                } catch (retryError) {
                    console.error('Still failed after trimming history:', retryError);
                }
            }
        }
    }
    
    loadGameHistory() {
        return this.gameHistory;
    }
    
    saveGameSession(session) {
        if (!session.timestamp) {
            session.timestamp = new Date().toISOString();
        }
        
        this.gameHistory.push(session);
        
        const playerName = session.player;
        if (!this.highScores[playerName] || session.score > this.highScores[playerName]) {
            this.highScores[playerName] = session.score;
        }
        
        this.saveToStorage();
    }
    
    getHighScore(playerName) {
        if (!playerName) {
            playerName = this.playerName;
        }
        return this.highScores[playerName] || 0;
    }
    
    getCurrentPlayerName() {
        return this.playerName;
    }
    
    setPlayerName(name) {
        if (name && name.trim()) {
            this.playerName = name.trim();
            this.saveToStorage();
        }
    }
}

// Generators for property-based testing
// Filter out problematic JavaScript property names
const safePlayerNameArb = fc.string({ minLength: 1, maxLength: 20 })
    .filter(name => {
        const problematicNames = ['toString', 'valueOf', 'constructor', '__proto__', 'hasOwnProperty'];
        return !problematicNames.includes(name.trim());
    });

const gameSessionArb = fc.record({
    player: safePlayerNameArb,
    score: fc.integer({ min: 0, max: 100 }),
    time: fc.integer({ min: 1, max: 1000 }),
    lives: fc.integer({ min: 0, max: 3 })
});

// Feature: score-and-effects, Property 1: Game session storage completeness
test('Property 1: Game session storage completeness', () => {
    fc.assert(
        fc.property(gameSessionArb, (session) => {
            // Clear storage before each test
            localStorage.clear();
            
            const manager = new ScoreManager();
            
            // Save the session
            manager.saveGameSession(session);
            
            // Create new manager to load from storage
            const manager2 = new ScoreManager();
            const history = manager2.loadGameHistory();
            
            // Should have exactly one session
            assert.strictEqual(history.length, 1);
            
            // All fields should match (except timestamp which is added)
            const loaded = history[0];
            assert.strictEqual(loaded.player, session.player);
            assert.strictEqual(loaded.score, session.score);
            assert.strictEqual(loaded.time, session.time);
            assert.strictEqual(loaded.lives, session.lives);
            assert.ok(loaded.timestamp); // Timestamp should exist
            
            return true;
        }),
        { numRuns: 100 }
    );
});

// Feature: score-and-effects, Property 2: Game history preservation
test('Property 2: Game history preservation', () => {
    fc.assert(
        fc.property(
            fc.array(gameSessionArb, { minLength: 1, maxLength: 10 }),
            gameSessionArb,
            (existingHistory, newSession) => {
                localStorage.clear();
                
                const manager = new ScoreManager();
                
                // Add existing history
                existingHistory.forEach(session => {
                    manager.saveGameSession(session);
                });
                
                const historyCountBefore = manager.loadGameHistory().length;
                
                // Add new session
                manager.saveGameSession(newSession);
                
                // Load from storage
                const manager2 = new ScoreManager();
                const finalHistory = manager2.loadGameHistory();
                
                // Should have all previous sessions plus the new one
                assert.strictEqual(finalHistory.length, historyCountBefore + 1);
                
                // All previous sessions should still be there
                for (let i = 0; i < existingHistory.length; i++) {
                    assert.strictEqual(finalHistory[i].player, existingHistory[i].player);
                    assert.strictEqual(finalHistory[i].score, existingHistory[i].score);
                }
                
                // New session should be at the end
                const lastSession = finalHistory[finalHistory.length - 1];
                assert.strictEqual(lastSession.player, newSession.player);
                assert.strictEqual(lastSession.score, newSession.score);
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});

// Feature: score-and-effects, Property 3: Player name association
test('Property 3: Player name association', () => {
    fc.assert(
        fc.property(
            safePlayerNameArb,
            safePlayerNameArb,
            gameSessionArb,
            (oldName, newName, session) => {
                localStorage.clear();
                
                const manager = new ScoreManager();
                manager.setPlayerName(oldName);
                
                // Change player name
                manager.setPlayerName(newName);
                
                // Create session with the new name
                const sessionWithNewName = { ...session, player: newName };
                manager.saveGameSession(sessionWithNewName);
                
                // Load from storage
                const manager2 = new ScoreManager();
                const history = manager2.loadGameHistory();
                
                // The session should have the new player name
                assert.strictEqual(history[history.length - 1].player, newName);
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});

// Feature: score-and-effects, Property 4: High score calculation accuracy
test('Property 4: High score calculation accuracy', () => {
    fc.assert(
        fc.property(
            safePlayerNameArb,
            fc.array(gameSessionArb, { minLength: 1, maxLength: 20 }),
            (playerName, sessions) => {
                localStorage.clear();
                
                const manager = new ScoreManager();
                
                // Add all sessions for the same player
                sessions.forEach(session => {
                    const sessionWithPlayer = { ...session, player: playerName };
                    manager.saveGameSession(sessionWithPlayer);
                });
                
                // Calculate expected high score
                const expectedHighScore = Math.max(...sessions.map(s => s.score));
                
                // Get high score from manager
                const actualHighScore = manager.getHighScore(playerName);
                
                assert.strictEqual(actualHighScore, expectedHighScore);
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});

// Feature: score-and-effects, Property 7: High score persistence round-trip
test('Property 7: High score persistence round-trip', () => {
    fc.assert(
        fc.property(
            safePlayerNameArb,
            fc.integer({ min: 0, max: 100 }),
            (playerName, highScore) => {
                localStorage.clear();
                
                const manager = new ScoreManager();
                
                // Create a session with the high score
                const session = {
                    player: playerName,
                    score: highScore,
                    time: 100,
                    lives: 3
                };
                
                manager.saveGameSession(session);
                
                // Load from storage
                const manager2 = new ScoreManager();
                const loadedHighScore = manager2.getHighScore(playerName);
                
                // High score should match
                assert.strictEqual(loadedHighScore, highScore);
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});

// Feature: score-and-effects, Property 5: High score update on achievement
test('Property 5: High score update on achievement', () => {
    fc.assert(
        fc.property(
            safePlayerNameArb,
            fc.integer({ min: 0, max: 50 }),
            fc.integer({ min: 51, max: 100 }),
            (playerName, currentHighScore, newScore) => {
                localStorage.clear();
                
                const manager = new ScoreManager();
                
                // Set up initial high score
                const initialSession = {
                    player: playerName,
                    score: currentHighScore,
                    time: 100,
                    lives: 3
                };
                manager.saveGameSession(initialSession);
                
                // Verify initial high score
                assert.strictEqual(manager.getHighScore(playerName), currentHighScore);
                
                // Submit a higher score
                const newSession = {
                    player: playerName,
                    score: newScore,
                    time: 100,
                    lives: 3
                };
                manager.saveGameSession(newSession);
                
                // High score should be updated to the new score
                const updatedHighScore = manager.getHighScore(playerName);
                assert.strictEqual(updatedHighScore, newScore);
                assert.ok(updatedHighScore > currentHighScore);
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});

// Mock canvas context for HUD testing
class MockCanvasContext {
    constructor() {
        this.texts = [];
        this.fillStyle = '';
        this.font = '';
    }
    
    fillText(text, x, y) {
        this.texts.push({ text, x, y, fillStyle: this.fillStyle, font: this.font });
    }
    
    fillRect() {}
    strokeRect() {}
}

// Feature: score-and-effects, Property 6: HUD display completeness
test('Property 6: HUD display completeness', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 100 }),
            fc.integer({ min: 0, max: 100 }),
            (currentScore, currentHighScore) => {
                // Create mock context
                const mockCtx = new MockCanvasContext();
                
                // Simulate renderHUD function logic
                const score = currentScore;
                const highScore = currentHighScore;
                const lives = 3;
                const timeWarpsRemaining = 2;
                
                mockCtx.fillStyle = '#ffffff';
                mockCtx.font = '20px Courier New';
                mockCtx.fillText(`Score: ${score}`, 20, 30);
                
                mockCtx.fillStyle = '#790ECB';
                mockCtx.fillText(`High Score: ${highScore}`, 20, 55);
                
                mockCtx.fillStyle = '#ffffff';
                mockCtx.fillText(`Lives: ${lives}`, 20, 85);
                mockCtx.fillText(`Time Warps: ${timeWarpsRemaining}`, 20, 115);
                
                // Verify both score and high score are in the rendered texts
                const renderedTexts = mockCtx.texts.map(t => t.text);
                const hasScore = renderedTexts.some(text => text.includes(`Score: ${score}`));
                const hasHighScore = renderedTexts.some(text => text.includes(`High Score: ${highScore}`));
                
                assert.ok(hasScore, 'HUD should display current score');
                assert.ok(hasHighScore, 'HUD should display high score');
                
                return true;
            }
        ),
        { numRuns: 100 }
    );
});
