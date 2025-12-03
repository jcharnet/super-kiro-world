// ===== SCORE MANAGER =====
export class ScoreManager {
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
