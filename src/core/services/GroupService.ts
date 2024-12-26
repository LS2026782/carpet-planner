import { BaseService } from './BaseService';
import { GeometryObject } from '../types/geometry';
import { Room } from '../state/types/room';
import { Door } from '../state/types/door';
import { ObjectMetadata } from '../commands/types';

export interface Group {
    id: string;
    name?: string;
    objectIds: string[];
    metadata: ObjectMetadata;
}

export class GroupService extends BaseService {
    async createGroup(objectIds: string[], name?: string): Promise<string> {
        try {
            const payload = {
                objectIds,
                metadata: {
                    id: '', // Will be set by command
                    name,
                    type: 'group' as const
                }
            };

            const result = await this.executeCommand('GROUP_OBJECTS', payload);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            return result.data.id;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async ungroup(groupId: string): Promise<void> {
        try {
            this.validateId(groupId, 'group');
            const group = this.getGroup(groupId);
            this.validateExists(group, 'Group', groupId);

            const result = await this.executeCommand('UNGROUP_OBJECTS', {
                objectIds: [groupId]
            });

            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async addToGroup(groupId: string, objectIds: string[]): Promise<void> {
        try {
            this.validateId(groupId, 'group');
            const group = this.getGroup(groupId);
            this.validateExists(group, 'Group', groupId);

            // Validate all objects exist
            for (const id of objectIds) {
                const object = this.getObject(id);
                this.validateExists(object, 'Object', id);
            }

            const result = await this.executeCommand('UPDATE_GROUP', {
                id: groupId,
                objectIds: [...group.objectIds, ...objectIds]
            });

            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async removeFromGroup(groupId: string, objectIds: string[]): Promise<void> {
        try {
            this.validateId(groupId, 'group');
            const group = this.getGroup(groupId);
            this.validateExists(group, 'Group', groupId);

            const result = await this.executeCommand('UPDATE_GROUP', {
                id: groupId,
                objectIds: group.objectIds.filter(id => !objectIds.includes(id))
            });

            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    getGroup(id: string): Group {
        this.validateId(id, 'group');
        const group = this.state.groups?.groups[id];
        this.validateExists(group, 'Group', id);
        return group;
    }

    getAllGroups(): Group[] {
        return Object.values(this.state.groups?.groups || {});
    }

    getGroupsByObject(objectId: string): Group[] {
        return this.getAllGroups().filter(group => 
            group.objectIds.includes(objectId)
        );
    }

    getObjectsInGroup(groupId: string): (Room | Door)[] {
        const group = this.getGroup(groupId);
        return group.objectIds
            .map(id => this.getObject(id))
            .filter((obj): obj is Room | Door => obj !== undefined);
    }

    private getObject(id: string): Room | Door | undefined {
        return this.state.rooms.rooms[id] || this.state.doors.doors[id];
    }

    private validateGroupObjects(objectIds: string[]): void {
        if (objectIds.length < 2) {
            throw new Error('A group must contain at least 2 objects');
        }

        // Check if objects exist
        for (const id of objectIds) {
            const object = this.getObject(id);
            if (!object) {
                throw new Error(`Object with id ${id} not found`);
            }
        }

        // Check if objects are already in a group
        for (const id of objectIds) {
            const groups = this.getGroupsByObject(id);
            if (groups.length > 0) {
                throw new Error(`Object ${id} is already in group ${groups[0].id}`);
            }
        }

        // Check if objects are connected
        const objects = objectIds.map(id => {
            const obj = this.getObject(id);
            if (!obj) throw new Error(`Object ${id} not found`);
            return {
                id,
                geometry: obj.geometry
            };
        });

        if (!this.areObjectsConnected(objects)) {
            throw new Error('All objects in a group must be connected');
        }
    }

    private areObjectsConnected(
        objects: Array<{ id: string; geometry: GeometryObject }>
    ): boolean {
        if (objects.length < 2) return true;

        const visited = new Set<string>();
        const stack = [objects[0].id];

        while (stack.length > 0) {
            const currentId = stack.pop()!;
            visited.add(currentId);

            const current = objects.find(obj => obj.id === currentId)!;

            for (const obj of objects) {
                if (!visited.has(obj.id) && this.geometriesOverlap(current.geometry, obj.geometry)) {
                    stack.push(obj.id);
                }
            }
        }

        return visited.size === objects.length;
    }

    private geometriesOverlap(geom1: GeometryObject, geom2: GeometryObject): boolean {
        // Get bounding boxes
        const bbox1 = this.getBoundingBox(geom1);
        const bbox2 = this.getBoundingBox(geom2);

        // Check for overlap
        return !(
            bbox1.max.x < bbox2.min.x ||
            bbox1.min.x > bbox2.max.x ||
            bbox1.max.y < bbox2.min.y ||
            bbox1.min.y > bbox2.max.y
        );
    }

    private getBoundingBox(geometry: GeometryObject) {
        const points = this.getGeometryPoints(geometry);
        const min = { x: Infinity, y: Infinity };
        const max = { x: -Infinity, y: -Infinity };

        for (const point of points) {
            min.x = Math.min(min.x, point.x);
            min.y = Math.min(min.y, point.y);
            max.x = Math.max(max.x, point.x);
            max.y = Math.max(max.y, point.y);
        }

        return { min, max };
    }

    private getGeometryPoints(geometry: GeometryObject): Array<{ x: number; y: number }> {
        switch (geometry.type) {
            case 'point':
                return [geometry.data as { x: number; y: number }];
            case 'line':
                const line = geometry.data as { start: { x: number; y: number }; end: { x: number; y: number } };
                return [line.start, line.end];
            case 'rect':
                const rect = geometry.data as { x: number; y: number; width: number; height: number };
                return [
                    { x: rect.x, y: rect.y },
                    { x: rect.x + rect.width, y: rect.y },
                    { x: rect.x + rect.width, y: rect.y + rect.height },
                    { x: rect.x, y: rect.y + rect.height }
                ];
            case 'polygon':
                return (geometry.data as { points: Array<{ x: number; y: number }> }).points;
            default:
                throw new Error(`Unsupported geometry type: ${geometry.type}`);
        }
    }
}

export const groupService = new GroupService();
