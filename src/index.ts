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
    const canvasContainer = document.getElementById('canvas-container') as HTMLElement;
    const toolbarContainer = document.getElementById('toolbar') as HTMLElement;
    const settingsPanelContainer = document.getElementById('settings-panel') as HTMLElement;
    const calculationsPanelContainer = document.getElementById('calculations-panel') as HTMLElement;
    const errorContainer = document.getElementById('error-container') as HTMLElement;

    // Create canvas wrapper with grid layout
    const canvasWrapper = document.createElement('div');
    canvasWrapper.className = 'canvas-wrapper';
    canvas.parentElement?.insertBefore(canvasWrapper, canvas);

    // Create rulers
    const rulerCorner = document.createElement('div');
    rulerCorner.className = 'ruler-corner';
    canvasWrapper.appendChild(rulerCorner);

    const rulerHorizontal = document.createElement('div');
    rulerHorizontal.className = 'ruler-horizontal';
    canvasWrapper.appendChild(rulerHorizontal);

    const rulerVertical = document.createElement('div');
    rulerVertical.className = 'ruler-vertical';
    canvasWrapper.appendChild(rulerVertical);

    // Create scrollable content container
    const canvasContent = document.createElement('div');
    canvasContent.className = 'canvas-content';
    canvasContent.appendChild(canvas);
    canvasWrapper.appendChild(canvasContent);

    // Add scroll synchronization
    canvasContent.addEventListener('scroll', () => {
        rulerHorizontal.style.transform = `translateX(-${canvasContent.scrollLeft}px)`;
        rulerVertical.style.transform = `translateY(-${canvasContent.scrollTop}px)`;
    });

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

    // Initialize UI components with settings
    const calculationsPanel = new CalculationsPanel({
        container: calculationsPanelContainer,
        units: 'meters'
    });

    const settingsPanel = new SettingsPanel({
        container: settingsPanelContainer,
        onSettingChange: (setting, value) => {
            try {
                if (setting === 'units') {
                    const units = value as 'meters' | 'feet';
                    canvasManager.getMeasurementRenderer().setUnits(units);
                    calculationsPanel.setUnit(units);
                }
                console.log('Setting changed:', setting, value);
                errorManager.info(`Setting "${setting}" updated successfully`);
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'An unknown error occurred';
                errorManager.error(`Failed to update setting: ${message}`);
            }
        }
    });

    // Setup canvas size
    const resizeCanvas = () => {
        const container = canvas.parentElement as HTMLElement;
        canvas.width = Math.max(container.clientWidth, 800);
        canvas.height = Math.max(container.clientHeight, 600);
        canvas.style.position = 'relative';
        canvas.style.top = '0';
        canvas.style.left = '0';
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
