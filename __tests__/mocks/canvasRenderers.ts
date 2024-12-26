import {
    CanvasRenderer,
    GridRenderer,
    RoomRenderer,
    DoorRenderer,
    MeasurementRenderer,
    RenderContext,
    RenderOptions,
    Room,
    Door,
    Point2D
} from '../../src/components/canvas/types';

export class MockCanvasRenderer implements CanvasRenderer {
    render = jest.fn();
    destroy = jest.fn();
    setSize = jest.fn();
}

export class MockGridRenderer implements GridRenderer {
    render = jest.fn();
    destroy = jest.fn();
    setGridSize = jest.fn();
    setSize = jest.fn();
}

export class MockRoomRenderer implements RoomRenderer {
    render = jest.fn();
    destroy = jest.fn();
    setRooms = jest.fn();
    setSelectedRoom = jest.fn();
    setSelectedPoint = jest.fn();
    setHoveredPoint = jest.fn();
    setShowMeasurements = jest.fn();
}

export class MockDoorRenderer implements DoorRenderer {
    render = jest.fn();
    destroy = jest.fn();
    setDoors = jest.fn();
    setSelectedDoor = jest.fn();
    setHoveredDoor = jest.fn();
    setShowMeasurements = jest.fn();
}

export class MockMeasurementRenderer implements MeasurementRenderer {
    render = jest.fn();
    destroy = jest.fn();
    setUnits = jest.fn();
    setPrecision = jest.fn();
    setShowLabels = jest.fn();
}

// Create factory functions for mocks
export const createMockCanvasRenderer = (): jest.Mocked<CanvasRenderer> => {
    return new MockCanvasRenderer() as jest.Mocked<CanvasRenderer>;
};

export const createMockGridRenderer = (): jest.Mocked<GridRenderer> => {
    return new MockGridRenderer() as jest.Mocked<GridRenderer>;
};

export const createMockRoomRenderer = (): jest.Mocked<RoomRenderer> => {
    return new MockRoomRenderer() as jest.Mocked<RoomRenderer>;
};

export const createMockDoorRenderer = (): jest.Mocked<DoorRenderer> => {
    return new MockDoorRenderer() as jest.Mocked<DoorRenderer>;
};

export const createMockMeasurementRenderer = (): jest.Mocked<MeasurementRenderer> => {
    return new MockMeasurementRenderer() as jest.Mocked<MeasurementRenderer>;
};

// Mock the modules
jest.mock('../../src/components/canvas/CanvasRenderer', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => createMockCanvasRenderer())
}));

jest.mock('../../src/components/canvas/GridRenderer', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => createMockGridRenderer())
}));

jest.mock('../../src/components/canvas/RoomRenderer', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => createMockRoomRenderer())
}));

jest.mock('../../src/components/canvas/DoorRenderer', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => createMockDoorRenderer())
}));

jest.mock('../../src/components/canvas/MeasurementRenderer', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => createMockMeasurementRenderer())
}));
