import { RoomManager } from '../managers/RoomManager';
import { ValidationManager } from '../managers/ValidationManager';
import { Point2D } from '../components/canvas/types';
import {
    InteractionHandler,
    DragEvent,
    ResizeEvent,
    RotateEvent,
    SelectEvent,
    HoverEvent,
    KeyboardEvent as CustomKeyboardEvent,
    GestureEvent,
    InteractionMode
} from '../types/events';
import { Room, RoomData } from '../models/Room';
import { v4 as uuidv4 } from 'uuid';

export class RoomInteractionHandler implements InteractionHandler {
    private roomManager: RoomManager;
    private validationManager: ValidationManager;
    private selectedRoom: Room | null = null;
    private selectedPoint: Point2D | null = null;
    private isDrawing: boolean = false;
    private drawingPoints: Point2D[] = [];
    private mode: InteractionMode = 'select';

    constructor(
        roomManager: RoomManager,
        validationManager: ValidationManager
    ) {
        this.roomManager = roomManager;
        this.validationManager = validationManager;
    }

    onDrag = (event: DragEvent): void => {
        if (this.mode !== 'select') return;

        if (this.selectedRoom && this.selectedPoint) {
            // Move selected point
            const newPosition = {
                x: this.selectedPoint.x + event.delta.x,
                y: this.selectedPoint.y + event.delta.y
            };

            if (this.validationManager.validatePointMove(this.selectedRoom, this.selectedPoint, newPosition).isValid) {
                this.selectedPoint = newPosition;
                this.roomManager.updateRoomPoint(this.selectedRoom, this.selectedPoint, newPosition);
            }
        } else if (this.selectedRoom) {
            // Move entire room
            const points = this.selectedRoom.getPoints().map(point => ({
                x: point.x + event.delta.x,
                y: point.y + event.delta.y
            }));

            this.roomManager.updateRoomPoints(this.selectedRoom, points);
        }
    };

    onRotate = (event: RotateEvent): void => {
        if (this.mode !== 'select' || !this.selectedRoom) return;

        const center = this.selectedRoom.getCenter();
        const points = this.selectedRoom.getPoints().map(point => {
            const dx = point.x - center.x;
            const dy = point.y - center.y;
            const rad = (event.angle * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            return {
                x: center.x + dx * cos - dy * sin,
                y: center.y + dx * sin + dy * cos
            };
        });

        const tempRoom = new Room({
            id: this.selectedRoom.getId(),
            points: points
        });

        if (this.validationManager.validateRoom(tempRoom).isValid) {
            this.roomManager.updateRoomPoints(this.selectedRoom, points);
        }
    };

    onResize = (event: ResizeEvent): void => {
        if (this.mode !== 'select' || !this.selectedRoom) return;

        const center = this.selectedRoom.getCenter();
        const points = this.selectedRoom.getPoints().map(point => {
            const dx = point.x - center.x;
            const dy = point.y - center.y;
            return {
                x: center.x + dx * event.scale,
                y: center.y + dy * event.scale
            };
        });

        const tempRoom = new Room({
            id: this.selectedRoom.getId(),
            points: points
        });

        if (this.validationManager.validateRoom(tempRoom).isValid) {
            this.roomManager.updateRoomPoints(this.selectedRoom, points);
        }
    };

    onSelect = (event: SelectEvent): void => {
        if (this.mode === 'draw') {
            this.drawingPoints.push(event.point);
            if (this.drawingPoints.length >= 4) {
                const room = this.roomManager.createRoom(this.drawingPoints);
                if (room) {
                    this.selectedRoom = room;
                    this.roomManager.setSelectedRoom(room);
                }
                this.drawingPoints = [];
                this.isDrawing = false;
                this.roomManager.clearPreview();
            }
            return;
        }

        if (this.mode === 'select') {
            const point = this.roomManager.findPointAtPosition(event.point);
            if (point) {
                this.selectedPoint = point;
                return;
            }

            const room = this.roomManager.findRoomAtPoint(event.point);
            this.selectedRoom = room;
            this.roomManager.setSelectedRoom(room);
            this.selectedPoint = null;
        }
    };

    onHover = (event: HoverEvent): void => {
        if (this.mode === 'draw' && this.isDrawing) {
            // Show preview of room being drawn
            const points = [...this.drawingPoints, event.point];
            if (points.length >= 2) {
                // Create a preview that shows what the complete room would look like
                const previewPoints = [...points];
                if (points.length === 2) {
                    // When we have 2 points, show a rectangle preview
                    const [p1, p2] = points;
                    previewPoints.push({ x: p2.x, y: p1.y + (p2.y - p1.y) });
                    previewPoints.push({ x: p1.x, y: p1.y + (p2.y - p1.y) });
                } else if (points.length === 3) {
                    // When we have 3 points, complete the rectangle
                    const [p1, p2, p3] = points;
                    const p4 = { x: p1.x, y: p3.y };
                    previewPoints.push(p4);
                }
                this.roomManager.previewRoom(previewPoints);
            } else {
                this.roomManager.previewRoom(points);
            }
            return;
        }

        if (this.mode === 'select') {
            const point = this.roomManager.findPointAtPosition(event.point);
            if (point) {
                this.roomManager.setHoveredPoint(point);
                return;
            }

            const room = this.roomManager.findRoomAtPoint(event.point);
            this.roomManager.setHoveredRoom(room);
        }
    };

    onKeyboard = (event: CustomKeyboardEvent): void => {
        if (event.type === 'keyDown') {
            switch (event.key) {
                case 'Delete':
                case 'Backspace':
                    if (this.selectedRoom) {
                        this.roomManager.deleteRoom(this.selectedRoom);
                        this.selectedRoom = null;
                        this.selectedPoint = null;
                    }
                    break;

                case 'Escape':
                    this.roomManager.clearSelection();
                    this.selectedRoom = null;
                    this.selectedPoint = null;
                    this.isDrawing = false;
                    this.drawingPoints = [];
                    this.roomManager.clearPreview();
                    break;

                case 'r':
                    if (this.selectedRoom) {
                        this.onRotate({
                            type: 'rotate',
                            point: this.selectedRoom.getCenter(),
                            angle: 90,
                            center: this.selectedRoom.getCenter(),
                            originalEvent: event.originalEvent
                        });
                    }
                    break;
            }
        }
    };

    onGesture = (event: GestureEvent): void => {
        if (this.mode !== 'select' || !this.selectedRoom) return;

        switch (event.type) {
            case 'pinch':
                if (event.scale !== undefined) {
                    this.onResize({
                        type: 'resize',
                        point: this.selectedRoom.getCenter(),
                        scale: event.scale,
                        center: this.selectedRoom.getCenter(),
                        originalEvent: new MouseEvent('mousemove')
                    });
                }
                break;

            case 'rotate':
                if (event.rotation !== undefined && event.center) {
                    this.onRotate({
                        type: 'rotate',
                        point: this.selectedRoom.getCenter(),
                        angle: event.rotation,
                        center: event.center,
                        originalEvent: new MouseEvent('mousemove')
                    });
                }
                break;
        }
    };

    setMode(mode: InteractionMode): void {
        this.mode = mode;
        if (mode === 'draw') {
            this.startDrawing();
        } else {
            this.stopDrawing();
        }
    }

    startDrawing(): void {
        console.log('Starting drawing mode');
        this.isDrawing = true;
        this.drawingPoints = [];
        this.selectedRoom = null;
        this.selectedPoint = null;
        this.roomManager.clearSelection();
    }

    stopDrawing(): void {
        console.log('Stopping drawing mode');
        this.isDrawing = false;
        this.drawingPoints = [];
        this.roomManager.clearPreview();
    }
}
