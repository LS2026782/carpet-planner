<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Carpet Cutting Layout Planner</title>
    <style>
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
#canvas-container {
    border: 2px solid #ccc;
    margin: 20px 0;
    overflow: auto;
    max-width: 100%;
    height: 800px;
    position: relative;
}

/* Cursor styles for different modes */
#canvas-container.mode-draw {
    cursor: crosshair;
}

#canvas-container.mode-pan {
    cursor: grab;
}

#canvas-container.mode-pan:active {
    cursor: grabbing;
}

#canvas-container.mode-drop {
    cursor: cell;
}

#canvas-container.mode-door {
    cursor: pointer;
}

canvas {
    background: white;
    transform-origin: 0 0;
}
        
        .toolbar {
            padding: 10px;
            background: #f5f5f5;
            margin-bottom: 10px;
        }
        
        .toolbar button {
            padding: 8px 15px;
            margin-right: 10px;
            cursor: pointer;
        }
        
        .toolbar button.active {
            background: #007bff;
            color: white;
            border: none;
        }
        
        .calculations-panel {
            background: #e8f4ff;
            padding: 15px;
            margin: 10px 0;
        }

        .settings-panel {
            background: #f5f5f5;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
        }

        .settings-panel input {
            width: 60px;
            margin: 0 10px;
        }

        .efficiency-bar {
            width: 100%;
            height: 20px;
            background: #eee;
            margin: 5px 0;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .efficiency-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            transition: width 0.3s ease;
        }
        
        .wastage-indicator {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            margin-left: 10px;
            background: #f0f0f0;
        }

        .measurement-text {
            font-family: Arial, sans-serif;
            font-size: 12px;
            fill: #666;
        }

.room-panel {
    background: #fff;
    border: 1px solid #ddd;
    padding: 15px;
    margin: 10px 0;
    border-radius: 5px;
}

.room-list {
    max-height: 300px;
    overflow-y: auto;
    margin: 10px 0;
}

.room-item {
    padding: 10px;
    margin: 5px 0;
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 3px;
    cursor: pointer;
}

.room-item.selected {
    background: #e3f2fd;
    border-color: #2196f3;
}

.room-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.room-details {
    font-size: 0.9em;
    color: #666;
    margin-top: 5px;
}

.room-label {
    position: absolute;
    background: rgba(255, 255, 255, 0.9);
    padding: 2px 6px;
    border: 1px solid #000;
    border-radius: 3px;
    font-size: 12px;
    pointer-events: none;
}

.edit-room-form {
    margin-top: 10px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 5px;
}

.edit-room-form input {
    margin: 5px 0;
    padding: 5px;
}

    </style>
</head>
<body>
    <div class="container">
        <h1>Carpet Cutting Layout Planner</h1>

        <div class="settings-panel">
    <label>
        Carpet Roll Width (feet):
        <input type="number" id="carpetWidth" value="12" min="6" max="15" step="0.5">
    </label>
    <label style="margin-left: 20px;">
        Drop Direction:
        <select id="dropDirection">
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
        </select>
    </label>
</div>
        
        <div class="toolbar">
    <div class="toolbar-group">
        <button id="drawMode" title="Draw Room (D)">Draw Mode</button>
        <button id="dropMode" title="Add Drop Lines (L)">Drop Lines</button>
        <button id="doorMode" title="Add Doors (O)">Add Doors</button>
    </div>
    <div class="toolbar-group">
        <button id="undo" title="Undo (Ctrl+Z)">↶ Undo</button>
        <button id="redo" title="Redo (Ctrl+Y)">↷ Redo</button>
    </div>
    <div class="toolbar-group">
        <button id="saveProject" title="Save Project (Ctrl+S)">💾 Save</button>
        <button id="loadProject" title="Load Project">📂 Load</button>
    </div>
    <div class="toolbar-group">
        <button id="clearAll" title="Clear All">Clear All</button>
        <button id="clearDrops" title="Clear Drop Lines">Clear Drops</button>
        <button id="rotateDrops" title="Rotate Drop Lines">Rotate Drops ↻</button>
    </div>
    <div class="toolbar-group">
        <button id="zoomOut" title="Zoom Out">−</button>
        <button id="resetZoom" title="Reset Zoom">Reset View</button>
    </div>
</div>

<style>
.toolbar {
    display: flex;
    gap: 10px;
    padding: 10px;
    background: #f5f5f5;
    margin-bottom: 10px;
    border-radius: 5px;
    flex-wrap: wrap;
}

.toolbar-group {
    display: flex;
    gap: 5px;
    padding: 0 10px;
    border-right: 1px solid #ddd;
}

.toolbar-group:last-child {
    border-right: none;
}

.toolbar button {
    padding: 8px 15px;
    border: 1px solid #ccc;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.toolbar button:hover {
    background: #e9ecef;
    border-color: #adb5bd;
}

.toolbar button.active {
    background: #007bff;
    color: white;
    border-color: #0056b3;
}

.toolbar button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>

<div class="layout-container" style="display: flex; gap: 20px;">
        <div style="flex: 1;">
            <div id="canvas-container">
                <canvas id="carpetCanvas" width="4500" height="4500"></canvas>
            </div>
        </div>
        
        <div class="room-panel" style="width: 300px;">
    <h3>Rooms</h3>
    <button id="addRoom">Add New Room</button>
    <div class="room-list" id="roomList">
        <!-- Room items will be added here dynamically -->
    </div>
    
    <div id="roomEditForm" class="edit-room-form" style="display: none;">
        <h4>Edit Room</h4>
        <input type="text" id="roomName" placeholder="Room Name">
        <button id="saveRoom">Save</button>
        <button id="deleteRoom">Delete</button>
    </div>

    <div id="doorControls" class="door-controls" style="display: none;">
        <h4>Door Properties</h4>
        <div>
            <label>Width (feet):
                <input type="number" id="doorWidth" value="3" min="2" max="6" step="0.5">
            </label>
        </div>
        <div>
            <label>Transition Type:
                <select id="transitionType">
                    <option value="standard">Standard</option>
                    <option value="reducer">Reducer</option>
                    <option value="metal">Metal Strip</option>
                </select>
            </label>
        </div>
        <button id="deleteDoor">Delete Door</button>
    </div>

    <!-- Add the new roomStyle div here -->
    <div id="roomStyle" class="room-style" style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
        <h4>Room Style</h4>
        <div>
            <label>Room Color:
                <input type="color" id="roomColor" value="#f0f0f0">
            </label>
        </div>
        <div style="margin-top: 10px;">
            <label>Carpet Type:
                <select id="carpetType">
                    <option value="standard">Standard</option>
                    <option value="plush">Plush</option>
                    <option value="berber">Berber</option>
                    <option value="pattern">Pattern</option>
                </select>
            </label>
        </div>
        <div style="margin-top: 10px;">
            <label>Carpet Width:
<select id="roomCarpetWidth"> <!-- Changed from carpetWidth -->
    <option value="12">12 ft</option>
    <option value="13.5">13.5 ft</option>
    <option value="15">15 ft</option>
</select>
            </label>
        </div>
        <div style="margin-top: 10px;">
            <label>Pile Direction:
                <select id="pileDirection">
                    <option value="north">North</option>
                    <option value="south">South</option>
                    <option value="east">East</option>
                    <option value="west">West</option>
                </select>
            </label>
        </div>
    </div>
</div>


        </div>
    </div>
        
        <div class="calculations-panel">
            <h3>Area Calculations</h3>
            <p>Room Area: <span id="roomArea">0</span> sq ft</p>
            <p>Carpet Required: <span id="carpetRequired">0</span> sq ft</p>
            <p>Wastage: <span id="carpetWastage">0</span> sq ft 
                <span id="wastageIndicator" class="wastage-indicator">0%</span>
            </p>
            <p>Efficiency:</p>
            <div class="efficiency-bar">
                <div id="efficiencyFill" class="efficiency-fill" style="width: 0%"></div>
            </div>
            <p>Number of Drops: <span id="dropCount">0</span></p>
            <p>Total Length Needed: <span id="totalLength">0</span> ft</p>
        </div>
    </div>

<script>
// Constants and Configuration
const CONFIG = {
    GRID: {
        MAJOR_COLOR: "#ccc",
        MINOR_COLOR: "#eee",
        SIZE: 60, // 1 foot = 60 pixels
        QUARTER_SIZE: 15
    },
    CANVAS: {
        DEFAULT_WIDTH: 4500,
        DEFAULT_HEIGHT: 4500,
        TEXT_SIZE: 10
    },
    ZOOM: {
        MIN: 0.3,
        MAX: 3,
        STEP: 0.1
    },
    PIXELS_PER_FOOT: 60
};

const MAJOR_GRID_COLOR = "#ccc";
const MINOR_GRID_COLOR = "#eee";
const MEASUREMENT_TEXT_SIZE = 10;
const GRID_SIZE = 60; // 1 foot = 60 pixels
const QUARTER_SIZE = GRID_SIZE / 4;
const PIXELS_PER_FOOT = GRID_SIZE;

// Canvas Management
class CanvasManager {
    constructor(canvasId, containerId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById(containerId);
        
        // View state
        this.scale = 1;
        this.targetScale = 1;
        this.currentScale = 1;
        this.isZooming = false;
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Pan state
        this.isPanning = false;
        this.lastPanX = 0;
        this.lastPanY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Performance optimization
        this.renderRequested = false;
        this.lastRenderTime = 0;
        this.minRenderInterval = 1000 / 60; // 60 FPS cap

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Zoom handling
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

        // Pan handling
        this.container.addEventListener('mousedown', this.startPan.bind(this));
        window.addEventListener('mousemove', this.handlePan.bind(this));
        window.addEventListener('mouseup', this.stopPan.bind(this));

        // Track mouse position
        this.canvas.addEventListener('mousemove', (e) => {
            this.lastMouseX = e.offsetX;
            this.lastMouseY = e.offsetY;
        });
    }

    handleWheel(e) {
        e.preventDefault();
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.targetScale = Math.min(Math.max(this.scale * zoomFactor, 0.1), 5);
        
        if (!this.isZooming) {
            this.isZooming = true;
            this.animateZoom();
        }
        
        this.offsetX = mouseX - (mouseX - this.offsetX) * zoomFactor;
        this.offsetY = mouseY - (mouseY - this.offsetY) * zoomFactor;
    }

    startPan(e) {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            this.isPanning = true;
            this.lastPanX = e.clientX;
            this.lastPanY = e.clientY;
            this.container.style.cursor = 'grabbing';
            e.preventDefault();
        }
    }

    handlePan(e) {
        if (!this.isPanning) return;
        
        const dx = e.clientX - this.lastPanX;
        const dy = e.clientY - this.lastPanY;
        
        this.container.scrollLeft -= dx;
        this.container.scrollTop -= dy;
        
        this.lastPanX = e.clientX;
        this.lastPanY = e.clientY;
        
        this.requestRender();
    }

    stopPan() {
        this.isPanning = false;
        this.container.style.cursor = 'grab';
    }

    animateZoom() {
        if (Math.abs(this.currentScale - this.targetScale) > 0.01) {
            this.currentScale += (this.targetScale - this.currentScale) * 0.1;
            this.scale = this.currentScale;
            this.requestRender();
            requestAnimationFrame(this.animateZoom.bind(this));
        } else {
            this.isZooming = false;
        }
    }

    requestRender() {
        if (!this.renderRequested) {
            this.renderRequested = true;
            requestAnimationFrame(() => {
                const now = performance.now();
                if (now - this.lastRenderTime >= this.minRenderInterval) {
                    this.render();
                    this.lastRenderTime = now;
                }
                this.renderRequested = false;
            });
        }
    }

    render() {
        this.ctx.save();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply transformations
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scale, this.scale);
        
        // Draw content
        this.drawGrid();
        this.drawRooms();
        this.drawDoors();
        
        this.ctx.restore();
        
        // Update UI
        updateCalculations();
        updateRoomList();
    }

    drawGrid() {
        const width = this.canvas.width / this.scale;
        const height = this.canvas.height / this.scale;
        
        // Calculate visible grid area
        const startX = Math.floor(-this.offsetX / this.scale / GRID_SIZE) * GRID_SIZE;
        const startY = Math.floor(-this.offsetY / this.scale / GRID_SIZE) * GRID_SIZE;
        const endX = Math.ceil((width - this.offsetX / this.scale) / GRID_SIZE) * GRID_SIZE;
        const endY = Math.ceil((height - this.offsetY / this.scale) / GRID_SIZE) * GRID_SIZE;

        // Draw minor grid lines if zoomed in enough
        if (this.scale > 0.5) {
            this.ctx.strokeStyle = MINOR_GRID_COLOR;
            this.ctx.lineWidth = 0.5;
            
            const quarterSize = GRID_SIZE / 4;
            for (let x = startX; x <= endX; x += quarterSize) {
                if (x % GRID_SIZE !== 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, startY);
                    this.ctx.lineTo(x, endY);
                    this.ctx.stroke();
                }
            }
            
            for (let y = startY; y <= endY; y += quarterSize) {
                if (y % GRID_SIZE !== 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(startX, y);
                    this.ctx.lineTo(endX, y);
                    this.ctx.stroke();
                }
            }
        }

        // Draw major grid lines
        this.ctx.strokeStyle = MAJOR_GRID_COLOR;
        this.ctx.lineWidth = 1;
        
        for (let x = startX; x <= endX; x += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
            
            if (this.scale > 0.3) {
                this.ctx.fillStyle = "#666";
                this.ctx.font = `${MEASUREMENT_TEXT_SIZE}px Arial`;
                this.ctx.fillText(`${(x/GRID_SIZE)}′`, x + 2, MEASUREMENT_TEXT_SIZE);
            }
        }
        
        for (let y = startY; y <= endY; y += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
            
            if (this.scale > 0.3) {
                this.ctx.fillText(`${(y/GRID_SIZE)}′`, 2, y + MEASUREMENT_TEXT_SIZE);
            }
        }
    }

    drawRooms() {
        rooms.forEach(room => {
            const isSelected = room.id === selectedRoomId;
            
            // Draw drops for this room
            room.drops.forEach(drop => {
                this.drawDropLine(drop.position, drop.isVertical);
            });
            
            // Draw rectangles for this room
            room.rectangles.forEach(rect => {
                this.drawRectangle(rect, room, isSelected);
            });
            
            // Draw room label for first rectangle
            if (room.rectangles.length > 0) {
                const rect = room.rectangles[0];
                this.drawRoomLabel(room.name, rect.x + rect.width/2, rect.y + rect.height/2);
            }
        });
    }

    drawDoors() {
        doors.forEach(door => door.draw(this.ctx, door === selectedDoor));
    }

    // Utility methods
    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - this.offsetX) / this.scale,
            y: (e.clientY - rect.top - this.offsetY) / this.scale
        };
    }

    snapToGrid(value) {
        return Math.round(value / GRID_SIZE) * GRID_SIZE;
    }
}

// Error Management
class ErrorManager {
    static #instance;
    #errorContainer;
    #timeout;

    constructor() {
        if (ErrorManager.#instance) {
            return ErrorManager.#instance;
        }
        
        this.createErrorContainer();
        ErrorManager.#instance = this;
    }

    createErrorContainer() {
        this.#errorContainer = document.createElement('div');
        this.#errorContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 350px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(this.#errorContainer);
    }

    showError(message, type = 'error') {
        const alert = document.createElement('div');
        alert.style.cssText = `
            padding: 15px 20px;
            border-radius: 4px;
            margin-bottom: 10px;
            animation: slideIn 0.3s ease-out;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            background: ${type === 'error' ? '#ff5252' : '#ffb74d'};
            color: white;
        `;

        const messageText = document.createElement('span');
        messageText.textContent = message;
        alert.appendChild(messageText);

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0 0 0 10px;
            margin: 0;
        `;
        closeBtn.onclick = () => this.#errorContainer.removeChild(alert);
        alert.appendChild(closeBtn);

        this.#errorContainer.appendChild(alert);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (this.#errorContainer.contains(alert)) {
                alert.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (this.#errorContainer.contains(alert)) {
                        this.#errorContainer.removeChild(alert);
                    }
                }, 300);
            }
        }, 5000);
    }

    static getInstance() {
        if (!ErrorManager.#instance) {
            ErrorManager.#instance = new ErrorManager();
        }
        return ErrorManager.#instance;
    }
}

// Add error handling styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Room Management
class RoomManager {
    static #instance;
    #rooms;
    #selectedRoomId;
    #nextRoomId;

    constructor() {
        if (RoomManager.#instance) {
            return RoomManager.#instance;
        }
        
        this.#rooms = [];
        this.#selectedRoomId = null;
        this.#nextRoomId = 1;
        RoomManager.#instance = this;
    }

    static getInstance() {
        if (!RoomManager.#instance) {
            RoomManager.#instance = new RoomManager();
        }
        return RoomManager.#instance;
    }

    get rooms() { return [...this.#rooms]; }
    get selectedRoomId() { return this.#selectedRoomId; }
    get selectedRoom() { return this.#rooms.find(r => r.id === this.#selectedRoomId); }

    addRoom(name = null) {
        try {
            const room = new Room(this.#nextRoomId++, name || `Room ${this.#nextRoomId}`);
            this.#rooms.push(room);
            this.#selectedRoomId = room.id;
            history.pushState();
            return room;
        } catch (error) {
            errorManager.showError(`Failed to add room: ${error.message}`);
            return null;
        }
    }

    deleteRoom(id) {
        try {
            // Remove associated doors
            doors = doors.filter(door => door.roomId !== id);
            
            // Remove room connections
            roomConnections = roomConnections.filter(conn => 
                conn.room1Id !== id && conn.room2Id !== id
            );
            
            // Remove room
            this.#rooms = this.#rooms.filter(r => r.id !== id);
            
            // Update selection
            if (this.#selectedRoomId === id) {
                this.#selectedRoomId = this.#rooms.length > 0 ? this.#rooms[0].id : null;
            }
            
            history.pushState();
            return true;
        } catch (error) {
            errorManager.showError(`Failed to delete room: ${error.message}`);
            return false;
        }
    }

    selectRoom(id) {
        try {
            const room = this.#rooms.find(r => r.id === id);
            if (!room) {
                throw new Error('Room not found');
            }
            
            this.#selectedRoomId = id;
            
            // Update UI controls
            document.getElementById('roomName').value = room.name;
            document.getElementById('roomEditForm').style.display = 'block';
            document.getElementById('roomStyle').style.display = 'block';
            
            // Update room style controls
            document.getElementById('roomColor').value = room.color;
            document.getElementById('carpetType').value = room.carpetType;
            document.getElementById('roomCarpetWidth').value = room.carpetWidth;
            document.getElementById('pileDirection').value = room.pileDirection;
            
            return true;
        } catch (error) {
            errorManager.showError(`Failed to select room: ${error.message}`);
            document.getElementById('roomEditForm').style.display = 'none';
            document.getElementById('roomStyle').style.display = 'none';
            return false;
        }
    }

    updateRoom(id, properties) {
        try {
            const room = this.#rooms.find(r => r.id === id);
            if (!room) {
                throw new Error('Room not found');
            }

            // Validate properties before updating
            if (properties.name !== undefined) {
                if (!properties.name || properties.name.trim().length === 0) {
                    throw new Error('Room name cannot be empty');
                }
            }
            if (properties.carpetWidth !== undefined) {
                const width = parseFloat(properties.carpetWidth);
                if (isNaN(width) || width < 6 || width > 15) {
                    throw new Error('Carpet width must be between 6 and 15 feet');
                }
            }

            room.updateProperties(properties);
            history.pushState();
            return true;
        } catch (error) {
            errorManager.showError(`Failed to update room: ${error.message}`);
            return false;
        }
    }

    addRectangleToRoom(roomId, rect) {
        try {
            const room = this.#rooms.find(r => r.id === roomId);
            if (!room) {
                throw new Error('Room not found');
            }

            if (!Validator.validateRectangle(rect)) {
                throw new Error('Invalid rectangle properties');
            }

            if (!room.addRectangle(rect)) {
                throw new Error('Failed to add rectangle to room');
            }

            history.pushState();
            return true;
        } catch (error) {
            errorManager.showError(`Failed to add rectangle: ${error.message}`);
            return false;
        }
    }

    addDropToRoom(roomId, position, isVertical) {
        try {
            const room = this.#rooms.find(r => r.id === roomId);
            if (!room) {
                throw new Error('Room not found');
            }

            // Check if drop line already exists
            const existingDrop = room.drops.find(d => d.position === position);
            if (existingDrop) {
                return false;
            }

            room.drops.push({ position, isVertical });
            room.calculateCarpetUsage();
            history.pushState();
            return true;
        } catch (error) {
            errorManager.showError(`Failed to add drop line: ${error.message}`);
            return false;
        }
    }

    clearDrops(roomId) {
        try {
            const room = this.#rooms.find(r => r.id === roomId);
            if (!room) {
                throw new Error('Room not found');
            }

            room.drops = [];
            room.calculateCarpetUsage();
            history.pushState();
            return true;
        } catch (error) {
            errorManager.showError(`Failed to clear drops: ${error.message}`);
            return false;
        }
    }

    rotateDrops(roomId) {
        try {
            const room = this.#rooms.find(r => r.id === roomId);
            if (!room || room.drops.length === 0) {
                return false;
            }

            room.drops.forEach(drop => {
                drop.isVertical = !drop.isVertical;
            });
            room.calculateCarpetUsage();
            history.pushState();
            return true;
        } catch (error) {
            errorManager.showError(`Failed to rotate drops: ${error.message}`);
            return false;
        }
    }

    restoreFromState(state) {
        try {
            this.#rooms = state.rooms.map(roomData => {
                const room = new Room(roomData.id, roomData.name);
                Object.assign(room, roomData);
                return room;
            });
            
            this.#selectedRoomId = state.selectedRoomId;
            this.#nextRoomId = Math.max(...this.#rooms.map(r => r.id), 0) + 1;
            return true;
        } catch (error) {
            errorManager.showError(`Failed to restore rooms: ${error.message}`);
            return false;
        }
    }

    clear() {
        this.#rooms = [];
        this.#selectedRoomId = null;
        this.#nextRoomId = 1;
        return true;
    }
}

// Door Management
class DoorManager {
    static #instance;
    #doors;
    #selectedDoor;
    #defaultWidth;

    constructor() {
        if (DoorManager.#instance) {
            return DoorManager.#instance;
        }
        
        this.#doors = [];
        this.#selectedDoor = null;
        this.#defaultWidth = CONFIG.GRID.SIZE * 3;
        DoorManager.#instance = this;
    }

    static getInstance() {
        if (!DoorManager.#instance) {
            DoorManager.#instance = new DoorManager();
        }
        return DoorManager.#instance;
    }

    get doors() { return [...this.#doors]; }
    get selectedDoor() { return this.#selectedDoor; }
    get defaultWidth() { return this.#defaultWidth; }

    addDoor(x, y, roomId) {
        try {
            if (!roomId) {
                throw new Error('Room ID is required to add a door');
            }

            const room = roomManager.rooms.find(r => r.id === roomId);
            if (!room) {
                throw new Error('Room not found');
            }

            const door = new Door(x, y, this.#defaultWidth, roomId);
            
            // Validate door properties and placement
            validationManager.validateDoor(door, room);

            this.#doors.push(door);
            this.#selectedDoor = door;
            history.pushState();
            return door;
        } catch (error) {
            errorManager.showError(`Failed to add door: ${error.message}`);
            return null;
        }
    }

    deleteDoor(door) {
        try {
            this.#doors = this.#doors.filter(d => d !== door);
            if (this.#selectedDoor === door) {
                this.#selectedDoor = null;
            }
            history.pushState();
            return true;
        } catch (error) {
            errorManager.showError(`Failed to delete door: ${error.message}`);
            return false;
        }
    }

    selectDoor(x, y, roomId) {
        try {
            this.#selectedDoor = this.#doors.find(door => 
                door.roomId === roomId && 
                door.containsPoint(x, y)
            );
            return this.#selectedDoor;
        } catch (error) {
            errorManager.showError(`Failed to select door: ${error.message}`);
            return null;
        }
    }

    updateDoorProperty(door, property, value) {
        try {
            if (!door) {
                throw new Error('No door selected');
            }

            switch (property) {
                case 'width':
                    const width = parseFloat(value) * CONFIG.PIXELS_PER_FOOT;
                    if (isNaN(width) || width < CONFIG.GRID.SIZE * 2 || width > CONFIG.GRID.SIZE * 6) {
                        throw new Error('Door width must be between 2 and 6 feet');
                    }
                    door.width = width;
                    break;
                case 'transitionType':
                    if (!['standard', 'reducer', 'metal'].includes(value)) {
                        throw new Error('Invalid transition type');
                    }
                    door.transitionType = value;
                    break;
                case 'swingDirection':
                    if (!['inward', 'outward'].includes(value)) {
                        throw new Error('Invalid swing direction');
                    }
                    door.swingDirection = value;
                    break;
                case 'swingLeft':
                    door.swingLeft = Boolean(value);
                    break;
                default:
                    throw new Error(`Unknown door property: ${property}`);
            }

            history.pushState();
            return true;
        } catch (error) {
            errorManager.showError(`Failed to update door: ${error.message}`);
            return false;
        }
    }

    deleteDoorsForRoom(roomId) {
        try {
            this.#doors = this.#doors.filter(door => door.roomId !== roomId);
            if (this.#selectedDoor?.roomId === roomId) {
                this.#selectedDoor = null;
            }
            return true;
        } catch (error) {
            errorManager.showError(`Failed to delete room doors: ${error.message}`);
            return false;
        }
    }

    restoreFromState(state) {
        try {
            this.#doors = state.doors.map(doorData => {
                const door = new Door(doorData.x, doorData.y, doorData.width, doorData.roomId);
                Object.assign(door, doorData);
                return door;
            });
            
            this.#selectedDoor = state.selectedDoor >= 0 ? this.#doors[state.selectedDoor] : null;
            return true;
        } catch (error) {
            errorManager.showError(`Failed to restore doors: ${error.message}`);
            return false;
        }
    }

    clear() {
        this.#doors = [];
        this.#selectedDoor = null;
        document.getElementById('doorControls').style.display = 'none';
        return true;
    }
}

// Initialize global state variables
window.roomConnections = [];
window.carpetWastePieces = [];
window.rooms = [];
window.doors = [];
window.selectedRoomId = null;
window.selectedDoor = null;
window.nextRoomId = 1;
window.rectangles = [];
window.dropLines = [];
window.isDrawing = false;
window.currentMode = 'draw';
window.startX = 0;
window.startY = 0;
window.carpetWidthInPixels = 12 * CONFIG.PIXELS_PER_FOOT;
window.isVerticalDrop = true;
window.doorWidth = CONFIG.GRID.SIZE * 3;
window.doorSwingAngle = 90;

// Project Management
class ProjectManager {
    static #instance;
    #version = '1.0';
    #autoSaveEnabled = true;
    #autoSaveInterval = 60000; // 1 minute
    #autoSaveTimer = null;

    constructor() {
        if (ProjectManager.#instance) {
            return ProjectManager.#instance;
        }
        
        ProjectManager.#instance = this;
        this.setupAutoSave();
        this.loadLastSession();
    }

    static getInstance() {
        if (!ProjectManager.#instance) {
            ProjectManager.#instance = new ProjectManager();
        }
        return ProjectManager.#instance;
    }

    setupAutoSave() {
        if (this.#autoSaveEnabled) {
            this.#autoSaveTimer = setInterval(() => {
                this.autoSave();
            }, this.#autoSaveInterval);
        }
    }

    autoSave() {
        try {
            const state = this.captureState();
            localStorage.setItem('carpetPlannerAutoSave', JSON.stringify(state));
            localStorage.setItem('carpetPlannerLastAutoSave', new Date().toISOString());
        } catch (error) {
            console.warn('Failed to auto-save:', error);
        }
    }

    loadLastSession() {
        try {
            const lastAutoSave = localStorage.getItem('carpetPlannerLastAutoSave');
            if (lastAutoSave) {
                const lastSaveDate = new Date(lastAutoSave);
                const now = new Date();
                const hoursSinceLastSave = (now - lastSaveDate) / (1000 * 60 * 60);
                
                if (hoursSinceLastSave < 24) { // Only load if less than 24 hours old
                    const savedState = localStorage.getItem('carpetPlannerAutoSave');
                    if (savedState) {
                        this.restoreState(JSON.parse(savedState));
                        return true;
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load last session:', error);
        }
        return false;
    }

    captureState() {
        return {
            version: this.#version,
            timestamp: new Date().toISOString(),
            rooms: roomManager.rooms.map(room => ({
                id: room.id,
                name: room.name,
                rectangles: [...room.rectangles],
                drops: [...room.drops],
                area: room.area,
                carpetUsed: room.carpetUsed,
                wastage: room.wastage,
                color: room.color,
                carpetType: room.carpetType,
                carpetWidth: room.carpetWidth,
                pileDirection: room.pileDirection
            })),
            doors: doorManager.doors.map(door => ({ ...door })),
            connections: roomConnections.map(conn => ({ ...conn })),
            wastePieces: carpetWastePieces.map(piece => ({ ...piece })),
            selectedRoomId: roomManager.selectedRoomId,
            selectedDoor: doorManager.selectedDoor ? 
                doorManager.doors.indexOf(doorManager.selectedDoor) : -1
        };
    }

    async saveProject(filename = 'carpet-plan.json') {
        try {
            const state = this.captureState();
            const blob = new Blob([JSON.stringify(state, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            errorManager.showError(`Failed to save project: ${error.message}`);
            return false;
        }
    }

    async loadProject(file) {
        try {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const projectData = JSON.parse(e.target.result);
                        
                        // Version check
                        if (projectData.version !== this.#version) {
                            const proceed = confirm(
                                `This project was created with version ${projectData.version} ` +
                                `but you are using version ${this.#version}. Continue loading?`
                            );
                            if (!proceed) {
                                reject(new Error('Version mismatch - loading cancelled'));
                                return;
                            }
                        }
                        
                        this.restoreState(projectData);
                        history.pushState();
                        canvasManager.requestRender();
                        resolve(true);
                    } catch (error) {
                        reject(new Error(`Invalid project file: ${error.message}`));
                    }
                };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsText(file);
            });
        } catch (error) {
            errorManager.showError(`Failed to load project: ${error.message}`);
            return false;
        }
    }

    restoreState(state) {
        try {
            // Initialize empty arrays if state properties are undefined
            window.roomConnections = [];
            window.carpetWastePieces = [];
            
            // Restore room and door states first
            roomManager.restoreFromState(state);
            doorManager.restoreFromState(state);
            
            // Then restore connections and waste pieces if they exist
            if (state.connections) {
                window.roomConnections = state.connections;
            }
            if (state.wastePieces) {
                window.carpetWastePieces = state.wastePieces;
            }
        } catch (error) {
            console.warn('Failed to restore state:', error);
            // Initialize with empty arrays if restoration fails
            window.roomConnections = [];
            window.carpetWastePieces = [];
        }
    }

    clearProject() {
        if (confirm('Are you sure you want to clear the entire project? This cannot be undone.')) {
            roomManager.clear();
            doorManager.clear();
            roomConnections = [];
            carpetWastePieces = [];
            history.clear();
            canvasManager.requestRender();
            return true;
        }
        return false;
    }
}

// Initialize managers
const canvasManager = new CanvasManager('carpetCanvas', 'canvas-container');
const errorManager = ErrorManager.getInstance();
const roomManager = RoomManager.getInstance();
const doorManager = DoorManager.getInstance();
const projectManager = ProjectManager.getInstance();

// Add global error handling
window.onerror = (msg, url, line, col, error) => {
    errorManager.showError(`An error occurred: ${msg}`);
    console.error('Global error:', { msg, url, line, col, error });
    return false;
};

// Add promise error handling
window.addEventListener('unhandledrejection', (event) => {
    errorManager.showError(`Promise error: ${event.reason}`);
    console.error('Unhandled promise rejection:', event.reason);
});

// Validation Management
class ValidationManager {
    static #instance;
    #validationRules;

    constructor() {
        if (ValidationManager.#instance) {
            return ValidationManager.#instance;
        }
        
        this.#validationRules = {
            room: {
                name: {
                    validate: (value) => {
                        if (!value || value.trim().length === 0) {
                            throw new Error('Room name cannot be empty');
                        }
                        if (value.trim().length > 50) {
                            throw new Error('Room name cannot exceed 50 characters');
                        }
                        return value.trim();
                    }
                },
                carpetWidth: {
                    validate: (value) => {
                        const width = parseFloat(value);
                        if (isNaN(width)) {
                            throw new Error('Carpet width must be a number');
                        }
                        if (width < 6 || width > 15) {
                            throw new Error('Carpet width must be between 6 and 15 feet');
                        }
                        return width;
                    }
                },
                carpetType: {
                    validate: (value) => {
                        const validTypes = ['standard', 'plush', 'berber', 'pattern', 'none'];
                        if (!validTypes.includes(value)) {
                            throw new Error('Invalid carpet type');
                        }
                        return value;
                    }
                },
                pileDirection: {
                    validate: (value) => {
                        const validDirections = ['north', 'south', 'east', 'west'];
                        if (!validDirections.includes(value)) {
                            throw new Error('Invalid pile direction');
                        }
                        return value;
                    }
                },
                color: {
                    validate: (value) => {
                        if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                            throw new Error('Invalid color format. Must be a valid hex color');
                        }
                        return value;
                    }
                }
            },
            rectangle: {
                dimensions: {
                    validate: (rect) => {
                        if (!rect || typeof rect !== 'object') {
                            throw new Error('Invalid rectangle object');
                        }
                        
                        const numericProps = ['x', 'y', 'width', 'height'];
                        for (const prop of numericProps) {
                            if (typeof rect[prop] !== 'number') {
                                throw new Error(`Rectangle ${prop} must be numeric`);
                            }
                        }
                        
                        if (rect.width === 0 || rect.height === 0) {
                            throw new Error('Rectangle dimensions cannot be zero');
                        }
                        
                        if (Math.abs(rect.width) < CONFIG.GRID.SIZE || Math.abs(rect.height) < CONFIG.GRID.SIZE) {
                            throw new Error('Rectangle dimensions must be at least 1 foot');
                        }
                        
                        return true;
                    }
                },
                overlap: {
                    validate: (rect, existingRects) => {
                        const hasOverlap = existingRects.some(existing => {
                            return !(rect.x + rect.width <= existing.x ||
                                    rect.x >= existing.x + existing.width ||
                                    rect.y + rect.height <= existing.y ||
                                    rect.y >= existing.y + existing.height);
                        });
                        
                        if (hasOverlap) {
                            throw new Error('Rectangle overlaps with existing rectangles');
                        }
                        
                        return true;
                    }
                }
            },
            door: {
                properties: {
                    validate: (door) => {
                        if (!door || typeof door !== 'object') {
                            throw new Error('Invalid door object');
                        }
                        
                        if (typeof door.x !== 'number' || typeof door.y !== 'number') {
                            throw new Error('Door position must be numeric');
                        }
                        
                        const minWidth = CONFIG.GRID.SIZE * 2;
                        const maxWidth = CONFIG.GRID.SIZE * 6;
                        if (door.width < minWidth || door.width > maxWidth) {
                            throw new Error('Door width must be between 2 and 6 feet');
                        }
                        
                        if (!door.roomId) {
                            throw new Error('Door must be associated with a room');
                        }
                        
                        return true;
                    }
                },
                placement: {
                    validate: (door, room) => {
                        // Check if door is placed on a room wall
                        const isOnWall = room.rectangles.some(rect => {
                            return (
                                // Check horizontal walls
                                ((Math.abs(door.y - rect.y) < CONFIG.GRID.SIZE / 4) ||
                                 (Math.abs(door.y - (rect.y + rect.height)) < CONFIG.GRID.SIZE / 4)) &&
                                (door.x >= rect.x && door.x + door.width <= rect.x + rect.width)
                            ) || (
                                // Check vertical walls
                                ((Math.abs(door.x - rect.x) < CONFIG.GRID.SIZE / 4) ||
                                 (Math.abs(door.x - (rect.x + rect.width)) < CONFIG.GRID.SIZE / 4)) &&
                                (door.y >= rect.y && door.y + door.width <= rect.y + rect.height)
                            );
                        });
                        
                        if (!isOnWall) {
                            throw new Error('Door must be placed on a room wall');
                        }
                        
                        return true;
                    }
                }
            }
        };
        
        ValidationManager.#instance = this;
    }

    static getInstance() {
        if (!ValidationManager.#instance) {
            ValidationManager.#instance = new ValidationManager();
        }
        return ValidationManager.#instance;
    }

    validateRoom(room) {
        try {
            this.#validationRules.room.name.validate(room.name);
            this.#validationRules.room.carpetWidth.validate(room.carpetWidth);
            this.#validationRules.room.carpetType.validate(room.carpetType);
            this.#validationRules.room.pileDirection.validate(room.pileDirection);
            this.#validationRules.room.color.validate(room.color);
            
            if (room.rectangles.length === 0) {
                throw new Error('Room must have at least one rectangle');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Room validation failed: ${error.message}`);
        }
    }

    validateRectangle(rect, existingRects = []) {
        try {
            this.#validationRules.rectangle.dimensions.validate(rect);
            if (existingRects.length > 0) {
                this.#validationRules.rectangle.overlap.validate(rect, existingRects);
            }
            return true;
        } catch (error) {
            throw new Error(`Rectangle validation failed: ${error.message}`);
        }
    }

    validateDoor(door, room = null) {
        try {
            this.#validationRules.door.properties.validate(door);
            if (room) {
                this.#validationRules.door.placement.validate(door, room);
            }
            return true;
        } catch (error) {
            throw new Error(`Door validation failed: ${error.message}`);
        }
    }

    validateProperty(type, property, value) {
        try {
            const rule = this.#validationRules[type]?.[property];
            if (!rule) {
                throw new Error(`No validation rule found for ${type}.${property}`);
            }
            return rule.validate(value);
        } catch (error) {
            throw new Error(`Property validation failed: ${error.message}`);
        }
    }
}

// Add try-catch blocks to critical operations
function safeExecute(operation, errorMessage) {
    try {
        return operation();
    } catch (error) {
        errorManager.showError(errorMessage || error.message);
        console.error(error);
        return null;
    }
}

// History management with improved state handling
class HistoryManager {
    #undoStack;
    #redoStack;
    #maxSize;
    #isRestoring;
    #lastSaveTime;
    #autoSaveInterval;

    constructor(maxSize = 50, autoSaveInterval = 5000) {
        this.#undoStack = [];
        this.#redoStack = [];
        this.#maxSize = maxSize;
        this.#isRestoring = false;
        this.#lastSaveTime = Date.now();
        this.#autoSaveInterval = autoSaveInterval;
    }

    captureState() {
        return {
            rooms: rooms.map(room => ({
                id: room.id,
                name: room.name,
                rectangles: [...room.rectangles],
                drops: [...room.drops],
                area: room.area,
                carpetUsed: room.carpetUsed,
                wastage: room.wastage,
                color: room.color,
                carpetType: room.carpetType,
                carpetWidth: room.carpetWidth,
                pileDirection: room.pileDirection
            })),
            doors: doors.map(door => ({ ...door })),
            connections: roomConnections.map(conn => ({ ...conn })),
            wastePieces: carpetWastePieces.map(piece => ({ ...piece })),
            selectedRoomId,
            selectedDoor: selectedDoor ? doors.indexOf(selectedDoor) : -1,
            version: '1.0'
        };
    }

    pushState() {
        if (this.#isRestoring) return;

        const state = this.captureState();
        const stateStr = JSON.stringify(state);

        // Don't push if state hasn't changed
        if (this.#undoStack.length > 0 && 
            stateStr === this.#undoStack[this.#undoStack.length - 1]) {
            return;
        }

        this.#undoStack.push(stateStr);
        if (this.#undoStack.length > this.#maxSize) {
            this.#undoStack.shift();
        }
        this.#redoStack = []; // Clear redo stack on new action

        // Auto-save with throttling
        const now = Date.now();
        if (now - this.#lastSaveTime >= this.#autoSaveInterval) {
            this.#lastSaveTime = now;
            this.saveToLocalStorage(state);
        }
    }

    undo() {
        if (this.#undoStack.length === 0) return;

        const currentState = this.captureState();
        this.#redoStack.push(JSON.stringify(currentState));
        
        this.#isRestoring = true;
        try {
            const previousState = JSON.parse(this.#undoStack.pop());
            this.restoreState(previousState);
            redraw();
        } catch (error) {
            console.error('Failed to undo:', error);
        } finally {
            this.#isRestoring = false;
        }
    }

    redo() {
        if (this.#redoStack.length === 0) return;

        const currentState = this.captureState();
        this.#undoStack.push(JSON.stringify(currentState));
        
        this.#isRestoring = true;
        try {
            const nextState = JSON.parse(this.#redoStack.pop());
            this.restoreState(nextState);
            redraw();
        } catch (error) {
            console.error('Failed to redo:', error);
        } finally {
            this.#isRestoring = false;
        }
    }

    restoreState(state) {
        // Restore rooms with proper instantiation
        rooms = state.rooms.map(roomData => {
            const room = new Room(roomData.id, roomData.name);
            Object.assign(room, roomData);
            return room;
        });

        // Restore doors
        doors = state.doors.map(doorData => {
            const door = new Door(doorData.x, doorData.y, doorData.width, doorData.roomId);
            Object.assign(door, doorData);
            return door;
        });

        // Restore connections and waste pieces
        roomConnections = state.connections;
        carpetWastePieces = state.wastePieces;

        // Restore selection states
        selectedRoomId = state.selectedRoomId;
        selectedDoor = state.selectedDoor >= 0 ? doors[state.selectedDoor] : null;

        // Update nextRoomId
        nextRoomId = Math.max(...rooms.map(r => r.id), 0) + 1;
    }

    saveToLocalStorage(state) {
        try {
            localStorage.setItem('carpetPlannerState', JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save state to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const savedState = localStorage.getItem('carpetPlannerState');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.restoreState(state);
                this.pushState(); // Add loaded state to history
                return true;
            }
        } catch (error) {
            console.warn('Failed to load state from localStorage:', error);
        }
        return false;
    }

    clear() {
        this.#undoStack = [];
        this.#redoStack = [];
        localStorage.removeItem('carpetPlannerState');
    }
}

// Initialize history manager
const history = new HistoryManager();

// Initialize canvas
const canvas = document.getElementById('carpetCanvas');
const ctx = canvas.getContext('2d');
const canvasContainer = document.getElementById('canvas-container');

// State variables
let isDrawing = false;
let currentMode = 'draw';
let startX, startY;
let rectangles = [];
let dropLines = [];
let carpetWidthInPixels = 12 * PIXELS_PER_FOOT;
let isVerticalDrop = true;
let rooms = [];
let selectedRoomId = null;
let nextRoomId = 1;
let doors = [];
let doorWidth = CONFIG.GRID.SIZE * 3;
let selectedDoor = null;
let doorSwingAngle = 90;
let roomConnections = [];
let carpetWastePieces = [];

// Load saved state if available
const savedState = localStorage.getItem('carpetPlannerState');
if (savedState) {
    try {
        restoreState(JSON.parse(savedState));
    } catch (error) {
        console.warn('Failed to load saved state:', error);
    }
}

function restoreState(state) {
    rooms = state.rooms.map(roomData => {
        const room = new Room(roomData.id, roomData.name);
        Object.assign(room, roomData);
        return room;
    });
    
    doors = state.doors.map(doorData => {
        const door = new Door(doorData.x, doorData.y, doorData.width, doorData.roomId);
        Object.assign(door, doorData);
        return door;
    });
    
    roomConnections = state.connections;
    carpetWastePieces = state.wastePieces;
    
    // Update nextRoomId based on highest existing id
    nextRoomId = Math.max(...rooms.map(r => r.id), 0) + 1;
}


// Mouse and view control variables
let lastMouseX = 0;
let lastMouseY = 0;
let isPanning = false;
let lastPanX = 0;
let lastPanY = 0;
let offsetX = 0;    // Added this
let offsetY = 0;    // Added this
let scale = 1;      // Replaced zoomLevel with scale
let targetScale = 1;
let currentScale = 1;
let isZooming = false;

function snapToWall(point, room) {
    const snapDistance = 10; // pixels
    let closestDistance = snapDistance;
    let snappedPoint = { x: point.x, y: point.y };

    room.rectangles.forEach(rect => {
        // Check vertical walls
        if (Math.abs(point.x - rect.x) < closestDistance) {
            snappedPoint.x = rect.x;
            closestDistance = Math.abs(point.x - rect.x);
        }
        if (Math.abs(point.x - (rect.x + rect.width)) < closestDistance) {
            snappedPoint.x = rect.x + rect.width;
            closestDistance = Math.abs(point.x - (rect.x + rect.width));
        }
        
        // Check horizontal walls
        if (Math.abs(point.y - rect.y) < closestDistance) {
            snappedPoint.y = rect.y;
            closestDistance = Math.abs(point.y - rect.y);
        }
        if (Math.abs(point.y - (rect.y + rect.height)) < closestDistance) {
            snappedPoint.y = rect.y + rect.height;
            closestDistance = Math.abs(point.y - (rect.y + rect.height));
        }
    });

    return snappedPoint;
}

class RoomConnection {
    constructor(room1Id, room2Id, connectionType = 'door') {
        this.room1Id = room1Id;
        this.room2Id = room2Id;
        this.connectionType = connectionType; // 'door', 'opening', 'transition'
        this.position = { x: 0, y: 0 };
    }
}

class CarpetPiece {
    constructor(width, length, direction = 'horizontal') {
        this.width = width;
        this.length = length;
        this.direction = direction;
        this.isUsed = false;
        this.usedInRoomId = null;
    }

    canFit(requiredWidth, requiredLength) {
        return (this.width >= requiredWidth && this.length >= requiredLength) ||
               (this.width >= requiredLength && this.length >= requiredWidth);
    }
}

class Room {
    #id;
    #name;
    #rectangles;
    #drops;
    #area;
    #carpetUsed;
    #wastage;
    #color;
    #carpetType;
    #carpetWidth;
    #pileDirection;
    #lastModified;

    constructor(id, name = `Room ${id}`) {
        this.#id = id;
        this.#name = name;
        this.#rectangles = [];
        this.#drops = [];
        this.#area = 0;
        this.#carpetUsed = 0;
        this.#wastage = 0;
        this.#color = '#f0f0f0';
        this.#carpetType = 'standard';
        this.#carpetWidth = 12;
        this.#pileDirection = 'north';
        this.#lastModified = new Date();
    }

    // Getters
    get id() { return this.#id; }
    get name() { return this.#name; }
    get rectangles() { return [...this.#rectangles]; }
    get drops() { return [...this.#drops]; }
    get area() { return this.#area; }
    get carpetUsed() { return this.#carpetUsed; }
    get wastage() { return this.#wastage; }
    get color() { return this.#color; }
    get carpetType() { return this.#carpetType; }
    get carpetWidth() { return this.#carpetWidth; }
    get pileDirection() { return this.#pileDirection; }
    get lastModified() { return new Date(this.#lastModified); }

    // Setters with validation
    set name(value) {
        try {
            this.#name = validationManager.validateProperty('room', 'name', value);
            this.#lastModified = new Date();
        } catch (error) {
            errorManager.showError(error.message);
            throw error;
        }
    }

    set color(value) {
        try {
            this.#color = validationManager.validateProperty('room', 'color', value);
            this.#lastModified = new Date();
        } catch (error) {
            errorManager.showError(error.message);
            throw error;
        }
    }

    set carpetType(value) {
        try {
            this.#carpetType = validationManager.validateProperty('room', 'carpetType', value);
            this.#lastModified = new Date();
        } catch (error) {
            errorManager.showError(error.message);
            throw error;
        }
    }

    set carpetWidth(value) {
        try {
            this.#carpetWidth = validationManager.validateProperty('room', 'carpetWidth', value);
            this.#lastModified = new Date();
            this.calculateCarpetUsage();
        } catch (error) {
            errorManager.showError(error.message);
            throw error;
        }
    }

    set pileDirection(value) {
        try {
            this.#pileDirection = validationManager.validateProperty('room', 'pileDirection', value);
            this.#lastModified = new Date();
        } catch (error) {
            errorManager.showError(error.message);
            throw error;
        }
    }

    addRectangle(rect) {
        try {
            // Normalize rectangle coordinates
            const normalized = this.normalizeRectangle(rect);
            
            // Validate rectangle dimensions and check for overlaps
            validationManager.validateRectangle(normalized, this.#rectangles);
            
            this.#rectangles.push(normalized);
            this.calculateArea();
            this.#lastModified = new Date();
            
            // Recalculate optimal carpet layout
            this.calculateOptimalCarpetLayout();
            return true;
        } catch (error) {
            errorManager.showError(error.message);
            return false;
        }
    }

    normalizeRectangle(rect) {
        let normalized = { ...rect };
        
        // Ensure positive width and height
        if (normalized.width < 0) {
            normalized.x += normalized.width;
            normalized.width = Math.abs(normalized.width);
        }
        if (normalized.height < 0) {
            normalized.y += normalized.height;
            normalized.height = Math.abs(normalized.height);
        }
        
        // Snap to grid
        normalized.x = Math.round(normalized.x / CONFIG.GRID.SIZE) * CONFIG.GRID.SIZE;
        normalized.y = Math.round(normalized.y / CONFIG.GRID.SIZE) * CONFIG.GRID.SIZE;
        normalized.width = Math.round(normalized.width / CONFIG.GRID.SIZE) * CONFIG.GRID.SIZE;
        normalized.height = Math.round(normalized.height / CONFIG.GRID.SIZE) * CONFIG.GRID.SIZE;
        
        return normalized;
    }

    calculateArea() {
        this.area = this.rectangles.reduce((total, rect) => {
            const width = rect.width / CONFIG.PIXELS_PER_FOOT;
            const height = rect.height / CONFIG.PIXELS_PER_FOOT;
            return total + (width * height);
        }, 0);
        
        // Round to 2 decimal places
        this.area = Math.round(this.area * 100) / 100;
    }

    calculateCarpetUsage() {
        try {
            // Reset calculations
            this.#carpetUsed = 0;
            this.#wastage = 0;

            if (this.#rectangles.length === 0) return;

            // Get traffic areas for optimal seam placement
            const trafficAreas = this.calculateTrafficAreas();
            
            // Sort rectangles by position and size
            const sortedRects = this.sortRectanglesForOptimalCutting();

            // Calculate carpet sections with pattern matching
            const sections = this.calculateCarpetSections(sortedRects, trafficAreas);
            
            // Calculate total carpet used including pattern matching and pile direction
            let totalCarpetUsed = 0;
            sections.forEach(section => {
                const width = section.width / CONFIG.PIXELS_PER_FOOT;
                const height = section.height / CONFIG.PIXELS_PER_FOOT;
                
                // Base carpet usage
                let sectionUsage = width * height;
                
                // Add pattern matching if needed
                if (this.#carpetType === 'pattern') {
                    const patternRepeat = this.getPatternRepeat();
                    const repeatsNeeded = Math.ceil(height / patternRepeat);
                    sectionUsage = width * (repeatsNeeded * patternRepeat);
                }
                
                // Add pile direction matching allowance
                if (['north', 'south'].includes(this.#pileDirection)) {
                    sectionUsage += width * 0.5; // 6 inches for matching
                }
                
                // Check for reusable waste pieces
                const reuseablePiece = this.findReusableWastePiece(width, height);
                if (reuseablePiece) {
                    sectionUsage = Math.max(0, sectionUsage - (reuseablePiece.width * reuseablePiece.length));
                }
                
                totalCarpetUsed += sectionUsage;
            });

            this.#carpetUsed = totalCarpetUsed;
            this.#wastage = Math.max(0, this.#carpetUsed - this.#area);
            
            // Store waste pieces for potential reuse
            this.storeWastePieces(sections);
            
            return true;
        } catch (error) {
            errorManager.showError(`Failed to calculate carpet usage: ${error.message}`);
            return false;
        }
    }

    sortRectanglesForOptimalCutting() {
        return [...this.#rectangles].sort((a, b) => {
            // First sort by position based on pile direction
            const positionSort = ['north', 'south'].includes(this.#pileDirection) 
                ? a.y - b.y 
                : a.x - b.x;
            
            if (positionSort !== 0) return positionSort;
            
            // Then sort by size for optimal piece fitting
            const aSize = a.width * a.height;
            const bSize = b.width * b.height;
            return bSize - aSize; // Larger pieces first
        });
    }

    calculateCarpetSections(rectangles, trafficAreas) {
        const sections = [];
        let currentSection = null;
        
        rectangles.forEach(rect => {
            if (!currentSection) {
                currentSection = { ...rect };
            } else {
                const canCombine = this.canCombineSections(currentSection, rect, trafficAreas);
                
                if (canCombine) {
                    // Expand current section
                    currentSection = this.combineSections(currentSection, rect);
                } else {
                    // Start new section
                    sections.push(currentSection);
                    currentSection = { ...rect };
                }
            }
        });
        
        if (currentSection) {
            sections.push(currentSection);
        }
        
        return sections;
    }

    canCombineSections(section1, section2, trafficAreas) {
        // Check if combining would create seam in traffic area
        const potentialSeam = this.calculatePotentialSeam(section1, section2);
        if (this.seamIntersectsTrafficAreas(potentialSeam, trafficAreas)) {
            return false;
        }
        
        // Check if combined width would exceed carpet roll width
        const combinedWidth = this.getCombinedWidth(section1, section2);
        if (combinedWidth > this.#carpetWidth * CONFIG.PIXELS_PER_FOOT) {
            return false;
        }
        
        // Check pattern matching requirements
        if (this.#carpetType === 'pattern') {
            return this.patternsAlign(section1, section2);
        }
        
        return true;
    }

    combineSections(section1, section2) {
        const minX = Math.min(section1.x, section2.x);
        const minY = Math.min(section1.y, section2.y);
        const maxX = Math.max(section1.x + section1.width, section2.x + section2.width);
        const maxY = Math.max(section1.y + section1.height, section2.y + section2.height);
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    calculatePotentialSeam(section1, section2) {
        return {
            x: section1.x + section1.width,
            y: section1.y,
            length: section1.height
        };
    }

    seamIntersectsTrafficAreas(seam, trafficAreas) {
        return trafficAreas.some(area => {
            return !(seam.x < area.x || 
                    seam.x > area.x + area.width ||
                    seam.y > area.y + area.height ||
                    seam.y + seam.length < area.y);
        });
    }

    getCombinedWidth(section1, section2) {
        if (['north', 'south'].includes(this.#pileDirection)) {
            return Math.max(section1.width, section2.width);
        } else {
            return section1.width + section2.width;
        }
    }

    patternsAlign(section1, section2) {
        const patternRepeat = this.getPatternRepeat();
        const offset = Math.abs(section2.y - section1.y);
        return offset % patternRepeat < CONFIG.GRID.SIZE / 4;
    }

    getPatternRepeat() {
        // Pattern repeat distance in feet
        switch (this.#carpetType) {
            case 'pattern':
                return 2; // 2 feet pattern repeat
            default:
                return 0;
        }
    }

    findReusableWastePiece(width, height) {
        return carpetWastePieces.find(piece => 
            !piece.isUsed && piece.canFit(width, height)
        );
    }

    storeWastePieces(sections) {
        sections.forEach(section => {
            const width = section.width / CONFIG.PIXELS_PER_FOOT;
            const height = section.height / CONFIG.PIXELS_PER_FOOT;
            
            // Store significant waste pieces (larger than 2x2 feet)
            if (width >= 2 && height >= 2) {
                carpetWastePieces.push(new CarpetPiece(
                    width,
                    height,
                    ['north', 'south'].includes(this.#pileDirection) ? 'vertical' : 'horizontal'
                ));
            }
        });
    }

    updateProperties(properties) {
        try {
            // Validate each property before updating
            Object.entries(properties).forEach(([key, value]) => {
                switch (key) {
                    case 'name':
                        this.name = value; // Uses setter with validation
                        break;
                    case 'color':
                        this.color = value; // Uses setter with validation
                        break;
                    case 'carpetType':
                        this.carpetType = value; // Uses setter with validation
                        break;
                    case 'carpetWidth':
                        this.carpetWidth = value; // Uses setter with validation
                        break;
                    case 'pileDirection':
                        this.pileDirection = value; // Uses setter with validation
                        break;
                    default:
                        throw new Error(`Invalid property: ${key}`);
                }
            });

            this.#lastModified = new Date();
            this.calculateCarpetUsage();
            return true;
        } catch (error) {
            errorManager.showError(`Failed to update room properties: ${error.message}`);
            return false;
        }
    }

    // New methods
    findConnectedRooms() {
        const connectedRoomIds = roomConnections
            .filter(conn => conn.room1Id === this.id || conn.room2Id === this.id)
            .map(conn => conn.room1Id === this.id ? conn.room2Id : conn.room1Id);
        
        return rooms.filter(room => connectedRoomIds.includes(room.id));
    }

    alignWithConnectedRooms() {
        try {
            const connectedRooms = this.findConnectedRooms();
            if (connectedRooms.length === 0) return true;

            // Find connections that require pattern/pile alignment
            const alignmentNeeded = roomConnections
                .filter(conn => 
                    (conn.room1Id === this.id || conn.room2Id === this.id) &&
                    conn.connectionType !== 'door' // Don't align across doors
                );

            if (alignmentNeeded.length === 0) return true;

            // Get the dominant pile direction from connected rooms
            const directions = connectedRooms.reduce((acc, room) => {
                acc[room.pileDirection] = (acc[room.pileDirection] || 0) + 1;
                return acc;
            }, {});
            
            const dominantDirection = Object.entries(directions)
                .reduce((a, b) => a[1] > b[1] ? a : b)[0];

            // Align pile direction with connected rooms
            if (this.#pileDirection !== dominantDirection) {
                this.pileDirection = dominantDirection;
            }

            // For pattern matching, ensure drops align with connected rooms
            if (this.#carpetType === 'pattern') {
                const connectedDrops = connectedRooms
                    .filter(room => room.carpetType === 'pattern')
                    .flatMap(room => room.drops);

                if (connectedDrops.length > 0) {
                    // Adjust drops to match connected rooms
                    this.#drops = this.#drops.map(drop => {
                        const nearestConnectedDrop = connectedDrops
                            .reduce((nearest, connected) => {
                                const distance = Math.abs(connected.position - drop.position);
                                return distance < Math.abs(nearest.position - drop.position) 
                                    ? connected 
                                    : nearest;
                            });

                        return {
                            ...drop,
                            position: nearestConnectedDrop.position,
                            isVertical: nearestConnectedDrop.isVertical
                        };
                    });
                }
            }

            // Recalculate carpet usage with aligned drops
            this.calculateCarpetUsage();
            return true;
        } catch (error) {
            errorManager.showError(`Failed to align with connected rooms: ${error.message}`);
            return false;
        }
    }

    calculateOptimalCarpetLayout() {
        try {
            // Reset drops
            this.#drops = [];
            
            if (this.#rectangles.length === 0) return;

            // Get room bounds
            const bounds = this.calculateRoomBounds();
            
            // Determine optimal orientation based on pile direction and pattern
            const isVertical = ['north', 'south'].includes(this.#pileDirection);
            const hasPattern = this.#carpetType === 'pattern';

            // Calculate traffic areas and doorways
            const trafficAreas = this.calculateTrafficAreas();
            
            // Sort rectangles based on optimal cutting strategy
            const sortedRects = [...this.#rectangles].sort((a, b) => {
                if (isVertical) {
                    // For vertical pile, prioritize Y position and size
                    return (a.y - b.y) || (b.width * b.height - a.width * a.height);
                } else {
                    // For horizontal pile, prioritize X position and size
                    return (a.x - b.x) || (b.width * b.height - a.width * a.height);
                }
            });

            // Calculate optimal seam positions
            const seams = this.calculateOptimalSeams(sortedRects, trafficAreas, isVertical);
            
            // Convert seams to drops while considering pattern matching
            seams.forEach(seamPos => {
                this.#drops.push({
                    position: seamPos,
                    isVertical: isVertical
                });

                if (hasPattern) {
                    const patternRepeat = 2 * CONFIG.PIXELS_PER_FOOT;
                    // Add extra drop for pattern matching if needed
                    if (this.needsPatternMatching(seamPos, sortedRects)) {
                        this.#drops.push({
                            position: seamPos + patternRepeat,
                            isVertical: isVertical
                        });
                    }
                }
            });

            // Optimize drops for minimum waste
            this.optimizeDropsForWaste();

            // Recalculate carpet usage with optimized drops
            this.calculateCarpetUsage();
            return true;
        } catch (error) {
            errorManager.showError(`Failed to calculate optimal layout: ${error.message}`);
            return false;
        }
    }

    calculateTrafficAreas() {
        const trafficAreas = [];
        
        // Add areas around doors
        const roomDoors = doors.filter(door => door.roomId === this.#id);
        roomDoors.forEach(door => {
            trafficAreas.push({
                x: door.x - CONFIG.GRID.SIZE,
                y: door.y - CONFIG.GRID.SIZE,
                width: door.width + CONFIG.GRID.SIZE * 2,
                height: CONFIG.GRID.SIZE * 3
            });
        });

        // Add natural pathways between doors
        if (roomDoors.length > 1) {
            for (let i = 0; i < roomDoors.length - 1; i++) {
                for (let j = i + 1; j < roomDoors.length; j++) {
                    const door1 = roomDoors[i];
                    const door2 = roomDoors[j];
                    trafficAreas.push(this.calculatePathwayArea(door1, door2));
                }
            }
        }

        return trafficAreas;
    }

    calculatePathwayArea(door1, door2) {
        const center1 = { x: door1.x + door1.width / 2, y: door1.y };
        const center2 = { x: door2.x + door2.width / 2, y: door2.y };
        
        return {
            x: Math.min(center1.x, center2.x) - CONFIG.GRID.SIZE,
            y: Math.min(center1.y, center2.y) - CONFIG.GRID.SIZE,
            width: Math.abs(center2.x - center1.x) + CONFIG.GRID.SIZE * 2,
            height: Math.abs(center2.y - center1.y) + CONFIG.GRID.SIZE * 2
        };
    }

    calculateOptimalSeams(rectangles, trafficAreas, isVertical) {
        const seams = [];
        const maxWidth = this.#carpetWidth * CONFIG.PIXELS_PER_FOOT;
        
        // Get room bounds
        const bounds = this.calculateRoomBounds();
        const minPos = isVertical ? bounds.minX : bounds.minY;
        const maxPos = isVertical ? bounds.maxX : bounds.maxY;
        
        // Calculate potential seam positions
        let currentPos = minPos;
        
        while (currentPos < maxPos) {
            // Score each potential seam position
            const score = this.scoreSeamPosition(currentPos, rectangles, trafficAreas, isVertical);
            
            if (score > 0) {
                // Valid seam position found
                seams.push(currentPos);
                
                // Skip ahead by carpet width, adjusted for pattern matching if needed
                let skipDistance = maxWidth;
                if (this.#carpetType === 'pattern') {
                    const patternRepeat = this.getPatternRepeat() * CONFIG.PIXELS_PER_FOOT;
                    skipDistance = Math.ceil(maxWidth / patternRepeat) * patternRepeat;
                }
                currentPos += skipDistance;
            } else {
                // Try next grid position
                currentPos += CONFIG.GRID.SIZE;
            }
        }

        // Optimize seam positions for minimum waste
        return this.optimizeSeamPositions(seams, rectangles, isVertical);
    }

    scoreSeamPosition(pos, rectangles, trafficAreas, isVertical) {
        let score = 100; // Base score
        
        // Penalty for traffic area intersection
        if (trafficAreas.some(area => this.seamIntersectsArea(pos, area, isVertical))) {
            score -= 50;
        }
        
        // Penalty for being close to rectangle edges
        rectangles.forEach(rect => {
            const start = isVertical ? rect.x : rect.y;
            const size = isVertical ? rect.width : rect.height;
            const distance = Math.min(
                Math.abs(pos - start),
                Math.abs(pos - (start + size))
            );
            
            if (distance < 2 * CONFIG.PIXELS_PER_FOOT) {
                score -= (2 * CONFIG.PIXELS_PER_FOOT - distance) / CONFIG.PIXELS_PER_FOOT * 20;
            }
        });
        
        // Bonus for aligning with pattern repeat
        if (this.#carpetType === 'pattern') {
            const patternRepeat = this.getPatternRepeat() * CONFIG.PIXELS_PER_FOOT;
            const offset = pos % patternRepeat;
            if (offset < CONFIG.GRID.SIZE / 4) {
                score += 20;
            }
        }
        
        // Bonus for aligning with room features
        const alignmentScore = this.calculateAlignmentScore(pos, rectangles, isVertical);
        score += alignmentScore;
        
        return Math.max(0, score);
    }

    calculateAlignmentScore(pos, rectangles, isVertical) {
        let score = 0;
        
        rectangles.forEach(rect => {
            const edges = isVertical ? 
                [rect.x, rect.x + rect.width] : 
                [rect.y, rect.y + rect.height];
            
            edges.forEach(edge => {
                const distance = Math.abs(pos - edge);
                if (distance < CONFIG.GRID.SIZE) {
                    score += 10 * (1 - distance / CONFIG.GRID.SIZE);
                }
            });
        });
        
        return score;
    }

    optimizeSeamPositions(seams, rectangles, isVertical) {
        if (seams.length <= 1) return seams;
        
        const optimizedSeams = [...seams];
        let improved = true;
        
        while (improved) {
            improved = false;
            
            for (let i = 0; i < optimizedSeams.length - 1; i++) {
                const gap = optimizedSeams[i + 1] - optimizedSeams[i];
                const maxWidth = this.#carpetWidth * CONFIG.PIXELS_PER_FOOT;
                
                if (gap < maxWidth * 0.8) { // If gap is less than 80% of carpet width
                    // Try to find optimal position that minimizes waste
                    const optimalPos = this.findOptimalSeamPosition(
                        optimizedSeams[i],
                        optimizedSeams[i + 1],
                        rectangles,
                        isVertical
                    );
                    
                    if (optimalPos !== optimizedSeams[i]) {
                        optimizedSeams[i] = optimalPos;
                        optimizedSeams.splice(i + 1, 1);
                        improved = true;
                    }
                }
            }
        }
        
        return optimizedSeams;
    }

    findOptimalSeamPosition(start, end, rectangles, isVertical) {
        let bestPos = start;
        let bestScore = this.calculateSeamEfficiency(start, rectangles, isVertical);
        
        for (let pos = start + CONFIG.GRID.SIZE; pos < end; pos += CONFIG.GRID.SIZE) {
            const score = this.calculateSeamEfficiency(pos, rectangles, isVertical);
            if (score > bestScore) {
                bestScore = score;
                bestPos = pos;
            }
        }
        
        return bestPos;
    }

    calculateSeamEfficiency(pos, rectangles, isVertical) {
        let efficiency = 0;
        const maxWidth = this.#carpetWidth * CONFIG.PIXELS_PER_FOOT;
        
        // Group rectangles by their position relative to the seam
        const leftRects = rectangles.filter(rect => {
            const edge = isVertical ? rect.x + rect.width : rect.y + rect.height;
            return edge <= pos;
        });
        const rightRects = rectangles.filter(rect => {
            const edge = isVertical ? rect.x : rect.y;
            return edge >= pos;
        });
        
        // Calculate efficiency for left side
        if (leftRects.length > 0) {
            const leftWidth = Math.max(...leftRects.map(rect => {
                const edge = isVertical ? rect.x + rect.width : rect.y + rect.height;
                return pos - edge;
            }));
            efficiency += this.calculatePieceEfficiency(leftWidth, maxWidth);
        }
        
        // Calculate efficiency for right side
        if (rightRects.length > 0) {
            const rightWidth = Math.max(...rightRects.map(rect => {
                const edge = isVertical ? rect.x : rect.y;
                return edge - pos;
            }));
            efficiency += this.calculatePieceEfficiency(rightWidth, maxWidth);
        }
        
        // Add bonus for pattern alignment
        if (this.#carpetType === 'pattern') {
            const patternRepeat = this.getPatternRepeat() * CONFIG.PIXELS_PER_FOOT;
            const offset = pos % patternRepeat;
            if (offset < CONFIG.GRID.SIZE / 4) {
                efficiency += 0.2; // 20% bonus for pattern alignment
            }
        }
        
        // Add bonus for reusable waste pieces
        const wastePieces = this.findReusableWastePiecesForSeam(pos, leftRects, rightRects, isVertical);
        if (wastePieces.length > 0) {
            efficiency += 0.1 * wastePieces.length; // 10% bonus per usable waste piece
        }
        
        return efficiency;
    }

    calculatePieceEfficiency(width, maxWidth) {
        if (width <= 0) return 0;
        if (width > maxWidth) return 0;
        
        // Base efficiency calculation
        let efficiency = 1 - (width % maxWidth) / maxWidth;
        
        // Penalty for very narrow pieces
        const minUsableWidth = 2 * CONFIG.PIXELS_PER_FOOT; // 2 feet minimum
        if (width < minUsableWidth) {
            efficiency *= (width / minUsableWidth);
        }
        
        return efficiency;
    }

    findReusableWastePiecesForSeam(pos, leftRects, rightRects, isVertical) {
        const pieces = [];
        const maxWidth = this.#carpetWidth * CONFIG.PIXELS_PER_FOOT;
        
        // Helper function to check if a piece can be used
        const canUsePiece = (piece, width, height) => {
            const pieceWidth = piece.width * CONFIG.PIXELS_PER_FOOT;
            const pieceHeight = piece.height * CONFIG.PIXELS_PER_FOOT;
            
            // Check if piece can fit in either orientation
            return (pieceWidth >= width && pieceHeight >= height) ||
                   (pieceWidth >= height && pieceHeight >= width);
        };
        
        // Check left side pieces
        if (leftRects.length > 0) {
            const leftWidth = Math.max(...leftRects.map(rect => pos - rect.x));
            const leftHeight = Math.max(...leftRects.map(rect => rect.height));
            
            carpetWastePieces.forEach(piece => {
                if (!piece.isUsed && canUsePiece(piece, leftWidth, leftHeight)) {
                    pieces.push(piece);
                }
            });
        }
        
        // Check right side pieces
        if (rightRects.length > 0) {
            const rightWidth = Math.min(
                maxWidth,
                Math.max(...rightRects.map(rect => rect.x + rect.width - pos))
            );
            const rightHeight = Math.max(...rightRects.map(rect => rect.height));
            
            carpetWastePieces.forEach(piece => {
                if (!piece.isUsed && canUsePiece(piece, rightWidth, rightHeight)) {
                    pieces.push(piece);
                }
            });
        }
        
        return pieces;
    }

    seamIntersectsArea(seamPos, area, isVertical) {
        if (isVertical) {
            return seamPos >= area.x && seamPos <= area.x + area.width;
        } else {
            return seamPos >= area.y && seamPos <= area.y + area.height;
        }
    }

    isValidSeamPosition(pos, rectangles, isVertical) {
        // Check if seam position is at least 2 feet from rectangle edges
        const minDistance = 2 * CONFIG.PIXELS_PER_FOOT;
        
        return !rectangles.some(rect => {
            const start = isVertical ? rect.x : rect.y;
            const size = isVertical ? rect.width : rect.height;
            const distance = Math.min(
                Math.abs(pos - start),
                Math.abs(pos - (start + size))
            );
            return distance < minDistance;
        });
    }

    needsPatternMatching(seamPos, rectangles) {
        // Check if any rectangles on either side of the seam require pattern matching
        const tolerance = CONFIG.GRID.SIZE / 4;
        const patternRepeat = this.getPatternRepeat() * CONFIG.PIXELS_PER_FOOT;
        
        // Get rectangles on both sides of the seam
        const leftRects = rectangles.filter(rect => rect.x + rect.width <= seamPos + tolerance);
        const rightRects = rectangles.filter(rect => rect.x >= seamPos - tolerance);
        
        // If no rectangles on either side, no pattern matching needed
        if (leftRects.length === 0 || rightRects.length === 0) return false;
        
        // Check if any pair of rectangles needs pattern matching
        for (const leftRect of leftRects) {
            for (const rightRect of rightRects) {
                // Check vertical alignment
                const verticalOverlap = Math.min(
                    leftRect.y + leftRect.height,
                    rightRect.y + rightRect.height
                ) - Math.max(leftRect.y, rightRect.y);
                
                // If rectangles overlap vertically and are close to seam
                if (verticalOverlap > 0) {
                    // Calculate pattern offset
                    const leftOffset = leftRect.y % patternRepeat;
                    const rightOffset = rightRect.y % patternRepeat;
                    const offsetDiff = Math.abs(leftOffset - rightOffset);
                    
                    // If patterns don't align naturally, we need pattern matching
                    if (offsetDiff > tolerance) return true;
                }
            }
        }
        
        return false;
    }

    optimizePatternMatching(seams, rectangles) {
        const optimizedSeams = [...seams];
        const patternRepeat = this.getPatternRepeat() * CONFIG.PIXELS_PER_FOOT;
        
        for (let i = 0; i < optimizedSeams.length; i++) {
            const seamPos = optimizedSeams[i];
            
            // Get rectangles affected by this seam
            const nearbyRects = rectangles.filter(rect => 
                Math.abs(rect.x - seamPos) < this.#carpetWidth * CONFIG.PIXELS_PER_FOOT
            );
            
            if (nearbyRects.length === 0) continue;
            
            // Calculate optimal pattern offset
            let bestOffset = 0;
            let bestScore = -Infinity;
            
            // Try different pattern offsets
            for (let offset = 0; offset < patternRepeat; offset += CONFIG.GRID.SIZE / 2) {
                let score = this.evaluatePatternOffset(seamPos + offset, nearbyRects);
                if (score > bestScore) {
                    bestScore = score;
                    bestOffset = offset;
                }
            }
            
            // Adjust seam position to optimize pattern matching
            optimizedSeams[i] = seamPos + bestOffset;
        }
        
        return optimizedSeams;
    }

    evaluatePatternOffset(pos, rectangles) {
        let score = 0;
        const patternRepeat = this.getPatternRepeat() * CONFIG.PIXELS_PER_FOOT;
        
        rectangles.forEach(rect => {
            // Calculate how well the pattern aligns with rectangle edges
            const edgeOffset = rect.y % patternRepeat;
            score -= Math.min(edgeOffset, patternRepeat - edgeOffset);
            
            // Bonus for aligning with architectural features
            if (this.isAlignedWithFeature(pos, rect)) {
                score += 50;
            }
            
            // Penalty for visible seams in high-traffic areas
            if (this.isInTrafficArea(pos, rect)) {
                score -= 100;
            }
        });
        
        return score;
    }

    isAlignedWithFeature(pos, rect) {
        // Check alignment with doors, windows, or other architectural features
        const features = [
            ...doors.filter(door => door.roomId === this.#id),
            // Add other architectural features here
        ];
        
        return features.some(feature => 
            Math.abs(pos - feature.x) < CONFIG.GRID.SIZE ||
            Math.abs(pos - (feature.x + feature.width)) < CONFIG.GRID.SIZE
        );
    }

    isInTrafficArea(pos, rect) {
        const trafficAreas = this.calculateTrafficAreas();
        return trafficAreas.some(area => 
            pos >= area.x && pos <= area.x + area.width &&
            rect.y + rect.height >= area.y && rect.y <= area.y + area.height
        );
    }

    optimizeDropsForWaste() {
        if (this.#drops.length <= 1) return;

        const maxWidth = this.#carpetWidth * CONFIG.PIXELS_PER_FOOT;
        let improved = true;
        
        while (improved) {
            improved = false;
            
            // First pass: Try to merge adjacent drops
            for (let i = 0; i < this.#drops.length - 1; i++) {
                const currentDrop = this.#drops[i];
                const nextDrop = this.#drops[i + 1];
                const gap = nextDrop.position - currentDrop.position;
                
                if (gap < maxWidth * 0.8) {
                    const midPoint = this.findOptimalMergePoint(
                        currentDrop.position,
                        nextDrop.position,
                        currentDrop.isVertical
                    );
                    
                    if (midPoint !== null) {
                        // Check if merging would create a seam in a traffic area
                        const trafficAreas = this.calculateTrafficAreas();
                        const wouldIntersectTraffic = trafficAreas.some(area => 
                            this.seamIntersectsArea(midPoint, area, currentDrop.isVertical)
                        );
                        
                        if (!wouldIntersectTraffic) {
                            currentDrop.position = midPoint;
                            this.#drops.splice(i + 1, 1);
                            improved = true;
                            i--; // Recheck this position
                        }
                    }
                }
            }
            
            // Second pass: Try to optimize remaining drops
            if (!improved) {
                for (let i = 0; i < this.#drops.length; i++) {
                    const drop = this.#drops[i];
                    const optimalPos = this.findOptimalDropPosition(
                        drop.position,
                        maxWidth,
                        drop.isVertical
                    );
                    
                    if (optimalPos !== drop.position) {
                        // Check if new position would create a seam in a traffic area
                        const trafficAreas = this.calculateTrafficAreas();
                        const wouldIntersectTraffic = trafficAreas.some(area => 
                            this.seamIntersectsArea(optimalPos, area, drop.isVertical)
                        );
                        
                        if (!wouldIntersectTraffic) {
                            drop.position = optimalPos;
                            improved = true;
                        }
                    }
                }
            }
            
            // Third pass: Try to optimize pattern matching
            if (this.#carpetType === 'pattern' && !improved) {
                const patternRepeat = this.getPatternRepeat() * CONFIG.PIXELS_PER_FOOT;
                
                for (let i = 0; i < this.#drops.length; i++) {
                    const drop = this.#drops[i];
                    const currentOffset = drop.position % patternRepeat;
                    
                    // Try to align with pattern repeat
                    if (currentOffset > 0) {
                        const alignedPos = drop.position - currentOffset;
                        const trafficAreas = this.calculateTrafficAreas();
                        const wouldIntersectTraffic = trafficAreas.some(area => 
                            this.seamIntersectsArea(alignedPos, area, drop.isVertical)
                        );
                        
                        if (!wouldIntersectTraffic && 
                            this.isValidSeamPosition(alignedPos, this.#rectangles, drop.isVertical)) {
                            drop.position = alignedPos;
                            improved = true;
                        }
                    }
                }
            }
            
            // Fourth pass: Try to reuse waste pieces
            if (!improved) {
                const wastePieces = carpetWastePieces.filter(piece => !piece.isUsed);
                
                for (let i = 0; i < this.#drops.length; i++) {
                    const drop = this.#drops[i];
                    const nearbyPieces = wastePieces.filter(piece => {
                        const pieceWidth = piece.width * CONFIG.PIXELS_PER_FOOT;
                        return Math.abs(pieceWidth - (drop.position % maxWidth)) < CONFIG.GRID.SIZE;
                    });
                    
                    if (nearbyPieces.length > 0) {
                        const bestPiece = nearbyPieces[0];
                        const alignedPos = drop.position - (drop.position % maxWidth) + 
                                         bestPiece.width * CONFIG.PIXELS_PER_FOOT;
                        
                        const trafficAreas = this.calculateTrafficAreas();
                        const wouldIntersectTraffic = trafficAreas.some(area => 
                            this.seamIntersectsArea(alignedPos, area, drop.isVertical)
                        );
                        
                        if (!wouldIntersectTraffic && 
                            this.isValidSeamPosition(alignedPos, this.#rectangles, drop.isVertical)) {
                            drop.position = alignedPos;
                            bestPiece.isUsed = true;
                            bestPiece.usedInRoomId = this.#id;
                            improved = true;
                        }
                    }
                }
            }
        }
    }

    findOptimalMergePoint(pos1, pos2, isVertical) {
        const minDistance = CONFIG.GRID.SIZE;
        const maxDistance = this.#carpetWidth * CONFIG.PIXELS_PER_FOOT;
        let bestPos = null;
        let bestScore = -Infinity;
        
        // Try positions between the two drops
        for (let pos = pos1; pos <= pos2; pos += CONFIG.GRID.SIZE) {
            // Skip if too close to either drop
            if (Math.abs(pos - pos1) < minDistance || Math.abs(pos - pos2) < minDistance) {
                continue;
            }
            
            // Skip if would create too wide a section
            if (pos2 - pos > maxDistance || pos - pos1 > maxDistance) {
                continue;
            }
            
            const score = this.evaluateDropPosition(pos, isVertical);
            if (score > bestScore) {
                bestScore = score;
                bestPos = pos;
            }
        }
        
        return bestScore > 0 ? bestPos : null;
    }

    findOptimalDropPosition(currentPos, maxWidth, isVertical) {
        let bestPos = currentPos;
        let bestScore = this.evaluateDropPosition(currentPos, isVertical);
        
        // Try positions within maxWidth/4 of current position
        const range = maxWidth / 4;
        for (let offset = -range; offset <= range; offset += CONFIG.GRID.SIZE) {
            const pos = currentPos + offset;
            const score = this.evaluateDropPosition(pos, isVertical);
            
            if (score > bestScore) {
                bestScore = score;
                bestPos = pos;
            }
        }
        
        return bestPos;
    }

    evaluateDropPosition(pos, isVertical) {
        let score = 0;
        
        // Check alignment with architectural features
        if (this.isAlignedWithFeature(pos, null)) {
            score += 50;
        }
        
        // Check traffic areas
        if (this.isInTrafficArea(pos, null)) {
            score -= 100;
        }
        
        // Check pattern alignment
        if (this.#carpetType === 'pattern') {
            const patternRepeat = this.getPatternRepeat() * CONFIG.PIXELS_PER_FOOT;
            const offset = pos % patternRepeat;
            if (offset < CONFIG.GRID.SIZE / 4) {
                score += 30;
            }
        }
        
        // Check distance from room edges
        this.#rectangles.forEach(rect => {
            const edges = isVertical ? 
                [rect.x, rect.x + rect.width] : 
                [rect.y, rect.y + rect.height];
            
            edges.forEach(edge => {
                const distance = Math.abs(pos - edge);
                if (distance < CONFIG.GRID.SIZE * 2) {
                    score -= (CONFIG.GRID.SIZE * 2 - distance) / CONFIG.GRID.SIZE * 10;
                }
            });
        });
        
        // Bonus for reusing existing waste pieces
        const nearbyWastePieces = carpetWastePieces.filter(piece => 
            !piece.isUsed && 
            Math.abs(piece.width * CONFIG.PIXELS_PER_FOOT - pos) < CONFIG.GRID.SIZE
        );
        
        if (nearbyWastePieces.length > 0) {
            score += 40;
        }
        
        return score;
    }

    calculateRoomBounds() {
        return this.#rectangles.reduce((bounds, rect) => ({
            minX: Math.min(bounds.minX, rect.x),
            minY: Math.min(bounds.minY, rect.y),
            maxX: Math.max(bounds.maxX, rect.x + rect.width),
            maxY: Math.max(bounds.maxY, rect.y + rect.height)
        }), {
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
        });
    }
}

class Door {
    constructor(x, y, width = doorWidth, roomId) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.roomId = roomId;
        this.swingDirection = 'inward'; // or 'outward'
        this.swingLeft = true; // or false for right swing
        this.transitionType = 'standard'; // or 'reducer', 'metal'
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
            ctx.arc(this.swingLeft ? this.x : this.x + this.width, 
                   this.y, radius, startAngle, endAngle);
        } else {
            ctx.arc(this.swingLeft ? this.x : this.x + this.width, 
                   this.y, radius, endAngle, startAngle);
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
}

function optimizeCarpetUsage(room) {
    let unusedPieces = carpetWastePieces.filter(piece => !piece.isUsed);
    room.rectangles.forEach(rect => {
        const rectWidth = Math.abs(rect.width) / PIXELS_PER_FOOT;
        const rectHeight = Math.abs(rect.height) / PIXELS_PER_FOOT;
        
        // Try to find a matching waste piece
        const matchingPiece = unusedPieces.find(piece => 
            piece.canFit(rectWidth, rectHeight)
        );

        if (matchingPiece) {
            matchingPiece.isUsed = true;
            matchingPiece.usedInRoomId = room.id;
            // Update room calculations to account for reused piece
            room.carpetUsed -= (rectWidth * rectHeight);
        }
    });
}

        // Event Listeners
        document.getElementById('carpetWidth').addEventListener('change', (e) => {
            const widthInFeet = parseFloat(e.target.value);
            carpetWidthInPixels = widthInFeet * PIXELS_PER_FOOT;
            redraw();
        });

        function pixelsToFeetAndInches(pixels) {
            const feet = pixels / PIXELS_PER_FOOT;
            const wholeNumber = Math.floor(feet);
            const inches = Math.round((feet - wholeNumber) * 12);
            return `${wholeNumber}'${inches}"`;
        }

        // Update the drawGrid function
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    const width = canvas.width / scale;
    const height = canvas.height / scale;
    
    // Calculate visible grid area
    const startX = Math.floor(-offsetX / scale / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(-offsetY / scale / GRID_SIZE) * GRID_SIZE;
    const endX = Math.ceil((width - offsetX / scale) / GRID_SIZE) * GRID_SIZE;
    const endY = Math.ceil((height - offsetY / scale) / GRID_SIZE) * GRID_SIZE;

    // Get mouse position relative to grid
    const mouseX = (lastMouseX - offsetX) / scale;
    const mouseY = (lastMouseY - offsetY) / scale;
    const hoverDistance = 5; // Reduced hover distance for more precision

    // Draw minor grid lines if zoomed in enough
    if (scale > 0.5) {
        ctx.strokeStyle = MINOR_GRID_COLOR;
        ctx.lineWidth = 0.5;
        
        const quarterSize = GRID_SIZE / 4;
        for (let x = startX; x <= endX; x += quarterSize) {
            if (x % GRID_SIZE !== 0) { // Skip major grid lines
                const isNearVertical = Math.abs(mouseX - x) < hoverDistance;
                
                ctx.beginPath();
                ctx.moveTo(x, startY);
                ctx.lineTo(x, endY);
                
                if (isNearVertical) {
                    ctx.strokeStyle = 'rgba(0, 123, 255, 0.3)';
                    ctx.lineWidth = 1;
                } else {
                    ctx.strokeStyle = MINOR_GRID_COLOR;
                    ctx.lineWidth = 0.5;
                }
                
                ctx.stroke();
            }
        }
        
        for (let y = startY; y <= endY; y += quarterSize) {
            if (y % GRID_SIZE !== 0) {
                const isNearHorizontal = Math.abs(mouseY - y) < hoverDistance;
                
                ctx.beginPath();
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
                
                if (isNearHorizontal) {
                    ctx.strokeStyle = 'rgba(0, 123, 255, 0.3)';
                    ctx.lineWidth = 1;
                } else {
                    ctx.strokeStyle = MINOR_GRID_COLOR;
                    ctx.lineWidth = 0.5;
                }
                
                ctx.stroke();
            }
        }
    }

    // Draw major grid lines
    for (let x = startX; x <= endX; x += GRID_SIZE) {
        const isNearVertical = Math.abs(mouseX - x) < hoverDistance;
        
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        
        if (isNearVertical) {
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 2;
            
            // Draw precise coordinate indicator
            const snapY = Math.round(mouseY / (GRID_SIZE / 4)) * (GRID_SIZE / 4);
            ctx.fillStyle = 'rgba(0, 123, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(x, snapY, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Show precise coordinates
            ctx.font = '12px Arial';
            ctx.fillStyle = '#007bff';
            ctx.textAlign = 'left';
            ctx.fillText(`${(x/GRID_SIZE).toFixed(2)}′, ${(snapY/GRID_SIZE).toFixed(2)}′`, x + 5, snapY - 5);
        } else {
            ctx.strokeStyle = MAJOR_GRID_COLOR;
            ctx.lineWidth = 1;
        }
        
        ctx.stroke();
        
        // Add measurements if zoomed in enough
        if (scale > 0.3) {
            ctx.fillStyle = isNearVertical ? "#007bff" : "#666";
            ctx.font = `${MEASUREMENT_TEXT_SIZE}px Arial`;
            ctx.textAlign = 'left';
            ctx.fillText(`${(x/GRID_SIZE)}′`, x + 2, MEASUREMENT_TEXT_SIZE);
        }
    }
    
    for (let y = startY; y <= endY; y += GRID_SIZE) {
        const isNearHorizontal = Math.abs(mouseY - y) < hoverDistance;
        
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        
        if (isNearHorizontal) {
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 2;
            
            // Draw precise coordinate indicator
            const snapX = Math.round(mouseX / (GRID_SIZE / 4)) * (GRID_SIZE / 4);
            ctx.fillStyle = 'rgba(0, 123, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(snapX, y, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Show precise coordinates
            ctx.font = '12px Arial';
            ctx.fillStyle = '#007bff';
            ctx.textAlign = 'left';
            ctx.fillText(`${(snapX/GRID_SIZE).toFixed(2)}′, ${(y/GRID_SIZE).toFixed(2)}′`, snapX + 5, y - 5);
        } else {
            ctx.strokeStyle = MAJOR_GRID_COLOR;
            ctx.lineWidth = 1;
        }
        
        ctx.stroke();
        
        if (scale > 0.3) {
            ctx.fillStyle = isNearHorizontal ? "#007bff" : "#666";
            ctx.font = `${MEASUREMENT_TEXT_SIZE}px Arial`;
            ctx.textAlign = 'left';
            ctx.fillText(`${(y/GRID_SIZE)}′`, 2, y + MEASUREMENT_TEXT_SIZE);
        }
    }

    // Draw crosshair cursor in draw mode
    if (currentMode === 'draw') {
        const snapX = Math.round(mouseX / (GRID_SIZE / 4)) * (GRID_SIZE / 4);
        const snapY = Math.round(mouseY / (GRID_SIZE / 4)) * (GRID_SIZE / 4);
        
        ctx.strokeStyle = 'rgba(0, 123, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(snapX, startY);
        ctx.lineTo(snapX, endY);
        ctx.stroke();
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(startX, snapY);
        ctx.lineTo(endX, snapY);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // Draw intersection point
        ctx.fillStyle = 'rgba(0, 123, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(snapX, snapY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Show coordinates
        ctx.font = '12px Arial';
        ctx.fillStyle = '#007bff';
        ctx.textAlign = 'left';
        ctx.fillText(`${(snapX/GRID_SIZE).toFixed(2)}′, ${(snapY/GRID_SIZE).toFixed(2)}′`, snapX + 5, snapY - 5);
    }

    ctx.restore();
}

function drawCrosshair(x, y) {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    // Draw crosshair lines
    ctx.strokeStyle = "rgba(0, 123, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    const width = canvas.width / scale;
    const height = canvas.height / scale;
    
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
    
    // Show coordinates
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.font = "12px Arial";
    ctx.fillText(`${(x/GRID_SIZE).toFixed(2)}′, ${(y/GRID_SIZE).toFixed(2)}′`, x + 10, y - 10);
    
    ctx.restore();
}

function drawMeasurements(startX, startY, endX, endY) {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    const width = Math.abs(endX - startX) / GRID_SIZE;
    const height = Math.abs(endY - startY) / GRID_SIZE;
    
    // Convert to feet and inches
    function toFeetAndInches(value) {
        const feet = Math.floor(value);
        const inches = Math.round((value - feet) * 12);
        return `${feet}′${inches ? ` ${inches}″` : ''}`;
    }
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.font = "12px Arial";
    
    // Width measurement
    const widthText = `${toFeetAndInches(width)}`;
    ctx.textAlign = "center";
    ctx.fillText(widthText, startX + (endX - startX)/2, startY - 5);
    
    // Height measurement
    const heightText = `${toFeetAndInches(height)}`;
    ctx.save();
    ctx.translate(startX - 5, startY + (endY - startY)/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(heightText, 0, 0);
    ctx.restore();
    
    // Area calculation
    const area = width * height;
    const areaText = `${area.toFixed(1)} sq ft`;
    ctx.fillText(areaText, startX + (endX - startX)/2, startY + (endY - startY)/2);
    
    ctx.restore();
}


        function drawDropLine(x, isPreview = false) {
            ctx.strokeStyle = isPreview ? 'rgba(0, 123, 255, 0.5)' : 'rgba(0, 123, 255, 0.8)';
            ctx.fillStyle = isPreview ? 'rgba(0, 123, 255, 0.1)' : 'rgba(0, 123, 255, 0.2)';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            
            ctx.fillRect(x, 0, carpetWidthInPixels, canvas.height);
            ctx.strokeRect(x, 0, carpetWidthInPixels, canvas.height);
        }

        function drawRectangle(e) {
    if (!isDrawing) return;

    const currentX = snapToGrid((e.offsetX - offsetX) / scale);
    const currentY = snapToGrid((e.offsetY - offsetY) / scale);

    drawGrid(); // Redraw grid
    drawCrosshair(currentX, currentY);

    // Draw rectangle
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);

    // Draw measurements
    drawMeasurements(startX, startY, currentX, currentY);

    ctx.restore();
}

        function handleDropLinePreview(e) {
    if (currentMode !== 'drop') return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / QUARTER_SIZE) * QUARTER_SIZE;

    // Redraw the canvas to clear previews
    redraw();

    // Show the preview drop line
    drawDropLine(x, true);
}


        function startDrawing(e) {
        if (currentMode !== 'draw' || !selectedRoomId) return;
        
        const rect = canvas.getBoundingClientRect();
        startX = (e.clientX - rect.left + canvasContainer.scrollLeft) / scale;
            startY = (e.clientY - rect.top + canvasContainer.scrollTop) / scale;
        isDrawing = true;
    }

        function draw(e) {
            if (!isDrawing || currentMode !== 'draw') return;
            
            const rect = canvas.getBoundingClientRect();
            const currentX = (e.clientX - rect.left + canvasContainer.scrollLeft) / scale;
            const currentY = (e.clientY - rect.top + canvasContainer.scrollTop) / scale;

            
            redraw();
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            const width = currentX - startX;
            const height = currentY - startY;
            ctx.strokeRect(startX, startY, width, height);
        }

        function stopDrawing(e) {
        if (isDrawing && currentMode === 'draw' && selectedRoomId) {
            const rect = canvas.getBoundingClientRect();
            const endX = (e.clientX - rect.left + canvasContainer.scrollLeft) / scale;
            const endY = (e.clientY - rect.top + canvasContainer.scrollTop) / scale;

            
            const width = endX - startX;
            const height = endY - startY;
            
            if (width !== 0 && height !== 0) {
                const newRect = {
                    x: startX,
                    y: startY,
                    width: width,
                    height: height
                };
                
                const currentRoom = rooms.find(r => r.id === selectedRoomId);
                if (currentRoom) {
                    currentRoom.addRectangle(newRect);
                    updateRoomList();
                }
            }
        }
        
        isDrawing = false;
        redraw();
    }

function drawDropLines() {
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;

            dropLines.forEach(x => {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            });
        }

        function redraw() {
    // Apply zoom transformation
    ctx.save();
    ctx.scale(scale, scale);
    
    // Clear and draw grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    
    // Draw all rooms
    rooms.forEach(room => {
        const isSelected = room.id === selectedRoomId;
        
        // Draw drops for this room
        room.drops.forEach(drop => {
            isVerticalDrop = drop.isVertical;
            drawDropLine(drop.position);
        });
        
        // Draw rectangles for this room
        room.rectangles.forEach(rect => {
            drawRectangle(rect, room, isSelected);
            
            // Draw room label in center of first rectangle
            if (room.rectangles.indexOf(rect) === 0) {
                const rect = room.rectangles[0];
                drawRoomLabel(room.name, rect.x + rect.width/2, rect.y + rect.height/2);
            }
        });
    });
    
    // Draw doors
    doors.forEach(door => door.draw(ctx, door === selectedDoor));
    
    // Draw active measurements if drawing
    if (isDrawing && currentMode === 'draw') {
        drawMeasurements(startX, startY, currentX, currentY);
    }
    
    // Restore canvas state
    ctx.restore();
    
    // Update UI elements
    updateCalculations();
    updateRoomList();
}

        function updateCalculations() {
            let roomArea = 0;
            rectangles.forEach(rect => {
                const width = Math.abs(rect.width) / PIXELS_PER_FOOT;
                const height = Math.abs(rect.height) / PIXELS_PER_FOOT;
                roomArea += width * height;
            });
            
            const roomLength = canvas.height / PIXELS_PER_FOOT;
            const carpetArea = dropLines.length * roomLength * (carpetWidthInPixels / PIXELS_PER_FOOT);
            
            const wastage = Math.max(0, carpetArea - roomArea);
            const efficiency = carpetArea > 0 ? (roomArea / carpetArea) * 100 : 0;
            const wastagePercentage = carpetArea > 0 ? (wastage / carpetArea) * 100 : 0;

            document.getElementById('roomArea').textContent = roomArea.toFixed(2);
            document.getElementById('carpetRequired').textContent = carpetArea.toFixed(2);
            document.getElementById('carpetWastage').textContent = wastage.toFixed(2);
            document.getElementById('wastageIndicator').textContent = `${wastagePercentage.toFixed(1)}%`;
            document.getElementById('efficiencyFill').style.width = `${efficiency}%`;
            document.getElementById('dropCount').textContent = dropLines.length;
            document.getElementById('totalLength').textContent = pixelsToFeetAndInches(roomLength * dropLines.length);
        }

        function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        
        // Draw all rooms
        rooms.forEach(room => {
            const isSelected = room.id === selectedRoomId;
            
            // Draw drops for this room
            room.drops.forEach(drop => {
                isVerticalDrop = drop.isVertical;
                drawDropLine(drop.position);
            });
            
            // Draw rectangles for this room
            room.rectangles.forEach(rect => {
                drawRectangle(rect, isSelected);
                
                // Draw room label in center of first rectangle
                if (room.rectangles.indexOf(rect) === 0) {
                    const centerX = rect.x + rect.width / 2;
                    const centerY = rect.y + rect.height / 2;
                    
                    ctx.font = '14px Arial';
                    ctx.fillStyle = '#000';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // Draw background for label
                    const textWidth = ctx.measureText(room.name).width;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillRect(centerX - textWidth/2 - 5, centerY - 10, textWidth + 10, 20);
                    
                    // Draw text
                    ctx.fillStyle = '#000';
                    ctx.fillText(room.name, centerX, centerY);
                }
            });
        });
        
        // Update calculations
        if (selectedRoomId) {
            const room = rooms.find(r => r.id === selectedRoomId);
            if (room) {
                room.calculateArea();
                room.calculateCarpetUsage();
            }
        }
        
        updateRoomList();
    }

function zoomOut() {
            if (scale > 0.3) {
                scale -= 0.1;
                canvasContainer.scrollLeft = 0;
                canvasContainer.scrollTop = 0;
                redraw();
            }
        }

        function resetZoom() {
            scale = 1;
            redraw();
        }

        function clearAll() {
            if (confirm('Are you sure you want to clear the entire project? This cannot be undone.')) {
                roomManager.clear();
                doorManager.clear();
                window.roomConnections = [];
                window.carpetWastePieces = [];
                window.rectangles = [];
                window.dropLines = [];
                window.isDrawing = false;
                window.currentMode = 'draw';
                window.startX = 0;
                window.startY = 0;
                history.clear();
                redraw();
            }
        }

        function clearDropLines() {
            if (selectedRoomId) {
                roomManager.clearDrops(selectedRoomId);
                redraw();
            }
        }

function addRoom() {
        const room = new Room(nextRoomId++);
        rooms.push(room);
        selectedRoomId = room.id;
        updateRoomList();
        return room;
    }

    function selectRoom(id) {
    selectedRoomId = id;
    updateRoomList();
    
    const room = rooms.find(r => r.id === id);
    if (room) {
        document.getElementById('roomName').value = room.name;
        document.getElementById('roomEditForm').style.display = 'block';
        document.getElementById('roomStyle').style.display = 'block';
        
        // Update room style controls
        document.getElementById('roomColor').value = room.color;
        document.getElementById('carpetType').value = room.carpetType;
        document.getElementById('carpetWidth').value = room.carpetWidth;
        document.getElementById('pileDirection').value = room.pileDirection;
    } else {
        document.getElementById('roomEditForm').style.display = 'none';
        document.getElementById('roomStyle').style.display = 'none';
    }
}

    function deleteRoom(id) {
        if (confirm('Are you sure you want to delete this room? This cannot be undone.')) {
            // Remove associated doors
            doors = doors.filter(door => door.roomId !== id);
            
            // Remove room connections
            roomConnections = roomConnections.filter(conn => 
                conn.room1Id !== id && conn.room2Id !== id
            );
            
            // Remove room
            rooms = rooms.filter(r => r.id !== id);
            
            // Update selection
            if (selectedRoomId === id) {
                selectedRoomId = rooms.length > 0 ? rooms[0].id : null;
            }
            
            history.pushState();
            updateRoomList();
            redraw();
        }
    }

    function updateRoomList() {
        const roomList = document.getElementById('roomList');
        roomList.innerHTML = '';
        
        rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = `room-item ${room.id === selectedRoomId ? 'selected' : ''}`;
            roomElement.innerHTML = `
                <div class="room-item-header">
                    <strong>${room.name}</strong>
                </div>
                <div class="room-details">
                    Area: ${room.area.toFixed(2)} sq ft<br>
                    Carpet Used: ${room.carpetUsed.toFixed(2)} sq ft<br>
                    Wastage: ${room.wastage.toFixed(2)} sq ft
                </div>
            `;
            roomElement.onclick = () => selectRoom(room.id);
            roomList.appendChild(roomElement);
        });
    }

function handleDoorMode(e) {
    if (currentMode !== 'door') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / QUARTER_SIZE) * QUARTER_SIZE;
    const y = Math.round((e.clientY - rect.top) / QUARTER_SIZE) * QUARTER_SIZE;

    // Preview door placement
    redraw();
    new Door(x, y, doorWidth, selectedRoomId).draw(ctx, true);
}

// Add door placement
function addDoor(e) {
    if (currentMode !== 'door' || !selectedRoomId) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / QUARTER_SIZE) * QUARTER_SIZE;
    const y = Math.round((e.clientY - rect.top) / QUARTER_SIZE) * QUARTER_SIZE;
    
    const door = new Door(x, y, doorWidth, selectedRoomId);
    doors.push(door);
    selectedDoor = door;
    
    // Update door controls visibility and values
    const doorControls = document.getElementById('doorControls');
    doorControls.style.display = 'block';
    document.getElementById('doorWidth').value = doorWidth / CONFIG.PIXELS_PER_FOOT;
    document.getElementById('transitionType').value = door.transitionType;
    
    history.pushState();
    redraw();
}

// Door property handlers
const doorPropertyHandlers = {
    'doorWidth': (door, value) => {
        door.width = parseFloat(value) * CONFIG.PIXELS_PER_FOOT;
    },
    'transitionType': (door, value) => {
        door.transitionType = value;
    }
};

// Generic door property change handler
function handleDoorPropertyChange(propertyId, value) {
    if (selectedDoor) {
        const handler = doorPropertyHandlers[propertyId];
        if (handler) {
            handler(selectedDoor, value);
            history.pushState();
            redraw();
        }
    }
}

// Add event listeners for door properties
Object.keys(doorPropertyHandlers).forEach(propertyId => {
    const element = document.getElementById(propertyId);
    if (element) {
        element.addEventListener('change', (e) => {
            handleDoorPropertyChange(propertyId, e.target.value);
        });
    }
});

// Add delete door functionality
document.getElementById('deleteDoor').addEventListener('click', () => {
    if (selectedDoor && confirm('Are you sure you want to delete this door?')) {
        doors = doors.filter(d => d !== selectedDoor);
        selectedDoor = null;
        document.getElementById('doorControls').style.display = 'none';
        history.pushState();
        redraw();
    }
});

// Add to your redraw function
function redraw() {
    // Apply zoom transformation
    ctx.save();
    ctx.scale(scale, scale);
    
    // Clear and draw grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    
    // Draw all rooms
    rooms.forEach(room => {
        const isSelected = room.id === selectedRoomId;
        
        // Draw drops for this room
        room.drops.forEach(drop => {
            isVerticalDrop = drop.isVertical;
            drawDropLine(drop.position);
        });
        
        // Draw rectangles for this room
        room.rectangles.forEach(rect => {
            drawRectangle(rect, room, isSelected);
        });
        
        // Draw room label for first rectangle
        if (room.rectangles.length > 0) {
            const rect = room.rectangles[0];
            const centerX = rect.x + rect.width / 2;
            const centerY = rect.y + rect.height / 2;
            
            drawRoomLabel(room.name, centerX, centerY);
        }
    });
    
    // Draw doors
    doors.forEach(door => door.draw(ctx, door === selectedDoor));
    
    // Restore canvas state
    ctx.restore();
    
    // Update calculations and UI
    updateCalculations();
    updateRoomList();
}

function handleDoorSelection(e) {
    if (currentMode !== 'select') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    selectedDoor = doors.find(door => 
        door.roomId === selectedRoomId && 
        door.containsPoint(x, y)
    );
    
    if (selectedDoor) {
        // Check if clicking controls
        if (y < selectedDoor.y - 10) {
            // Toggle swing direction
            selectedDoor.swingDirection = 
                selectedDoor.swingDirection === 'inward' ? 'outward' : 'inward';
        } else if (x < selectedDoor.x) {
            // Toggle swing side to left
            selectedDoor.swingLeft = true;
        } else if (x > selectedDoor.x + selectedDoor.width) {
            // Toggle swing side to right
            selectedDoor.swingLeft = false;
        }
    }
    
    redraw();
}

function updateUI() {
    // Update button states
    document.querySelectorAll('.toolbar button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${currentMode}Mode`)?.classList.add('active');
    
    // Update controls visibility
    document.getElementById('doorControls').style.display = 
        (currentMode === 'door' && selectedDoor) ? 'block' : 'none';
    
    // Update cursor style based on mode and state
    const container = document.getElementById('canvas-container');
    container.classList.remove('mode-draw', 'mode-pan', 'mode-drop', 'mode-door');
    
    if (isPanning) {
        container.classList.add('mode-pan');
        container.style.cursor = 'grabbing';
    } else {
        switch(currentMode) {
            case 'draw':
                container.classList.add('mode-draw');
                container.style.cursor = 'crosshair';
                break;
            case 'drop':
                container.classList.add('mode-drop');
                container.style.cursor = 'cell';
                break;
            case 'door':
                container.classList.add('mode-door');
                container.style.cursor = 'pointer';
                break;
            default:
                container.classList.add('mode-pan');
                container.style.cursor = 'grab';
        }
    }
    
    redraw();
}

function addDropLine(e) {
    if (currentMode !== 'drop' || !selectedRoomId) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / QUARTER_SIZE) * QUARTER_SIZE;

    const room = rooms.find(r => r.id === selectedRoomId);
    if (!room) return;

    // Check if drop line already exists
    const existingDrop = room.drops.find(d => d.position === x);
    if (!existingDrop) {
        room.drops.push({
            position: x,
            isVertical: isVerticalDrop
        });
        room.calculateCarpetUsage();
        history.pushState();
        redraw();
    }
}

// Add rotate drops functionality
document.getElementById('rotateDrops').addEventListener('click', () => {
    if (selectedRoomId) {
        const room = rooms.find(r => r.id === selectedRoomId);
        if (room && room.drops.length > 0) {
            room.drops.forEach(drop => {
                drop.isVertical = !drop.isVertical;
            });
            room.calculateCarpetUsage();
            history.pushState();
            redraw();
        }
    }
});

// Update clear drops functionality
document.getElementById('clearDrops').addEventListener('click', () => {
    if (selectedRoomId) {
        const room = rooms.find(r => r.id === selectedRoomId);
        if (room && room.drops.length > 0) {
            if (confirm('Are you sure you want to clear all drop lines for this room?')) {
                room.drops = [];
                room.calculateCarpetUsage();
                history.pushState();
                redraw();
            }
        }
    }
});

// Update drop direction handler
document.getElementById('dropDirection').addEventListener('change', (e) => {
    isVerticalDrop = e.target.value === 'vertical';
    if (selectedRoomId) {
        const room = rooms.find(r => r.id === selectedRoomId);
        if (room && room.drops.length > 0) {
            room.drops.forEach(drop => {
                drop.isVertical = isVerticalDrop;
            });
            room.calculateCarpetUsage();
            history.pushState();
            redraw();
        }
    }
});

function zoom(factor) {
    // Get current mouse position relative to canvas
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = (lastMouseX - canvasRect.left) / scale;
    const mouseY = (lastMouseY - canvasRect.top) / scale;

    // Update zoom level
    scale = Math.max(0.3, Math.min(3, scale * factor));

    // Adjust scroll position to keep mouse point steady
    const newMouseX = mouseX * scale;
    const newMouseY = mouseY * scale;
    
    canvasContainer.scrollLeft += (newMouseX - lastMouseX);
    canvasContainer.scrollTop += (newMouseY - lastMouseY);

    redraw();
}

function logDebugState() {
    console.log({
        scale,
        currentMode,
        selectedRoomId,
        roomsCount: rooms.length,
        dropsCount: dropLines.length,
        doorsCount: doors.length,
        canvasSize: {
            width: canvas.width,
            height: canvas.height
        },
        scroll: {
            left: canvasContainer.scrollLeft,
            top: canvasContainer.scrollTop
        },
        selectedRoom: rooms.find(r => r.id === selectedRoomId)
    });
}

function drawPileDirectionArrow(rect, direction) {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const arrowLength = Math.min(rect.width, rect.height) * 0.2;
    
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';
    ctx.lineWidth = 2;
    
    switch(direction) {
        case 'north':
            drawArrow(centerX, centerY + arrowLength/2, centerX, centerY - arrowLength/2);
            break;
        case 'south':
            drawArrow(centerX, centerY - arrowLength/2, centerX, centerY + arrowLength/2);
            break;
        case 'east':
            drawArrow(centerX - arrowLength/2, centerY, centerX + arrowLength/2, centerY);
            break;
        case 'west':
            drawArrow(centerX + arrowLength/2, centerY, centerX - arrowLength/2, centerY);
            break;
    }
}

function drawArrow(fromX, fromY, toX, toY) {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI/6),
               toY - headLength * Math.sin(angle - Math.PI/6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI/6),
               toY - headLength * Math.sin(angle + Math.PI/6));
    ctx.closePath();
    ctx.fill();
}

// Helper function for room labels
function drawRoomLabel(name, x, y) {
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw background
    const textWidth = ctx.measureText(name).width;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(x - textWidth/2 - 5, y - 10, textWidth + 10, 20);
    
    // Draw text
    ctx.fillStyle = '#000';
    ctx.fillText(name, x, y);
}

function drawRectangle(rect, room, isSelected = false) {
    // Fill with room color
    ctx.fillStyle = room.color;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    
    // Draw border
    ctx.strokeStyle = isSelected ? '#007bff' : '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

    // Draw dimensions
    drawDimensions(rect);

    // Draw pile direction if room has carpet
    if (room.carpetType !== 'none') {
        drawPileDirectionArrow(rect, room.pileDirection);
    }
}

// Helper function for dimensions
function drawDimensions(rect) {
    const width = Math.abs(rect.width);
    const height = Math.abs(rect.height);
    
    const widthText = pixelsToFeetAndInches(width);
    const heightText = pixelsToFeetAndInches(height);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    
    // Width dimension
    ctx.fillText(widthText, rect.x + width/2, rect.y - 5);
    
    // Height dimension
    ctx.save();
    ctx.translate(rect.x - 5, rect.y + height/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(heightText, 0, 0);
    ctx.restore();
}


function animateZoom() {
    if (Math.abs(currentScale - targetScale) > 0.01) {
        currentScale += (targetScale - currentScale) * 0.1;
        scale = currentScale;
        drawGrid();
        requestAnimationFrame(animateZoom);
    } else {
        isZooming = false;
    }
}


        // Initialize the application when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);

        function init() {
    // Initialize keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            history.undo();
        } else if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            history.redo();
        } else if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveProject();
        } else if (e.key === 'd') {
            e.preventDefault();
            currentMode = 'draw';
            updateUI();
        } else if (e.key === 'l') {
            e.preventDefault();
            currentMode = 'drop';
            updateUI();
        } else if (e.key === 'o') {
            e.preventDefault();
            currentMode = 'door';
            updateUI();
        }
    });

    // Initialize file input for loading projects
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            loadProject(e.target.files[0]);
        }
    });

    // Project management functions
    function saveProject() {
        const projectData = {
            rooms,
            doors,
            connections: roomConnections,
            wastePieces: carpetWastePieces,
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'carpet-plan.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function loadProject(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const projectData = JSON.parse(e.target.result);
                restoreState(projectData);
                redraw();
                history.pushState(); // Save loaded state to history
            } catch (error) {
                console.error('Failed to load project:', error);
                alert('Failed to load project file. Please ensure it is a valid carpet planner file.');
            }
        };
        reader.readAsText(file);
    }

    drawGrid();
    
    // Mouse event handlers
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', (e) => {
        draw(e);
        handleDropLinePreview(e);
        handleDoorMode(e);
    });
    canvas.addEventListener('mouseup', stopDrawing);
    
    // Click handler for all modes
    canvas.addEventListener('click', (e) => {
        switch(currentMode) {
            case 'drop':
                addDropLine(e);
                break;
            case 'door':
                addDoor(e);
                break;
            case 'select':
                handleDoorSelection(e);
                break;
        }
    });

    // Button event listeners
    document.getElementById('drawMode').addEventListener('click', () => {
        currentMode = 'draw';
        updateUI();
    });
    document.getElementById('dropMode').addEventListener('click', () => {
        currentMode = 'drop';
        updateUI();
    });
    document.getElementById('doorMode').addEventListener('click', () => {
        currentMode = 'door';
        updateUI();
    });
    document.getElementById('clearAll').addEventListener('click', clearAll);
    document.getElementById('clearDrops').addEventListener('click', clearDropLines);

    // Room management
    document.getElementById('addRoom').addEventListener('click', addRoom);

// Add new event listeners for room styling
    // Room property change handlers
    const roomPropertyHandlers = {
        'roomColor': (value) => ({ color: value }),
        'carpetType': (value) => ({ carpetType: value }),
        'roomCarpetWidth': (value) => ({ carpetWidth: parseFloat(value) }),
        'pileDirection': (value) => ({ pileDirection: value }),
        'roomName': (value) => ({ name: value })
    };

    // Generic room property change handler
    function handleRoomPropertyChange(propertyId, value) {
        if (selectedRoomId) {
            const room = rooms.find(r => r.id === selectedRoomId);
            if (room) {
                const propertyUpdate = roomPropertyHandlers[propertyId](value);
                room.updateProperties(propertyUpdate);
                history.pushState();
                redraw();
            }
        }
    }

    // Add event listeners for room properties
    Object.keys(roomPropertyHandlers).forEach(propertyId => {
        const element = document.getElementById(propertyId);
        if (element) {
            element.addEventListener('change', (e) => {
                handleRoomPropertyChange(propertyId, e.target.value);
            });
        }
    });

    // Cleanup and re-add specific event listeners to prevent stacking
    canvas.removeEventListener('mousemove', handleDropLinePreview);
    canvas.addEventListener('mousemove', handleDropLinePreview);
    
    canvas.removeEventListener('mousemove', handleDoorMode);
    canvas.addEventListener('mousemove', handleDoorMode);

    canvas.removeEventListener('mousemove', draw);
    canvas.addEventListener('mousemove', draw);

    updateUI();
}

canvas.addEventListener("wheel", (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    targetScale = scale * zoomFactor;
    targetScale = Math.min(Math.max(targetScale, 0.1), 5); // Limit zoom range
    
    if (!isZooming) {
        isZooming = true;
        animateZoom();
    }
    
    offsetX = mouseX - (mouseX - offsetX) * zoomFactor;
    offsetY = mouseY - (mouseY - offsetY) * zoomFactor;
    
    e.preventDefault();
}, { passive: false }); // Add this options object

// Pan functionality
canvasContainer.addEventListener('mousedown', (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle mouse or Alt+Left click
        isPanning = true;
        lastPanX = e.clientX;
        lastPanY = e.clientY;
        canvasContainer.style.cursor = 'grabbing';
        e.preventDefault();
    }
});

window.addEventListener('mousemove', (e) => {
    if (isPanning) {
        const dx = e.clientX - lastPanX;
        const dy = e.clientY - lastPanY;
        
        canvasContainer.scrollLeft -= dx;
        canvasContainer.scrollTop -= dy;
        
        lastPanX = e.clientX;
        lastPanY = e.clientY;
    }
});

window.addEventListener('mouseup', () => {
    if (isPanning) {
        isPanning = false;
        canvasContainer.style.cursor = 'grab';
    }
});
