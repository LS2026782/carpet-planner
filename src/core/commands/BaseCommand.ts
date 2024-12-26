import {
    Command,
    CommandContext,
    CommandOptions,
    CommandPayload,
    CommandType,
    CommandError,
    CommandErrorType,
    ValidationResult,
} from './types';

export abstract class BaseCommand implements Command {
    protected type: CommandType;
    protected payload: CommandPayload;
    protected options: CommandOptions;
    protected previousState: any;

    constructor(type: CommandType, payload: CommandPayload, options: CommandOptions = {}) {
        this.type = type;
        this.payload = payload;
        this.options = {
            skipHistory: false,
            skipValidation: false,
            ...options,
        };
    }

    async execute(context: CommandContext): Promise<void> {
        try {
            // Validate command if validation is not skipped
            if (!this.options.skipValidation) {
                const validationResult = await this.validate(context);
                if (!validationResult.isValid) {
                    throw new CommandError(
                        CommandErrorType.VALIDATION_ERROR,
                        'Command validation failed',
                        validationResult.errors
                    );
                }
            }

            // Store previous state for undo if history is not skipped
            if (!this.options.skipHistory) {
                this.previousState = await this.getStateToStore(context);
            }

            // Execute command
            await this.doExecute(context);

        } catch (error) {
            if (error instanceof CommandError) {
                throw error;
            }
            throw new CommandError(
                CommandErrorType.EXECUTION_ERROR,
                'Command execution failed',
                error
            );
        }
    }

    async undo(context: CommandContext): Promise<void> {
        try {
            if (this.options.skipHistory) {
                throw new CommandError(
                    CommandErrorType.UNDO_ERROR,
                    'Cannot undo command with skipHistory option'
                );
            }

            if (!this.previousState) {
                throw new CommandError(
                    CommandErrorType.UNDO_ERROR,
                    'No previous state available for undo'
                );
            }

            await this.doUndo(context, this.previousState);

        } catch (error) {
            if (error instanceof CommandError) {
                throw error;
            }
            throw new CommandError(
                CommandErrorType.UNDO_ERROR,
                'Command undo failed',
                error
            );
        }
    }

    async redo(context: CommandContext): Promise<void> {
        try {
            if (this.options.skipHistory) {
                throw new CommandError(
                    CommandErrorType.REDO_ERROR,
                    'Cannot redo command with skipHistory option'
                );
            }

            await this.doExecute(context);

        } catch (error) {
            if (error instanceof CommandError) {
                throw error;
            }
            throw new CommandError(
                CommandErrorType.REDO_ERROR,
                'Command redo failed',
                error
            );
        }
    }

    protected abstract doExecute(context: CommandContext): Promise<void>;
    protected abstract doUndo(context: CommandContext, previousState: any): Promise<void>;
    protected abstract validate(context: CommandContext): Promise<ValidationResult>;
    protected abstract getStateToStore(context: CommandContext): Promise<any>;

    protected getCommandDescription(): string {
        return `${this.type} command`;
    }

    protected validatePayload<T extends CommandPayload>(
        validator: (payload: CommandPayload) => payload is T
    ): T {
        if (!validator(this.payload)) {
            throw new CommandError(
                CommandErrorType.INVALID_PAYLOAD,
                `Invalid payload for ${this.type}`,
                this.payload
            );
        }
        return this.payload as T;
    }

    protected validateExists<T>(
        value: T | undefined | null,
        entityType: string,
        id: string
    ): asserts value is T {
        if (!value) {
            throw new CommandError(
                CommandErrorType.NOT_FOUND,
                `${entityType} not found: ${id}`
            );
        }
    }

    protected validateCondition(
        condition: boolean,
        errorType: CommandErrorType,
        message: string
    ): asserts condition {
        if (!condition) {
            throw new CommandError(errorType, message);
        }
    }

    protected async withErrorHandling<T>(
        operation: () => Promise<T>,
        errorType: CommandErrorType,
        message: string
    ): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            if (error instanceof CommandError) {
                throw error;
            }
            throw new CommandError(errorType, message, error);
        }
    }
}
