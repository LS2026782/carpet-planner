import { Room } from '../../src/models/Room';
import { Point2D } from '../../src/components/canvas/types';

describe('Room', () => {
    let room: Room;
    let points: Point2D[];

    beforeEach(() => {
        points = [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 }
        ];
        room = new Room({
            id: 'room-1',
            points: points
        });
    });

    describe('Basic Properties', () => {
        it('should initialize with provided data', () => {
            expect(room.getId()).toBe('room-1');
            expect(room.getPoints()).toEqual(points);
            expect(room.getName()).toMatch(/Room/);
            expect(room.getPoints()).toHaveLength(4);
        });

        it('should handle point updates', () => {
            const handler = jest.fn();
            room.on('pointsChange', handler);

            const newPoints = [
                { x: 0, y: 0 },
                { x: 200, y: 0 },
                { x: 200, y: 200 },
                { x: 0, y: 200 }
            ];
            room.setPoints(newPoints);

            expect(room.getPoints()).toEqual(newPoints);
            expect(handler).toHaveBeenCalledWith(newPoints);
        });

        it('should handle name changes', () => {
            const handler = jest.fn();
            room.on('nameChange', handler);

            room.setName('Test Room');

            expect(room.getName()).toBe('Test Room');
            expect(handler).toHaveBeenCalledWith('Test Room');
        });
    });

    describe('Point Management', () => {
        it('should update individual points', () => {
            const handler = jest.fn();
            room.on('pointsChange', handler);

            const oldPoint = { x: 0, y: 0 };
            const newPoint = { x: -50, y: -50 };

            room.updatePoint(oldPoint, newPoint);

            const updatedPoints = room.getPoints();
            expect(updatedPoints[0]).toEqual(newPoint);
            expect(handler).toHaveBeenCalled();
        });

        it('should calculate center point', () => {
            const center = room.getCenter();
            expect(center).toEqual({ x: 50, y: 50 });
        });

        it('should calculate bounds', () => {
            const bounds = room.getBounds();
            expect(bounds).toEqual({
                min: { x: 0, y: 0 },
                max: { x: 100, y: 100 }
            });
        });
    });

    describe('Point Containment', () => {
        it('should detect points inside the room', () => {
            expect(room.containsPoint({ x: 50, y: 50 })).toBe(true);
        });

        it('should detect points outside the room', () => {
            expect(room.containsPoint({ x: 150, y: 150 })).toBe(false);
        });

        it('should find closest point', () => {
            const point = { x: 5, y: 5 };
            const closest = room.findClosestPoint(point, 10);
            expect(closest).toEqual({ x: 0, y: 0 });
        });

        it('should find closest edge', () => {
            const point = { x: 50, y: 10 };
            const edge = room.findClosestEdge(point);
            expect(edge.start).toEqual({ x: 0, y: 0 });
            expect(edge.end).toEqual({ x: 100, y: 0 });
            expect(edge.distance).toBeLessThan(20);
        });
    });

    describe('Area and Perimeter', () => {
        it('should calculate area', () => {
            expect(room.calculateArea()).toBe(10000); // 100 * 100
        });

        it('should calculate perimeter', () => {
            expect(room.calculatePerimeter()).toBe(400); // (100 + 100) * 2
        });
    });

    describe('Serialization', () => {
        it('should serialize to JSON', () => {
            const json = room.toJSON();
            expect(json).toEqual({
                id: 'room-1',
                name: room.getName(),
                points: points
            });
        });

        it('should deserialize from JSON', () => {
            const json = room.toJSON();
            const newRoom = Room.fromJSON(json);

            expect(newRoom.getId()).toBe(room.getId());
            expect(newRoom.getName()).toBe(room.getName());
            expect(newRoom.getPoints()).toEqual(room.getPoints());
        });
    });

    describe('Cloning', () => {
        it('should create an exact copy with new ID', () => {
            room.setName('Test Room');
            const clone = room.clone();

            expect(clone.getId()).not.toBe(room.getId());
            expect(clone.getName()).toBe('Test Room (copy)');
            expect(clone.getPoints()).toEqual(room.getPoints());
        });
    });
});
