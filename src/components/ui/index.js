/**
 * UI Components Module
 * Exports all UI-related components
 */

export { Toolbar } from './Toolbar.js';
export { SettingsPanel } from './SettingsPanel.js';
export { CalculationsPanel } from './CalculationsPanel.js';

/**
 * This module provides UI components for the carpet planner application:
 * 
 * - Toolbar: Provides main action buttons and mode controls
 * - SettingsPanel: Manages global application settings
 * - CalculationsPanel: Displays measurements and calculations
 * 
 * Usage:
 * import { Toolbar, SettingsPanel, CalculationsPanel } from './components/ui';
 * 
 * // Create toolbar
 * const toolbar = new Toolbar(toolbarContainer, roomEditor, doorEditor);
 * 
 * // Create settings panel
 * const settings = new SettingsPanel(settingsContainer, canvasRenderer);
 * 
 * // Create calculations panel
 * const calculations = new CalculationsPanel(calculationsContainer);
 * 
 * // Example workflow:
 * toolbar.setMode('room'); // Switch to room editing mode
 * 
 * // When settings button is clicked
 * settings.show();
 * 
 * // When rooms are updated
 * calculations.update(rooms);
 */
