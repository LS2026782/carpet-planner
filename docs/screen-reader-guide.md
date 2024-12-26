# Screen Reader Guide

This document outlines the screen reader behaviors and commands for the Carpet Planner application.

## General Navigation

### NVDA (Windows)

| Action | Command | Description |
|--------|---------|-------------|
| Enter Canvas | `Tab` to canvas | "Drawing canvas, application" |
| Navigate Grid | Arrow keys | "Grid position X, Y" |
| Place Point | `Space` or `Enter` | "Point placed at X, Y" |
| Change Mode | `Tab` | "Mode changed to [mode]" |
| Cancel Action | `Escape` | "Action cancelled" |
| Access Menu | `Alt + M` | "Menu button" |
| Toggle Tools | `Alt + T` | "Tools panel" |
| Get Help | `Alt + H` | "Help dialog" |

### VoiceOver (macOS)

| Action | Command | Description |
|--------|---------|-------------|
| Enter Canvas | `VO + Tab` to canvas | "Drawing canvas, application" |
| Navigate Grid | Arrow keys with `VO` | "Grid position X, Y" |
| Place Point | `VO + Space` | "Point placed at X, Y" |
| Change Mode | `VO + Tab` | "Mode changed to [mode]" |
| Cancel Action | `Escape` | "Action cancelled" |
| Access Menu | `VO + M` | "Menu button" |
| Toggle Tools | `VO + T` | "Tools panel" |
| Get Help | `VO + H` | "Help dialog" |

### JAWS (Windows)

| Action | Command | Description |
|--------|---------|-------------|
| Enter Canvas | `Tab` to canvas | "Drawing canvas, application" |
| Navigate Grid | Arrow keys | "Grid position X, Y" |
| Place Point | `Space` or `Enter` | "Point placed at X, Y" |
| Change Mode | `Tab` | "Mode changed to [mode]" |
| Cancel Action | `Escape` | "Action cancelled" |
| Access Menu | `Alt + M` | "Menu button" |
| Toggle Tools | `Alt + T` | "Tools panel" |
| Get Help | `Alt + H` | "Help dialog" |

## Canvas Operations

### Room Creation

1. Navigate to canvas
2. Enter draw mode
3. Use arrow keys to move cursor
4. Press Space/Enter to place points
5. Press Escape to complete room

Announcements:
- "Drawing mode activated"
- "Grid position X, Y"
- "Point placed at X, Y"
- "Room completed, area [value] square feet"

### Door Placement

1. Navigate to canvas
2. Enter door mode
3. Use arrow keys to position
4. Press Space/Enter to place
5. Use arrow keys to adjust angle
6. Press Enter to confirm

Announcements:
- "Door mode activated"
- "Door position X, Y"
- "Door placed"
- "Adjusting door angle, [value] degrees"
- "Door placement confirmed"

### Measurements

1. Navigate to measurement
2. Press Enter to hear details
3. Use arrow keys to move between measurements

Announcements:
- "Wall length [value] feet"
- "Room area [value] square feet"
- "Door width [value] feet"

## UI Components

### Toolbar

1. Tab to toolbar
2. Use arrow keys to navigate tools
3. Press Space/Enter to select

Announcements:
- "Toolbar, [number] tools available"
- "[Tool name] tool, selected/not selected"
- "Tool activated/deactivated"

### Settings Panel

1. Open settings (`Alt + S`)
2. Tab through options
3. Use Space/Enter to toggle
4. Use arrow keys for values

Announcements:
- "Settings panel"
- "[Setting name], [current value]"
- "Value changed to [new value]"
- "Setting applied"

### Calculations Panel

1. Navigate to panel
2. Use arrow keys to browse calculations
3. Press Enter for details

Announcements:
- "Calculations panel"
- "[Calculation type]: [value]"
- "Detailed breakdown: [details]"

## Error Handling

### Validation Errors

Announcements:
- "Error: [error message]"
- "Invalid input at [location]"
- "Required field missing"
- "Value out of range"

### System Errors

Announcements:
- "Application error occurred"
- "Operation failed: [reason]"
- "Connection lost"
- "Recovery options available"

## Modal Dialogs

### Focus Management

1. Focus automatically moves to modal
2. Tab cycles through modal controls
3. Escape closes modal
4. Focus returns to trigger element

Announcements:
- "Dialog: [title]"
- "Modal dialog opened"
- "Modal dialog closed"

### Alerts

Announcements:
- "Alert: [message]"
- "Warning: [message]"
- "Success: [message]"

## Best Practices

### For Users

1. Use browse mode for overview
2. Use focus mode for interaction
3. Listen for live region updates
4. Use landmarks for navigation
5. Check help documentation

### For Testing

1. Test with multiple screen readers
2. Verify all announcements
3. Check focus management
4. Test keyboard navigation
5. Verify error handling

## Known Issues

### NVDA

1. Grid navigation delay
   - Workaround: Wait for announcement
   - Status: Under investigation

### VoiceOver

1. Modal focus trap
   - Workaround: Use Escape key
   - Status: Fixed in next release

### JAWS

1. Measurement announcements
   - Workaround: Use arrow keys
   - Status: Patch scheduled

## Support

For screen reader support:
1. Check documentation
2. Use help command
3. Contact support team
4. Report accessibility issues

## Updates

This guide is updated with each release. Check version history for changes.
