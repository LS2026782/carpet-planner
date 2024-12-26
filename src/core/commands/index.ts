import { BaseCommand } from './BaseCommand';
import { CompositeCommand, isCompositeCommand } from './CompositeCommand';
import { CommandExecutor, commandExecutor } from './CommandExecutor';
import { CommandFactory } from './CommandFactory';
import { CommandValidator } from './CommandValidator';

export {
    // Base classes
    BaseCommand,
    CompositeCommand,
    
    // Implementations
    CommandExecutor,
    CommandFactory,
    CommandValidator,
    
    // Type guards
    isCompositeCommand,
    
    // Singleton instances
    commandExecutor,
};

// Re-export types
export * from './types';

// Helper function to create a composite command
export function createCompositeCommand(
    type: string,
    commands: BaseCommand[],
    options?: any
): CompositeCommand {
    return CompositeCommand.combine(type as any, commands, options);
}

// Helper function to execute multiple commands in sequence
export async function executeCommands(commands: BaseCommand[]): Promise<void> {
    for (const command of commands) {
        const result = await commandExecutor.execute(command);
        if (!result.success) {
            throw new Error(result.error);
        }
    }
}

// Helper function to batch multiple commands into a single composite command
export function batchCommands(
    type: string,
    commands: BaseCommand[],
    options?: any
): CompositeCommand {
    return createCompositeCommand(type, commands, {
        ...options,
        skipHistory: false, // Ensure history is tracked for batch operations
    });
}

// Helper function to create a command that can be undone
export function createUndoableCommand(
    type: string,
    execute: () => Promise<void>,
    undo: () => Promise<void>
): BaseCommand {
    return new class extends BaseCommand {
        protected override async doExecute(): Promise<void> {
            await execute();
        }

        protected override async doUndo(): Promise<void> {
            await undo();
        }

        protected override async validate(): Promise<any> {
            return { isValid: true, errors: [] };
        }

        protected override async getStateToStore(): Promise<void> {
            // No state needed as undo function is provided
        }
    }(type as any, {} as any);
}
