// ===== SCREEN SHAKE SYSTEM =====
export class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
        this.maxDuration = 0;
    }
    
    trigger(intensity, duration) {
        // Only override if new shake is stronger
        if (intensity > this.intensity) {
            this.intensity = intensity;
            this.duration = duration;
            this.maxDuration = duration;
        }
    }
    
    update() {
        if (this.duration > 0) {
            this.duration -= 1 / 60; // Assuming 60 FPS
            
            // Decay intensity over time
            const progress = this.duration / this.maxDuration;
            this.intensity *= progress;
            
            if (this.duration <= 0) {
                this.intensity = 0;
                this.duration = 0;
            }
        }
    }
    
    getOffset() {
        if (this.intensity <= 0) {
            return { x: 0, y: 0 };
        }
        
        // Use sine wave for smooth shake
        const angle = Math.random() * Math.PI * 2;
        const magnitude = this.intensity;
        
        return {
            x: Math.cos(angle) * magnitude,
            y: Math.sin(angle) * magnitude
        };
    }
}
