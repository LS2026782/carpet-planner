import {
    Command,
    CommandContext,
    CommandError,
    CommandErrorType,
    CommandExecutor as ICommandExecutor,
    CommandHistory,
    CommandResult,
} from './types';
import { store } from '../state/store';

export class CommandExecutor implements ICommandExecutor {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];
    private maxHistorySize: number = 100;
    private isExecuting: boolean = false;

    constructor(maxHistorySize: number = 100) {
        this.maxHistorySize = maxHistorySize;
    }

    async execute(command: Command): Promise<CommandResult> {
        if (this.isExecuting) {
            return {
                success: false,
                error: 'Another command is currently executing',
            };
        }

        this.isExecuting = true;

        try {
            const context = this.createContext();
            await command.execute(context);

            // Add to undo stack if history tracking is enabled
            if (!this.isHistoryDisabled(command)) {
                this.addToUndoStack(command);
                this.redoStack = []; // Clear redo stack after new command
            }

            return { success: true };
        } catch (error) {
            if (error instanceof CommandError) {
                return {
                    success: false,
                    error: error.message,
                    data: error,
                };
            }
            return {
                success: false,
                error: 'Command execution failed',
                data: error,
            };
        } finally {
            this.isExecuting = false;
        }
    }

    async undo(): Promise<CommandResult> {
        if (this.isExecuting) {
            return {
                success: false,
                error: 'Another command is currently executing',
            };
        }

        if (this.undoStack.length === 0) {
            return {
                success: false,
                error: 'No commands to undo',
            };
        }

        this.isExecuting = true;

        try {
            const command = this.undoStack.pop()!;
            const context = this.createContext();
            await command.undo(context);

            this.redoStack.push(command);
            return { success: true };
        } catch (error) {
            if (error instanceof CommandError) {
                return {
                    success: false,
                    error: error.message,
                    data: error,
                };
            }
            return {
                success: false,
                error: 'Command undo failed',
                data: error,
            };
        } finally {
            this.isExecuting = false;
        }
    }

    async redo(): Promise<CommandResult> {
        if (this.isExecuting) {
            return {
                success: false,
                error: 'Another command is currently executing',
            };
        }

        if (this.redoStack.length === 0) {
            return {
                success: false,
                error: 'No commands to redo',
            };
        }

        this.isExecuting = true;

        try {
            const command = this.redoStack.pop()!;
            const context = this.createContext();
            await command.redo(context);

            this.undoStack.push(command);
            return { success: true };
        } catch (error) {
            if (error instanceof CommandError) {
                return {
                    success: false,
                    error: error.message,
                    data: error,
                };
            }
            return {
                success: false,
                error: 'Command redo failed',
                data: error,
            };
        } finally {
            this.isExecuting = false;
        }
    }

    clearHistory(): void {
        this.undoStack = [];
        this.redoStack = [];
    }

    getHistory(): CommandHistory {
        return {
            undoStack: [...this.undoStack],
            redoStack: [...this.redoStack],
        };
    }

    private createContext(): CommandContext {
        return {
            state: store.getState(),
            dispatch: store.dispatch,
        };
    }

    private addToUndoStack(command: Command): void {
        this.undoStack.push(command);
        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift(); // Remove oldest command
        }
    }

    private isHistoryDisabled(command: Command): boolean {
        return !!(command as any).options?.skipHistory;
    }

    // Helper methods
    canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    getUndoStackSize(): number {
        return this.undoStack.length;
    }

    getRedoStackSize(): number {
        return this.redoStack.length;
    }

    getMaxHistorySize(): number {
        return this.maxHistorySize;
    }

    setMaxHistorySize(size: number): void {
        this.maxHistorySize = size;
        while (this.undoStack.length > size) {
            this.undoStack.shift();
        }
    }

    isCommandExecuting(): boolean {
        return this.isExecuting;
    }
}

// Export singleton instance
export const commandExecutor = new CommandExecutor();
