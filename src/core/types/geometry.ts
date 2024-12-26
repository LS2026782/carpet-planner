export interface Point2D {
    x: number;
    y: number;
}

export interface Size2D {
    width: number;
    height: number;
}

export interface Rect2D extends Point2D, Size2D {}

export interface Transform2D {
    translate?: Point2D;
    rotate?: number;
    scale?: Point2D | number;
    origin?: Point2D;
}

export interface BoundingBox {
    min: Point2D;
    max: Point2D;
}

export type GeometryType = 'point' | 'line' | 'rect' | 'polygon' | 'circle';

export interface GeometryObject {
    type: GeometryType;
    data: unknown;
}

export interface PointGeometry extends GeometryObject {
    type: 'point';
    data: Point2D;
}

export interface LineGeometry extends GeometryObject {
    type: 'line';
    data: {
        start: Point2D;
        end: Point2D;
    };
}

export interface RectGeometry extends GeometryObject {
    type: 'rect';
    data: Rect2D;
}

export interface PolygonGeometry extends GeometryObject {
    type: 'polygon';
    data: {
        points: Point2D[];
    };
}

export interface CircleGeometry extends GeometryObject {
    type: 'circle';
    data: {
        center: Point2D;
        radius: number;
    };
}

export type Geometry =
    | PointGeometry
    | LineGeometry
    | RectGeometry
    | PolygonGeometry
    | CircleGeometry;

// Helper functions
export function createPoint(x: number, y: number): PointGeometry {
    return {
        type: 'point',
        data: { x, y }
    };
}

export function createLine(start: Point2D, end: Point2D): LineGeometry {
    return {
        type: 'line',
        data: { start, end }
    };
}

export function createRect(x: number, y: number, width: number, height: number): RectGeometry {
    return {
        type: 'rect',
        data: { x, y, width, height }
    };
}

export function createPolygon(points: Point2D[]): PolygonGeometry {
    return {
        type: 'polygon',
        data: { points }
    };
}

export function createCircle(center: Point2D, radius: number): CircleGeometry {
    return {
        type: 'circle',
        data: { center, radius }
    };
}

export function getBoundingBox(geometry: Geometry): BoundingBox {
    switch (geometry.type) {
        case 'point': {
            const point = geometry.data as Point2D;
            return {
                min: { x: point.x, y: point.y },
                max: { x: point.x, y: point.y }
            };
        }
        case 'line': {
            const { start, end } = geometry.data as LineGeometry['data'];
            return {
                min: {
                    x: Math.min(start.x, end.x),
                    y: Math.min(start.y, end.y)
                },
                max: {
                    x: Math.max(start.x, end.x),
                    y: Math.max(start.y, end.y)
                }
            };
        }
        case 'rect': {
            const { x, y, width, height } = geometry.data as RectGeometry['data'];
            return {
                min: { x, y },
                max: { x: x + width, y: y + height }
            };
        }
        case 'polygon': {
            const { points } = geometry.data as PolygonGeometry['data'];
            return points.reduce(
                (box, point) => ({
                    min: {
                        x: Math.min(box.min.x, point.x),
                        y: Math.min(box.min.y, point.y)
                    },
                    max: {
                        x: Math.max(box.max.x, point.x),
                        y: Math.max(box.max.y, point.y)
                    }
                }),
                {
                    min: { x: Infinity, y: Infinity },
                    max: { x: -Infinity, y: -Infinity }
                }
            );
        }
        case 'circle': {
            const { center, radius } = geometry.data as CircleGeometry['data'];
            return {
                min: {
                    x: center.x - radius,
                    y: center.y - radius
                },
                max: {
                    x: center.x + radius,
                    y: center.y + radius
                }
            };
        }
    }
}

export function transformPoint(point: Point2D, transform: Transform2D): Point2D {
    let { x, y } = point;

    if (transform.translate) {
        x += transform.translate.x;
        y += transform.translate.y;
    }

    if (transform.rotate && transform.origin) {
        const angle = transform.rotate * (Math.PI / 180);
        const ox = transform.origin.x;
        const oy = transform.origin.y;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const dx = x - ox;
        const dy = y - oy;
        x = ox + dx * cos - dy * sin;
        y = oy + dx * sin + dy * cos;
    }

    if (transform.scale !== undefined) {
        const scalePoint: Point2D = typeof transform.scale === 'number'
            ? { x: transform.scale, y: transform.scale }
            : transform.scale;
        const origin = transform.origin || { x: 0, y: 0 };
        x = origin.x + (x - origin.x) * scalePoint.x;
        y = origin.y + (y - origin.y) * scalePoint.y;
    }

    return { x, y };
}

export function transformGeometry(geometry: Geometry, transform: Transform2D): Geometry {
    switch (geometry.type) {
        case 'point':
            return {
                type: 'point',
                data: transformPoint(geometry.data as Point2D, transform)
            };
        case 'line':
            const line = geometry.data as LineGeometry['data'];
            return {
                type: 'line',
                data: {
                    start: transformPoint(line.start, transform),
                    end: transformPoint(line.end, transform)
                }
            };
        case 'rect':
            const rect = geometry.data as RectGeometry['data'];
            const topLeft = transformPoint({ x: rect.x, y: rect.y }, transform);
            const bottomRight = transformPoint(
                { x: rect.x + rect.width, y: rect.y + rect.height },
                transform
            );
            return {
                type: 'rect',
                data: {
                    x: topLeft.x,
                    y: topLeft.y,
                    width: bottomRight.x - topLeft.x,
                    height: bottomRight.y - topLeft.y
                }
            };
        case 'polygon':
            const polygon = geometry.data as PolygonGeometry['data'];
            return {
                type: 'polygon',
                data: {
                    points: polygon.points.map(point => transformPoint(point, transform))
                }
            };
        case 'circle':
            const circle = geometry.data as CircleGeometry['data'];
            return {
                type: 'circle',
                data: {
                    center: transformPoint(circle.center, transform),
                    radius: circle.radius * (transform.scale !== undefined
                        ? (typeof transform.scale === 'number'
                            ? transform.scale
                            : Math.min(transform.scale.x, transform.scale.y))
                        : 1
                    )
                }
            };
    }
}
