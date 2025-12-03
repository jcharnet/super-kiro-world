// ===== DEPLOY GATE CLASS =====
export class DeployGate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 100;
    }
    
    render(ctx, camera, frame) {
        const renderX = this.x - camera.x;
        
        // Animated gate
        ctx.fillStyle = '#00ff00' + Math.floor(128 + Math.sin(frame * 0.1) * 127).toString(16).padStart(2, '0');
        ctx.fillRect(renderX, this.y, this.width, this.height);
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(renderX, this.y, this.width, this.height);
        
        // Checkmark
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(renderX + 15, this.y + 50);
        ctx.lineTo(renderX + 25, this.y + 60);
        ctx.lineTo(renderX + 45, this.y + 40);
        ctx.stroke();
    }
}
