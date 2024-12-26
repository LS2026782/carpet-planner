import { store } from '../state/store';
import { 
    commandExecutor, 
    commandFactory,
    CommandType, 
    CommandPayload, 
    CommandOptions, 
    CommandResult 
} from '../commands';
import { RootState } from '../state/reducers';

export abstract class BaseService {
    protected store = store;
    protected commandExecutor = commandExecutor;

    protected get state(): RootState {
        return this.store.getState();
    }

    protected get dispatch() {
        return this.store.dispatch;
    }

    public async executeCommand(
        type: CommandType,
        payload: CommandPayload,
        options?: CommandOptions
    ): Promise<CommandResult> {
        const command = commandFactory.createCommand(type, payload, options);
        return commandExecutor.execute(command);
    }

    protected async executeCommands(
        commands: Array<{ type: CommandType; payload: CommandPayload; options?: CommandOptions }>
    ): Promise<CommandResult[]> {
        const results: CommandResult[] = [];
        
        for (const command of commands) {
            const result = await this.executeCommand(
                command.type,
                command.payload,
                command.options
            );
            
            results.push(result);
            
            if (!result.success) {
                break;
            }
        }
        
        return results;
    }

    protected async undo(): Promise<CommandResult> {
        return this.commandExecutor.undo();
    }

    protected async redo(): Promise<CommandResult> {
        return this.commandExecutor.redo();
    }

    protected async undoSteps(steps: number): Promise<CommandResult[]> {
        const results: CommandResult[] = [];
        
        for (let i = 0; i < steps; i++) {
            const result = await this.undo();
            results.push(result);
            
            if (!result.success) {
                break;
            }
        }
        
        return results;
    }

    protected async redoSteps(steps: number): Promise<CommandResult[]> {
        const results: CommandResult[] = [];
        
        for (let i = 0; i < steps; i++) {
            const result = await this.redo();
            results.push(result);
            
            if (!result.success) {
                break;
            }
        }
        
        return results;
    }

    protected handleError(error: unknown): never {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(String(error));
    }

    protected validateId(id: string | undefined | null, entityType: string): asserts id is string {
        if (!id) {
            throw new Error(`Invalid ${entityType} ID: ${id}`);
        }
    }

    protected validateExists<T>(
        entity: T | undefined | null,
        entityType: string,
        id: string
    ): asserts entity is T {
        if (!entity) {
            throw new Error(`${entityType} not found: ${id}`);
        }
    }

    protected validateCondition(condition: boolean, message: string): asserts condition {
        if (!condition) {
            throw new Error(message);
        }
    }
}
