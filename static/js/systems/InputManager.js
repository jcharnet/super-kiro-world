// ===== INPUT MANAGER =====
export class InputManager {
    constructor() {
        this.keys = {};
        this.setupListeners();
    }
    
    setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.keys[e.code] = false;
        });
    }
    
    isKeyPressed(key) {
        return this.keys[key] || false;
    }
    
    clearKey(key) {
        this.keys[key] = false;
    }
}
