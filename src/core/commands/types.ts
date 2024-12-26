import { RootState } from '../state/reducers';
import { AppDispatch } from '../state/store';
import { GeometryObject, Transform2D } from '../types/geometry';
import { Room } from '../state/types/room';
import { Door } from '../state/types/door';
import { Group } from '../services/GroupService';

export interface CommandContext {
    state: RootState;
    dispatch: AppDispatch;
}

export interface Command {
    execute(context: CommandContext): Promise<void>;
    undo(context: CommandContext): Promise<void>;
    redo(context: CommandContext): Promise<void>;
}

export interface CommandHistory {
    undoStack: Command[];
    redoStack: Command[];
}

export interface Style {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    opacity?: number;
    dashPattern?: number[];
}

export interface ObjectMetadata {
    id: string;
    name?: string;
    type: 'room' | 'door' | 'group';
    style?: Style;
    [key: string]: any;
}

// Room Commands
export interface AddRoomPayload {
    geometry: GeometryObject;
    metadata: ObjectMetadata;
    transform?: Transform2D;
}

export interface UpdateRoomPayload {
    id: string;
    room: Partial<Room>;
}

export interface DeleteRoomPayload {
    id: string;
}

// Door Commands
export interface AddDoorPayload {
    geometry: GeometryObject;
    metadata: ObjectMetadata;
    transform?: Transform2D;
    roomId: string | null;
}

export interface UpdateDoorPayload {
    id: string;
    door: Partial<Door>;
}

export interface DeleteDoorPayload {
    id: string;
}

// Group Commands
export interface AddGroupPayload {
    objectIds: string[];
    metadata?: ObjectMetadata;
}

export interface UpdateGroupPayload {
    id: string;
    objectIds: string[];
    metadata?: ObjectMetadata;
}

export interface DeleteGroupPayload {
    id: string;
}

// Transform Commands
export interface ObjectTransformPayload {
    objectIds: string[];
    transform: Transform2D;
}

// History Commands
export interface ClearHistoryPayload {
    scope?: 'all' | 'room' | 'door';
}

// Command Results
export interface CommandResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface CommandOptions {
    skipHistory?: boolean;
    skipValidation?: boolean;
    metadata?: Record<string, any>;
}

// Command Types
export type CommandType =
    // Room commands
    | 'ADD_ROOM'
    | 'UPDATE_ROOM'
    | 'DELETE_ROOM'
    // Door commands
    | 'ADD_DOOR'
    | 'UPDATE_DOOR'
    | 'DELETE_DOOR'
    // Transform commands
    | 'TRANSFORM_OBJECTS'
    | 'MOVE_OBJECTS'
    | 'ROTATE_OBJECTS'
    | 'SCALE_OBJECTS'
    // Group commands
    | 'GROUP_OBJECTS'
    | 'UNGROUP_OBJECTS'
    | 'UPDATE_GROUP'
    // Undo/Redo commands
    | 'UNDO'
    | 'REDO'
    | 'CLEAR_HISTORY';

// Command Payload Types
export type RoomCommandPayload = AddRoomPayload | UpdateRoomPayload | DeleteRoomPayload;
export type DoorCommandPayload = AddDoorPayload | UpdateDoorPayload | DeleteDoorPayload;
export type GroupCommandPayload = AddGroupPayload | UpdateGroupPayload | DeleteGroupPayload;
export type TransformCommandPayload = ObjectTransformPayload;
export type HistoryCommandPayload = ClearHistoryPayload;

// Type Guards
export function isAddRoomPayload(payload: CommandPayload): payload is AddRoomPayload {
    return 'geometry' in payload && 'metadata' in payload;
}

export function isUpdateRoomPayload(payload: CommandPayload): payload is UpdateRoomPayload {
    return 'id' in payload && 'room' in payload;
}

export function isDeleteRoomPayload(payload: CommandPayload): payload is DeleteRoomPayload {
    return 'id' in payload && Object.keys(payload).length === 1;
}

export function isAddDoorPayload(payload: CommandPayload): payload is AddDoorPayload {
    return 'geometry' in payload && 'metadata' in payload && 'roomId' in payload;
}

export function isUpdateDoorPayload(payload: CommandPayload): payload is UpdateDoorPayload {
    return 'id' in payload && 'door' in payload;
}

export function isDeleteDoorPayload(payload: CommandPayload): payload is DeleteDoorPayload {
    return 'id' in payload && Object.keys(payload).length === 1;
}

export function isAddGroupPayload(payload: CommandPayload): payload is AddGroupPayload {
    return 'objectIds' in payload && !('id' in payload);
}

export function isUpdateGroupPayload(payload: CommandPayload): payload is UpdateGroupPayload {
    return 'id' in payload && 'objectIds' in payload;
}

export function isDeleteGroupPayload(payload: CommandPayload): payload is DeleteGroupPayload {
    return 'id' in payload && Object.keys(payload).length === 1;
}

export function isTransformPayload(payload: CommandPayload): payload is ObjectTransformPayload {
    return 'objectIds' in payload && 'transform' in payload;
}

export function isClearHistoryPayload(payload: CommandPayload): payload is ClearHistoryPayload {
    return 'scope' in payload || Object.keys(payload).length === 0;
}

export function isRoomCommandPayload(payload: CommandPayload): payload is RoomCommandPayload {
    return isAddRoomPayload(payload) || isUpdateRoomPayload(payload) || isDeleteRoomPayload(payload);
}

export function isDoorCommandPayload(payload: CommandPayload): payload is DoorCommandPayload {
    return isAddDoorPayload(payload) || isUpdateDoorPayload(payload) || isDeleteDoorPayload(payload);
}

export function isGroupCommandPayload(payload: CommandPayload): payload is GroupCommandPayload {
    return isAddGroupPayload(payload) || isUpdateGroupPayload(payload) || isDeleteGroupPayload(payload);
}

export type CommandPayload =
    | RoomCommandPayload
    | DoorCommandPayload
    | GroupCommandPayload
    | TransformCommandPayload
    | HistoryCommandPayload;

// Command Factory Interface
export interface CommandFactory {
    createCommand(type: CommandType, payload: CommandPayload, options?: CommandOptions): Command;
}

// Command Executor Interface
export interface CommandExecutor {
    execute(command: Command): Promise<CommandResult>;
    undo(): Promise<CommandResult>;
    redo(): Promise<CommandResult>;
    clearHistory(): void;
    getHistory(): CommandHistory;
}

// Command Validation
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface CommandValidator {
    validate(command: Command, context: CommandContext): Promise<ValidationResult>;
}

// Command Error Types
export enum CommandErrorType {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    EXECUTION_ERROR = 'EXECUTION_ERROR',
    UNDO_ERROR = 'UNDO_ERROR',
    REDO_ERROR = 'REDO_ERROR',
    INVALID_STATE = 'INVALID_STATE',
    INVALID_PAYLOAD = 'INVALID_PAYLOAD',
    NOT_FOUND = 'NOT_FOUND',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export class CommandError extends Error {
    constructor(
        public type: CommandErrorType,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'CommandError';
    }
}

// Command Event Types
export type CommandEventType =
    | 'beforeExecute'
    | 'afterExecute'
    | 'beforeUndo'
    | 'afterUndo'
    | 'beforeRedo'
    | 'afterRedo'
    | 'historyChanged'
    | 'error';

export interface CommandEvent {
    type: CommandEventType;
    command?: Command;
    result?: CommandResult;
    error?: CommandError;
}

export interface CommandEventListener {
    (event: CommandEvent): void;
}

export interface CommandEventEmitter {
    on(event: CommandEventType, listener: CommandEventListener): void;
    off(event: CommandEventType, listener: CommandEventListener): void;
    emit(event: CommandEvent): void;
}
