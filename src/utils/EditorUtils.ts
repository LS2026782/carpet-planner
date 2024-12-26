import { EditablePoint, EditableRoom, SnapResult } from '../types/editor';

export const snapToGrid = (x: number, y: number, gridSize: number): SnapResult => {
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    const snapped = snappedX !== x || snappedY !== y;

    return {
        x: snappedX,
        y: snappedY,
        snapped,
        distance: snapped ? Math.sqrt(Math.pow(x - snappedX, 2) + Math.pow(y - snappedY, 2)) : 0
    };
};

export const snapToPoint = (
    x: number,
    y: number,
    points: EditablePoint[],
    threshold: number
): SnapResult => {
    let closestPoint: EditablePoint | undefined;
    let minDistance = Infinity;

    points.forEach(point => {
        const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
        if (distance < minDistance && distance <= threshold) {
            minDistance = distance;
            closestPoint = point;
        }
    });

    if (closestPoint) {
        return {
            x: closestPoint.x,
            y: closestPoint.y,
            snapped: true,
            point: closestPoint,
            distance: minDistance
        };
    }

    return {
        x,
        y,
        snapped: false,
        distance: 0
    };
};

export const snapToLine = (
    x: number,
    y: number,
    points: EditablePoint[],
    threshold: number
): SnapResult => {
    let minDistance = Infinity;
    let snappedX = x;
    let snappedY = y;

    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];

        const { distance, projectedPoint } = getPointToLineDistance(x, y, p1, p2);

        if (distance < minDistance && distance <= threshold) {
            minDistance = distance;
            snappedX = projectedPoint.x;
            snappedY = projectedPoint.y;
        }
    }

    return {
        x: snappedX,
        y: snappedY,
        snapped: minDistance !== Infinity,
        distance: minDistance
    };
};

export const getPointToLineDistance = (
    x: number,
    y: number,
    p1: EditablePoint,
    p2: EditablePoint
): { distance: number; projectedPoint: { x: number; y: number } } => {
    const A = x - p1.x;
    const B = y - p1.y;
    const C = p2.x - p1.x;
    const D = p2.y - p1.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    let projectedX: number;
    let projectedY: number;

    if (param < 0) {
        projectedX = p1.x;
        projectedY = p1.y;
    } else if (param > 1) {
        projectedX = p2.x;
        projectedY = p2.y;
    } else {
        projectedX = p1.x + param * C;
        projectedY = p1.y + param * D;
    }

    const dx = x - projectedX;
    const dy = y - projectedY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return {
        distance,
        projectedPoint: { x: projectedX, y: projectedY }
    };
};

export const isPointInsideRoom = (point: EditablePoint, room: EditableRoom): boolean => {
    const { x, y } = point;
    const points = room.points;
    let inside = false;

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x;
        const yi = points[i].y;
        const xj = points[j].x;
        const yj = points[j].y;

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
    }

    return inside;
};

export const calculateRoomArea = (points: EditablePoint[]): number => {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
};

export const calculateRoomPerimeter = (points: EditablePoint[]): number => {
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        const dx = points[j].x - points[i].x;
        const dy = points[j].y - points[i].y;
        perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
};
