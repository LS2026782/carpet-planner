import { Point2D } from '../components/canvas/types';
import { EventEmitter } from '../utils/EventEmitter';

export type SwingDirection = 'left' | 'right';

export interface DoorData {
    id: string;
    position: Point2D;
    angle?: number;
    width?: number;
    height?: number;
    swingAngle?: number;
    swingDirection?: SwingDirection;
}

interface DoorEvents {
    positionChange: Point2D;
    angleChange: number;
    dimensionsChange: { width: number; height: number };
    swingChange: { angle: number; direction: SwingDirection };
}

export class Door extends EventEmitter<DoorEvents> {
    readonly id: string;
    private position: Point2D;
    private angle: number;
    private width: number;
    private height: number;
    private swingAngle: number;
    private swingDirection: SwingDirection;

    constructor(id: string, position: Point2D) {
        super();
        this.id = id;
        this.position = { ...position };
        this.angle = 0;
        this.width = 32; // Default door width
        this.height = 80; // Default door height
        this.swingAngle = 0;
        this.swingDirection = 'left';
    }

    getId(): string {
        return this.id;
    }

    getPosition(): Point2D {
        return { ...this.position };
    }

    setPosition(position: Point2D): void {
        this.position = { ...position };
        this.emit('positionChange', this.position);
    }

    getAngle(): number {
        return this.angle;
    }

    setAngle(angle: number): void {
        // Normalize angle to 0-360 range
        this.angle = ((angle % 360) + 360) % 360;
        this.emit('angleChange', this.angle);
    }

    getWidth(): number {
        return this.width;
    }

    setWidth(width: number): void {
        this.width = width;
        this.emit('dimensionsChange', { width: this.width, height: this.height });
    }

    getHeight(): number {
        return this.height;
    }

    setHeight(height: number): void {
        this.height = height;
        this.emit('dimensionsChange', { width: this.width, height: this.height });
    }

    getDimensions(): { width: number; height: number } {
        return {
            width: this.width,
            height: this.height
        };
    }

    setDimensions(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.emit('dimensionsChange', { width, height });
    }

    getSwingAngle(): number {
        return this.swingAngle;
    }

    setSwingAngle(angle: number): void {
        this.swingAngle = angle;
        this.emit('swingChange', { angle, direction: this.swingDirection });
    }

    getSwingDirection(): SwingDirection {
        return this.swingDirection;
    }

    setSwingDirection(direction: SwingDirection): void {
        this.swingDirection = direction;
        this.emit('swingChange', { angle: this.swingAngle, direction });
    }

    setSwing(angle: number, direction: SwingDirection): void {
        this.swingAngle = angle;
        this.swingDirection = direction;
        this.emit('swingChange', { angle, direction });
    }

    getEndpoints(): { start: Point2D; end: Point2D } {
        const rad = (this.angle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const halfWidth = this.width / 2;

        return {
            start: {
                x: this.position.x - halfWidth * cos,
                y: this.position.y - halfWidth * sin
            },
            end: {
                x: this.position.x + halfWidth * cos,
                y: this.position.y + halfWidth * sin
            }
        };
    }

    containsPoint(point: Point2D): boolean {
        const doorPos = this.getPosition();
        const { width, height } = this.getDimensions();
        const angle = this.getAngle();

        // Transform point to door's local space
        const dx = point.x - doorPos.x;
        const dy = point.y - doorPos.y;
        const rad = (angle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const localX = dx * cos + dy * sin;
        const localY = -dx * sin + dy * cos;

        // Check if point is within door bounds
        return (
            localX >= -width / 2 &&
            localX <= width / 2 &&
            localY >= -height / 2 &&
            localY <= height / 2
        );
    }

    clone(): Door {
        const clone = new Door(this.id, this.getPosition());
        clone.setAngle(this.angle);
        clone.setDimensions(this.width, this.height);
        clone.setSwing(this.swingAngle, this.swingDirection);
        return clone;
    }

    toJSON(): DoorData {
        return {
            id: this.id,
            position: this.position,
            angle: this.angle,
            width: this.width,
            height: this.height,
            swingAngle: this.swingAngle,
            swingDirection: this.swingDirection
        };
    }

    static fromJSON(data: DoorData): Door {
        const door = new Door(data.id, data.position);
        if (data.angle !== undefined) door.setAngle(data.angle);
        if (data.width !== undefined) door.setWidth(data.width);
        if (data.height !== undefined) door.setHeight(data.height);
        if (data.swingAngle !== undefined && data.swingDirection !== undefined) {
            door.setSwing(data.swingAngle, data.swingDirection);
        }
        return door;
    }
}
