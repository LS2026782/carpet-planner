class Door extends EventEmitter {
    constructor(x, y, width = CONFIG.GRID.SIZE * 3, roomId) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.roomId = roomId;
        this.initializeProperties();
    }

    initializeProperties() {
        this.swingDirection = 'inward';
        this.swingLeft = true;
        this.transitionType = 'standard';
    }

    draw(ctx, isSelected = false) {
        // Door frame
        ctx.strokeStyle = isSelected ? '#007bff' : '#000';
        ctx.lineWidth = 2;
        
        // Draw door opening
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.stroke();

        // Draw door swing arc
        ctx.beginPath();
        ctx.strokeStyle = '#666';
        ctx.setLineDash([5, 5]);
        
        const radius = this.width;
        const startAngle = this.swingLeft ? Math.PI : 0;
        const endAngle = this.swingLeft ? Math.PI/2 : Math.PI * 1.5;
        
        if (this.swingDirection === 'inward') {
            ctx.arc(
                this.swingLeft ? this.x : this.x + this.width, 
                this.y, 
                radius, 
                startAngle, 
                endAngle
            );
        } else {
            ctx.arc(
                this.swingLeft ? this.x : this.x + this.width, 
                this.y, 
                radius, 
                endAngle, 
                startAngle
            );
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw transition marker
        ctx.fillStyle = '#666';
        ctx.fillRect(this.x, this.y - 5, this.width, 3);
        
        // If selected, show controls
        if (isSelected) {
            this.drawControls(ctx);
        }
    }

    drawControls(ctx) {
        // Draw swing direction toggle
        ctx.fillStyle = '#007bff';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y - 15, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw swing side toggles
        ctx.fillRect(this.x - 10, this.y - 5, 5, 10);
        ctx.fillRect(this.x + this.width + 5, this.y - 5, 5, 10);
    }

    containsPoint(x, y) {
        const buffer = 10;
        return x >= this.x - buffer && 
               x <= this.x + this.width + buffer && 
               y >= this.y - buffer && 
               y <= this.y + buffer;
    }

    updateProperties(properties) {
        Object.entries(properties).forEach(([key, value]) => {
            if (this.hasOwnProperty(key)) {
                this[key] = value;
                this.emit('propertyUpdated', { key, value });
            }
        });
    }

    toggleSwingDirection() {
        this.swingDirection = this.swingDirection === 'inward' ? 'outward' : 'inward';
        this.emit('swingDirectionChanged', this.swingDirection);
    }

    toggleSwingSide() {
        this.swingLeft = !this.swingLeft;
        this.emit('swingSideChanged', this.swingLeft);
    }
} 
