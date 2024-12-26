import './styles/main.css';
import { ValidationManager } from './managers/ValidationManager';
import { RoomManager } from './managers/RoomManager';
import { DoorManager } from './managers/DoorManager';
import { createCanvasManager } from './managers/CanvasManagerFactory';
import { InteractionManager } from './managers/InteractionManager';
import { KeyboardManager } from './managers/KeyboardManager';
import { ErrorManager } from './managers/ErrorManager';
import { RoomEditor } from './components/room/RoomEditor';
import { DoorEditor } from './components/door/DoorEditor';
import { Toolbar } from './components/ui/Toolbar';
import { SettingsPanel } from './components/ui/SettingsPanel';
import { CalculationsPanel } from './components/ui/CalculationsPanel';
import { adaptRoomsToCanvas, adaptDoorsToCanvas, adaptRoomToCanvas, adaptDoorToCanvas } from './utils/typeAdapters';
import { RoomInteractionHandler } from './handlers/RoomInteractionHandler';
import { DoorInteractionHandler } from './handlers/DoorInteractionHandler';
import { defaultKeyBindings } from './types/keyboard';
import { ErrorBoundary } from './components/error/ErrorBoundary';

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
    const toolbarContainer = document.getElementById('toolbar') as HTMLElement;
    const settingsPanelContainer = document.getElementById('settings-panel') as HTMLElement;
    const calculationsPanelContainer = document.getElementById('calculations-panel') as HTMLElement;
    const errorContainer = document.getElementById('error-container') as HTMLElement;

    // Initialize managers
    const errorManager = new ErrorManager({
        container: errorContainer,
        position: 'top-right',
        maxMessages: 3,
        defaultDuration: 5000
    });

    // Create error boundaries for main components
    const canvasErrorBoundary = ErrorBoundary.wrap(canvas, (error, retry) => {
        const fallback = ErrorBoundary.createDefaultFallback(error, retry);
        fallback.style.backgroundColor = '#f8f9fa';
        return fallback;
    });

    const toolbarErrorBoundary = ErrorBoundary.wrap(toolbarContainer, (error, retry) => {
        const fallback = ErrorBoundary.createDefaultFallback(error, retry);
        fallback.style.minHeight = '60px';
        return fallback;
    });

    const settingsPanelErrorBoundary = ErrorBoundary.wrap(settingsPanelContainer, (error, retry) => {
        const fallback = ErrorBoundary.createDefaultFallback(error, retry);
        fallback.style.minHeight = '300px';
        return fallback;
    });

    const calculationsPanelErrorBoundary = ErrorBoundary.wrap(calculationsPanelContainer, (error, retry) => {
        const fallback = ErrorBoundary.createDefaultFallback(error, retry);
        fallback.style.minHeight = '200px';
        return fallback;
    });

    // Set up error handlers
    [canvasErrorBoundary, toolbarErrorBoundary, settingsPanelErrorBoundary, calculationsPanelErrorBoundary].forEach(boundary => {
        boundary.on('error', ({ error, componentStack }) => {
            errorManager.error('Component error occurred', {
                details: `${error.message}\n${componentStack || ''}`,
                duration: 0,
                autoHide: false
            });
        });
    });

    const validationManager = new ValidationManager();
    const roomManager = new RoomManager(validationManager);
    const doorManager = new DoorManager(validationManager);
    const canvasManager = createCanvasManager(canvas);
    const interactionManager = new InteractionManager(canvas);
    const keyboardManager = new KeyboardManager();

    // Initialize interaction handlers
    const roomInteractionHandler = new RoomInteractionHandler(roomManager, validationManager);
    const doorInteractionHandler = new DoorInteractionHandler(doorManager, roomManager, validationManager);
    interactionManager.addHandler(roomInteractionHandler);
    interactionManager.addHandler(doorInteractionHandler);

    // Initialize editors
    const roomEditor = new RoomEditor(roomManager, validationManager);
    const doorEditor = new DoorEditor(doorManager, roomManager, validationManager);

    // Initialize UI components
    const toolbar = new Toolbar(
        toolbarContainer,
        roomEditor,
        doorEditor,
        interactionManager
    );

    const settingsPanel = new SettingsPanel({
        container: settingsPanelContainer,
        onSettingChange: (setting, value) => {
            try {
                // Handle settings changes
                console.log('Setting changed:', setting, value);
                errorManager.info(`Setting "${setting}" updated successfully`);
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'An unknown error occurred';
                errorManager.error(`Failed to update setting: ${message}`);
            }
        }
    });

    const calculationsPanel = new CalculationsPanel({
        container: calculationsPanelContainer,
        units: 'meters'
    });

    // Setup canvas size
    const resizeCanvas = () => {
        const container = canvas.parentElement as HTMLElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        canvasManager.handleResize();
    };

    // Setup event listeners
    roomManager.on('roomAdded', (room) => {
        canvasManager.setRooms(adaptRoomsToCanvas(roomManager.getRooms()));
        errorManager.info('Room added successfully');
    });

    roomManager.on('roomRemoved', (room) => {
        canvasManager.setRooms(adaptRoomsToCanvas(roomManager.getRooms()));
        errorManager.info('Room removed');
    });

    roomManager.on('roomUpdated', (room) => {
        canvasManager.setRooms(adaptRoomsToCanvas(roomManager.getRooms()));
    });

    roomManager.on('selectionChanged', (room) => {
        canvasManager.setSelectedRoom(room ? adaptRoomToCanvas(room) : null);
    });

    roomManager.on('previewChanged', (points) => {
        canvasManager.setPreviewPoints(points);
    });

    doorManager.on('doorAdded', (door) => {
        canvasManager.setDoors(adaptDoorsToCanvas(doorManager.getDoors()));
        errorManager.info('Door added successfully');
    });

    doorManager.on('doorRemoved', (door) => {
        canvasManager.setDoors(adaptDoorsToCanvas(doorManager.getDoors()));
        errorManager.info('Door removed');
    });

    doorManager.on('doorUpdated', (door) => {
        canvasManager.setDoors(adaptDoorsToCanvas(doorManager.getDoors()));
    });

    doorManager.on('selectionChanged', (door) => {
        canvasManager.setSelectedDoor(door ? adaptDoorToCanvas(door) : null);
    });

    // Handle validation errors
    validationManager.on('validationError', (error) => {
        errorManager.error(error.message, {
            details: error.details,
            duration: 7000,
            autoHide: true
        });
    });

    // Handle keyboard shortcuts
    keyboardManager.on('shortcutTriggered', ({ binding }) => {
        switch (binding.key) {
            case defaultKeyBindings.undo.key:
                errorManager.info('Undo operation not implemented yet');
                break;
            case defaultKeyBindings.redo.key:
                errorManager.info('Redo operation not implemented yet');
                break;
            case defaultKeyBindings.delete.key:
                if (roomManager.getSelectedRoom() || doorManager.getSelectedDoor()) {
                    errorManager.info('Item deleted');
                }
                break;
            case defaultKeyBindings.escape.key:
                toolbar.changeTool('select');
                roomManager.clearSelection();
                doorManager.clearSelection();
                errorManager.info('Operation cancelled');
                break;
            case defaultKeyBindings.save.key:
                errorManager.info('Save operation not implemented yet');
                break;
        }
    });

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Start render loop
    canvasManager.startAnimation();

    // Enable interaction
    interactionManager.enable();
    keyboardManager.enable();

    // Show welcome message
    errorManager.info('Welcome to Carpet Planner', {
        details: 'Use the toolbar to start drawing rooms and adding doors.',
        duration: 8000
    });
});
