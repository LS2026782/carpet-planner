import { BaseCommand } from './BaseCommand';
import {
    Command,
    CommandContext,
    CommandOptions,
    CommandPayload,
    CommandType,
    ValidationResult,
} from './types';

export class CompositeCommand extends BaseCommand {
    private commands: Command[];

    constructor(
        type: CommandType,
        payload: CommandPayload,
        commands: Command[],
        options?: CommandOptions
    ) {
        super(type, payload, options);
        this.commands = commands;
    }

    protected override async doExecute(context: CommandContext): Promise<void> {
        for (const command of this.commands) {
            await command.execute(context);
        }
    }

    protected override async doUndo(context: CommandContext): Promise<void> {
        // Undo commands in reverse order
        for (let i = this.commands.length - 1; i >= 0; i--) {
            await this.commands[i].undo(context);
        }
    }

    protected override async validate(context: CommandContext): Promise<ValidationResult> {
        const errors: string[] = [];

        // Validate all commands
        for (const command of this.commands) {
            if (command instanceof BaseCommand) {
                const result = await command['validate'](context);
                if (!result.isValid) {
                    errors.push(...result.errors);
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    protected override async getStateToStore(context: CommandContext): Promise<any[]> {
        const states: any[] = [];

        // Store state for each command
        for (const command of this.commands) {
            if (command instanceof BaseCommand) {
                const state = await command['getStateToStore'](context);
                states.push(state);
            }
        }

        return states;
    }

    protected override getCommandDescription(): string {
        return `Composite command containing ${this.commands.length} commands`;
    }

    // Helper methods
    public getCommands(): Command[] {
        return [...this.commands];
    }

    public addCommand(command: Command): void {
        this.commands.push(command);
    }

    public removeCommand(command: Command): void {
        const index = this.commands.indexOf(command);
        if (index !== -1) {
            this.commands.splice(index, 1);
        }
    }

    public clearCommands(): void {
        this.commands = [];
    }

    public getCommandCount(): number {
        return this.commands.length;
    }

    public isEmpty(): boolean {
        return this.commands.length === 0;
    }

    // Static helper methods
    public static create(
        type: CommandType,
        payload: CommandPayload,
        options?: CommandOptions
    ): CompositeCommand {
        return new CompositeCommand(type, payload, [], options);
    }

    public static combine(
        type: CommandType,
        commands: Command[],
        options?: CommandOptions
    ): CompositeCommand {
        return new CompositeCommand(
            type,
            { type: 'composite' } as CommandPayload,
            commands,
            options
        );
    }
}

// Export a type guard
export function isCompositeCommand(command: Command): command is CompositeCommand {
    return command instanceof CompositeCommand;
}
