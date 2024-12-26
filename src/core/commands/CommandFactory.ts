import { BaseCommand } from './BaseCommand';
import { CompositeCommand } from './CompositeCommand';
import {
    Command,
    CommandType,
    CommandPayload,
    CommandOptions,
    CommandFactory as ICommandFactory,
    CommandError,
    CommandErrorType,
    ValidationResult,
    CommandContext,
    isAddRoomPayload,
    isUpdateRoomPayload,
    isDeleteRoomPayload,
    isAddDoorPayload,
    isUpdateDoorPayload,
    isDeleteDoorPayload,
    isTransformPayload,
    isAddGroupPayload,
    isUpdateGroupPayload,
    isDeleteGroupPayload,
} from './types';

// Base class for all command implementations
abstract class CommandImpl extends BaseCommand {
    constructor(type: CommandType, payload: CommandPayload, options?: CommandOptions) {
        super(type, payload, options);
    }
}

// Room Commands
class AddRoomCommand extends CommandImpl {
    protected override async doExecute(context: CommandContext): Promise<void> {
        const payload = this.validatePayload(isAddRoomPayload);
        context.dispatch({ type: 'room/addRoom', payload });
    }

    protected override async doUndo(context: CommandContext): Promise<void> {
        const payload = this.validatePayload(isAddRoomPayload);
        context.dispatch({ type: 'room/deleteRoom', payload: { id: payload.metadata.id } });
    }

    protected override async validate(context: CommandContext): Promise<ValidationResult> {
        const payload = this.validatePayload(isAddRoomPayload);
        const errors: string[] = [];

        if (!payload.geometry) errors.push('Room geometry is required');
        if (!payload.metadata) errors.push('Room metadata is required');

        return { isValid: errors.length === 0, errors };
    }

    protected override async getStateToStore(): Promise<void> {
        // State restoration handled by undo/redo implementations
    }
}

// Door Commands
class AddDoorCommand extends CommandImpl {
    protected override async doExecute(context: CommandContext): Promise<void> {
        const payload = this.validatePayload(isAddDoorPayload);
        context.dispatch({ type: 'door/addDoor', payload });
    }

    protected override async doUndo(context: CommandContext): Promise<void> {
        const payload = this.validatePayload(isAddDoorPayload);
        context.dispatch({ type: 'door/deleteDoor', payload: { id: payload.metadata.id } });
    }

    protected override async validate(context: CommandContext): Promise<ValidationResult> {
        const payload = this.validatePayload(isAddDoorPayload);
        const errors: string[] = [];

        if (!payload.geometry) errors.push('Door geometry is required');
        if (!payload.metadata) errors.push('Door metadata is required');

        return { isValid: errors.length === 0, errors };
    }

    protected override async getStateToStore(): Promise<void> {
        // State restoration handled by undo/redo implementations
    }
}

// Transform Commands
class TransformObjectsCommand extends CommandImpl {
    private previousTransforms: { [id: string]: any } = {};

    protected override async doExecute(context: CommandContext): Promise<void> {
        const payload = this.validatePayload(isTransformPayload);
        
        // Store previous transforms for undo
        payload.objectIds.forEach(id => {
            const obj = this.findObject(context, id);
            if (obj) {
                this.previousTransforms[id] = obj.transform || null;
            }
        });

        context.dispatch({ type: 'objects/transform', payload });
    }

    protected override async doUndo(context: CommandContext): Promise<void> {
        const payload = this.validatePayload(isTransformPayload);
        
        // Restore previous transforms
        for (const [id, transform] of Object.entries(this.previousTransforms)) {
            context.dispatch({
                type: 'objects/transform',
                payload: {
                    objectIds: [id],
                    transform: transform || { translate: { x: 0, y: 0 } },
                },
            });
        }
    }

    protected override async validate(context: CommandContext): Promise<ValidationResult> {
        const payload = this.validatePayload(isTransformPayload);
        const errors: string[] = [];

        if (!payload.objectIds.length) {
            errors.push('No objects specified for transformation');
        }

        for (const id of payload.objectIds) {
            if (!this.findObject(context, id)) {
                errors.push(`Object not found: ${id}`);
            }
        }

        return { isValid: errors.length === 0, errors };
    }

    protected override async getStateToStore(): Promise<any> {
        return this.previousTransforms;
    }

    private findObject(context: CommandContext, id: string): any {
        return (
            context.state.rooms.rooms[id] ||
            context.state.doors.doors[id] ||
            context.state.groups?.groups[id]
        );
    }
}

export class CommandFactory implements ICommandFactory {
    createCommand(
        type: CommandType,
        payload: CommandPayload,
        options?: CommandOptions
    ): Command {
        switch (type) {
            // Room commands
            case 'ADD_ROOM':
                return new AddRoomCommand(type, payload, options);
            case 'UPDATE_ROOM':
                return this.createUpdateCommand(type, payload, options, isUpdateRoomPayload, 'room');
            case 'DELETE_ROOM':
                return this.createDeleteCommand(type, payload, options, isDeleteRoomPayload, 'room');

            // Door commands
            case 'ADD_DOOR':
                return new AddDoorCommand(type, payload, options);
            case 'UPDATE_DOOR':
                return this.createUpdateCommand(type, payload, options, isUpdateDoorPayload, 'door');
            case 'DELETE_DOOR':
                return this.createDeleteCommand(type, payload, options, isDeleteDoorPayload, 'door');

            // Transform commands
            case 'TRANSFORM_OBJECTS':
            case 'MOVE_OBJECTS':
            case 'ROTATE_OBJECTS':
            case 'SCALE_OBJECTS':
                return new TransformObjectsCommand(type, payload, options);

            // Group commands
            case 'GROUP_OBJECTS':
                return this.createGroupCommand(type, payload, options);
            case 'UNGROUP_OBJECTS':
                return this.createUngroupCommand(type, payload, options);
            case 'UPDATE_GROUP':
                return this.createUpdateCommand(type, payload, options, isUpdateGroupPayload, 'group');

            default:
                throw new CommandError(
                    CommandErrorType.INVALID_PAYLOAD,
                    `Unknown command type: ${type}`
                );
        }
    }

    private createUpdateCommand(
        type: CommandType,
        payload: CommandPayload,
        options: CommandOptions | undefined,
        validator: (payload: CommandPayload) => boolean,
        entityType: string
    ): Command {
        return new class extends CommandImpl {
            private previousState: any;

            protected override async doExecute(context: CommandContext): Promise<void> {
                const validPayload = this.validatePayload(validator);
                context.dispatch({ type: `${entityType}/update${entityType}`, payload: validPayload });
            }

            protected override async doUndo(context: CommandContext): Promise<void> {
                context.dispatch({
                    type: `${entityType}/update${entityType}`,
                    payload: this.previousState,
                });
            }

            protected override async validate(context: CommandContext): Promise<ValidationResult> {
                const validPayload = this.validatePayload(validator);
                const errors: string[] = [];

                if (!validPayload.id) {
                    errors.push(`${entityType} ID is required`);
                }

                return { isValid: errors.length === 0, errors };
            }

            protected override async getStateToStore(context: CommandContext): Promise<any> {
                const validPayload = this.validatePayload(validator);
                const state = context.state as any;
                return state[`${entityType}s`][`${entityType}s`][validPayload.id];
            }
        }(type, payload, options);
    }

    private createDeleteCommand(
        type: CommandType,
        payload: CommandPayload,
        options: CommandOptions | undefined,
        validator: (payload: CommandPayload) => boolean,
        entityType: string
    ): Command {
        return new class extends CommandImpl {
            private previousState: any;

            protected override async doExecute(context: CommandContext): Promise<void> {
                const validPayload = this.validatePayload(validator);
                context.dispatch({ type: `${entityType}/delete${entityType}`, payload: validPayload });
            }

            protected override async doUndo(context: CommandContext): Promise<void> {
                context.dispatch({
                    type: `${entityType}/add${entityType}`,
                    payload: this.previousState,
                });
            }

            protected override async validate(context: CommandContext): Promise<ValidationResult> {
                const validPayload = this.validatePayload(validator);
                const errors: string[] = [];

                if (!validPayload.id) {
                    errors.push(`${entityType} ID is required`);
                }

                return { isValid: errors.length === 0, errors };
            }

            protected override async getStateToStore(context: CommandContext): Promise<any> {
                const validPayload = this.validatePayload(validator);
                const state = context.state as any;
                return state[`${entityType}s`][`${entityType}s`][validPayload.id];
            }
        }(type, payload, options);
    }

    private createGroupCommand(
        type: CommandType,
        payload: CommandPayload,
        options?: CommandOptions
    ): Command {
        return new class extends CommandImpl {
            protected override async doExecute(context: CommandContext): Promise<void> {
                const validPayload = this.validatePayload(isAddGroupPayload);
                context.dispatch({ type: 'group/addGroup', payload: validPayload });
            }

            protected override async doUndo(context: CommandContext): Promise<void> {
                const validPayload = this.validatePayload(isAddGroupPayload);
                context.dispatch({
                    type: 'group/deleteGroup',
                    payload: { id: validPayload.metadata?.id },
                });
            }

            protected override async validate(context: CommandContext): Promise<ValidationResult> {
                const validPayload = this.validatePayload(isAddGroupPayload);
                const errors: string[] = [];

                if (!validPayload.objectIds.length) {
                    errors.push('No objects specified for grouping');
                }

                return { isValid: errors.length === 0, errors };
            }

            protected override async getStateToStore(): Promise<void> {
                // State restoration handled by undo/redo implementations
            }
        }(type, payload, options);
    }

    private createUngroupCommand(
        type: CommandType,
        payload: CommandPayload,
        options?: CommandOptions
    ): Command {
        return new class extends CommandImpl {
            private previousState: any;

            protected override async doExecute(context: CommandContext): Promise<void> {
                const validPayload = this.validatePayload(isDeleteGroupPayload);
                context.dispatch({ type: 'group/deleteGroup', payload: validPayload });
            }

            protected override async doUndo(context: CommandContext): Promise<void> {
                context.dispatch({
                    type: 'group/addGroup',
                    payload: this.previousState,
                });
            }

            protected override async validate(context: CommandContext): Promise<ValidationResult> {
                const validPayload = this.validatePayload(isDeleteGroupPayload);
                const errors: string[] = [];

                if (!validPayload.id) {
                    errors.push('Group ID is required');
                }

                return { isValid: errors.length === 0, errors };
            }

            protected override async getStateToStore(context: CommandContext): Promise<any> {
                const validPayload = this.validatePayload(isDeleteGroupPayload);
                return context.state.groups?.groups[validPayload.id];
            }
        }(type, payload, options);
    }
}

// Export singleton instance
export const commandFactory = new CommandFactory();
