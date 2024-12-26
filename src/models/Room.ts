import { Point2D } from '../components/canvas/types';
import { EventEmitter } from '../utils/EventEmitter';
import { v4 as uuidv4 } from 'uuid';

export interface RoomData {
    id: string;
    name?: string;
    points: Point2D[];
}

interface RoomEvents {
    pointsChange: Point2D[];
    nameChange: string;
    selectionChange: boolean;
}

export class Room extends EventEmitter<RoomEvents> {
    readonly id: string;
    private name: string;
    private points: Point2D[];
    private isSelected: boolean;

    constructor(data: RoomData) {
        super();
        this.id = data.id || uuidv4();
        this.name = data.name || `Room ${this.id.slice(0, 4)}`;
        this.points = [...data.points];
        this.isSelected = false;
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
        this.emit('nameChange', name);
    }

    getPoints(): Point2D[] {
        return [...this.points];
    }

    setPoints(points: Point2D[]): void {
        this.points = [...points];
        this.emit('pointsChange', this.points);
    }

    addPoint(point: Point2D): void {
        this.points.push({ ...point });
        this.emit('pointsChange', this.points);
    }

    insertPoint(index: number, point: Point2D): void {
        this.points.splice(index, 0, { ...point });
        this.emit('pointsChange', this.points);
    }

    removePoint(point: Point2D): void {
        const index = this.points.findIndex(p => p.x === point.x && p.y === point.y);
        if (index !== -1) {
            this.points.splice(index, 1);
            this.emit('pointsChange', this.points);
        }
    }

    updatePoint(oldPoint: Point2D, newPoint: Point2D): void {
        const index = this.points.findIndex(p => p.x === oldPoint.x && p.y === oldPoint.y);
        if (index !== -1) {
            this.points[index] = { ...newPoint };
            this.emit('pointsChange', this.points);
        }
    }

    getCenter(): Point2D {
        const sumX = this.points.reduce((sum, point) => sum + point.x, 0);
        const sumY = this.points.reduce((sum, point) => sum + point.y, 0);
        return {
            x: sumX / this.points.length,
            y: sumY / this.points.length
        };
    }

    getBounds(): { min: Point2D; max: Point2D } {
        const xs = this.points.map(p => p.x);
        const ys = this.points.map(p => p.y);
        return {
            min: { x: Math.min(...xs), y: Math.min(...ys) },
            max: { x: Math.max(...xs), y: Math.max(...ys) }
        };
    }

    containsPoint(point: Point2D): boolean {
        let inside = false;
        for (let i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
            const xi = this.points[i].x;
            const yi = this.points[i].y;
            const xj = this.points[j].x;
            const yj = this.points[j].y;

            const intersect = ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    findClosestPoint(point: Point2D, threshold: number = 10): Point2D | null {
        let closestPoint = null;
        let minDistance = threshold;

        for (const p of this.points) {
            const dx = p.x - point.x;
            const dy = p.y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = p;
            }
        }

        return closestPoint;
    }

    findClosestEdge(point: Point2D): { start: Point2D; end: Point2D; distance: number } {
        let closestEdge = {
            start: this.points[0],
            end: this.points[1],
            distance: Infinity
        };

        for (let i = 0; i < this.points.length; i++) {
            const start = this.points[i];
            const end = this.points[(i + 1) % this.points.length];

            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (length * length)));

            const projectionX = start.x + t * dx;
            const projectionY = start.y + t * dy;
            const distance = Math.sqrt(
                (point.x - projectionX) * (point.x - projectionX) +
                (point.y - projectionY) * (point.y - projectionY)
            );

            if (distance < closestEdge.distance) {
                closestEdge = { start, end, distance };
            }
        }

        return closestEdge;
    }

    calculateArea(): number {
        let area = 0;
        for (let i = 0; i < this.points.length; i++) {
            const j = (i + 1) % this.points.length;
            area += this.points[i].x * this.points[j].y;
            area -= this.points[j].x * this.points[i].y;
        }
        return Math.abs(area / 2);
    }

    calculatePerimeter(): number {
        let perimeter = 0;
        for (let i = 0; i < this.points.length; i++) {
            const j = (i + 1) % this.points.length;
            const dx = this.points[j].x - this.points[i].x;
            const dy = this.points[j].y - this.points[i].y;
            perimeter += Math.sqrt(dx * dx + dy * dy);
        }
        return perimeter;
    }

    clone(): Room {
        return new Room({
            id: uuidv4(),
            name: `${this.name} (copy)`,
            points: this.getPoints()
        });
    }

    toJSON(): RoomData {
        return {
            id: this.id,
            name: this.name,
            points: this.points
        };
    }

    static fromJSON(data: RoomData): Room {
        return new Room(data);
    }
}
