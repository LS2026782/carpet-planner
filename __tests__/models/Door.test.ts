import { Door, SwingDirection } from '../../src/models/Door';
import { Point2D } from '../../src/components/canvas/types';

describe('Door', () => {
    let door: Door;
    let position: Point2D;

    beforeEach(() => {
        position = { x: 100, y: 100 };
        door = new Door('door-1', position);
    });

    describe('Basic Properties', () => {
        it('should initialize with provided data', () => {
            expect(door.getId()).toBe('door-1');
            expect(door.getPosition()).toEqual(position);
            expect(door.getAngle()).toBe(0);
            expect(door.getDimensions()).toEqual({
                width: 32,
                height: 80
            });
            expect(door.getSwingAngle()).toBe(0);
            expect(door.getSwingDirection()).toBe('left');
        });

        it('should handle position changes', () => {
            const handler = jest.fn();
            door.on('positionChange', handler);

            const newPosition = { x: 200, y: 200 };
            door.setPosition(newPosition);

            expect(door.getPosition()).toEqual(newPosition);
            expect(handler).toHaveBeenCalledWith(newPosition);
        });

        it('should handle angle changes', () => {
            const handler = jest.fn();
            door.on('angleChange', handler);

            door.setAngle(90);

            expect(door.getAngle()).toBe(90);
            expect(handler).toHaveBeenCalledWith(90);
        });

        it('should normalize angles', () => {
            door.setAngle(450); // 450° = 90°
            expect(door.getAngle()).toBe(90);

            door.setAngle(-90); // -90° = 270°
            expect(door.getAngle()).toBe(270);
        });
    });

    describe('Dimensions', () => {
        it('should handle width changes', () => {
            const handler = jest.fn();
            door.on('dimensionsChange', handler);

            door.setWidth(40);

            expect(door.getWidth()).toBe(40);
            expect(handler).toHaveBeenCalledWith({ width: 40, height: 80 });
        });

        it('should handle height changes', () => {
            const handler = jest.fn();
            door.on('dimensionsChange', handler);

            door.setHeight(90);

            expect(door.getHeight()).toBe(90);
            expect(handler).toHaveBeenCalledWith({ width: 32, height: 90 });
        });

        it('should handle dimension changes', () => {
            const handler = jest.fn();
            door.on('dimensionsChange', handler);

            door.setDimensions(40, 90);

            expect(door.getDimensions()).toEqual({ width: 40, height: 90 });
            expect(handler).toHaveBeenCalledWith({ width: 40, height: 90 });
        });
    });

    describe('Swing Properties', () => {
        it('should handle swing angle changes', () => {
            const handler = jest.fn();
            door.on('swingChange', handler);

            door.setSwingAngle(45);

            expect(door.getSwingAngle()).toBe(45);
            expect(handler).toHaveBeenCalledWith({ angle: 45, direction: 'left' });
        });

        it('should handle swing direction changes', () => {
            const handler = jest.fn();
            door.on('swingChange', handler);

            door.setSwingDirection('right');

            expect(door.getSwingDirection()).toBe('right');
            expect(handler).toHaveBeenCalledWith({ angle: 0, direction: 'right' });
        });

        it('should handle combined swing changes', () => {
            const handler = jest.fn();
            door.on('swingChange', handler);

            door.setSwing(45, 'right');

            expect(door.getSwingAngle()).toBe(45);
            expect(door.getSwingDirection()).toBe('right');
            expect(handler).toHaveBeenCalledWith({ angle: 45, direction: 'right' });
        });
    });

    describe('Point Containment', () => {
        it('should detect points inside the door', () => {
            expect(door.containsPoint({ x: 100, y: 100 })).toBe(true);
        });

        it('should detect points outside the door', () => {
            expect(door.containsPoint({ x: 200, y: 200 })).toBe(false);
        });

        it('should handle rotated door containment', () => {
            door.setAngle(45);
            expect(door.containsPoint({ x: 100, y: 100 })).toBe(true);
            expect(door.containsPoint({ x: 200, y: 200 })).toBe(false);
        });
    });

    describe('Endpoints', () => {
        it('should calculate correct endpoints', () => {
            const endpoints = door.getEndpoints();
            const width = door.getWidth();

            expect(endpoints.start).toEqual({
                x: position.x - width / 2,
                y: position.y
            });
            expect(endpoints.end).toEqual({
                x: position.x + width / 2,
                y: position.y
            });
        });

        it('should calculate rotated endpoints', () => {
            door.setAngle(90);
            const endpoints = door.getEndpoints();
            const width = door.getWidth();

            expect(endpoints.start.x).toBeCloseTo(position.x);
            expect(endpoints.start.y).toBeCloseTo(position.y - width / 2);
            expect(endpoints.end.x).toBeCloseTo(position.x);
            expect(endpoints.end.y).toBeCloseTo(position.y + width / 2);
        });
    });

    describe('Serialization', () => {
        it('should serialize to JSON', () => {
            const json = door.toJSON();
            expect(json).toEqual({
                id: 'door-1',
                position: { x: 100, y: 100 },
                angle: 0,
                width: 32,
                height: 80,
                swingAngle: 0,
                swingDirection: 'left'
            });
        });

        it('should deserialize from JSON', () => {
            const json = door.toJSON();
            const newDoor = Door.fromJSON(json);

            expect(newDoor.getId()).toBe(door.getId());
            expect(newDoor.getPosition()).toEqual(door.getPosition());
            expect(newDoor.getAngle()).toBe(door.getAngle());
            expect(newDoor.getDimensions()).toEqual(door.getDimensions());
            expect(newDoor.getSwingAngle()).toBe(door.getSwingAngle());
            expect(newDoor.getSwingDirection()).toBe(door.getSwingDirection());
        });
    });

    describe('Cloning', () => {
        it('should create an exact copy', () => {
            door.setAngle(45);
            door.setDimensions(40, 90);
            door.setSwing(30, 'right');

            const clone = door.clone();

            expect(clone.getId()).toBe(door.getId());
            expect(clone.getPosition()).toEqual(door.getPosition());
            expect(clone.getAngle()).toBe(door.getAngle());
            expect(clone.getDimensions()).toEqual(door.getDimensions());
            expect(clone.getSwingAngle()).toBe(door.getSwingAngle());
            expect(clone.getSwingDirection()).toBe(door.getSwingDirection());
        });
    });
});
