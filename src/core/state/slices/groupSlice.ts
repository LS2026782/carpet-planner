import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Group } from '../../services/GroupService';
import { ObjectMetadata } from '../../commands/types';

export interface GroupState {
    groups: { [id: string]: Group };
    selectedGroupId: string | null;
    hoveredGroupId: string | null;
}

const initialState: GroupState = {
    groups: {},
    selectedGroupId: null,
    hoveredGroupId: null,
};

export const groupSlice = createSlice({
    name: 'group',
    initialState,
    reducers: {
        addGroup: (state, action: PayloadAction<{
            id: string;
            objectIds: string[];
            metadata: ObjectMetadata;
        }>) => {
            const { id, objectIds, metadata } = action.payload;
            state.groups[id] = {
                id,
                objectIds,
                metadata,
            };
        },
        updateGroup: (state, action: PayloadAction<{
            id: string;
            objectIds?: string[];
            metadata?: Partial<ObjectMetadata>;
        }>) => {
            const { id, objectIds, metadata } = action.payload;
            const group = state.groups[id];
            if (group) {
                if (objectIds !== undefined) {
                    group.objectIds = objectIds;
                }
                if (metadata) {
                    group.metadata = {
                        ...group.metadata,
                        ...metadata,
                    };
                }
            }
        },
        deleteGroup: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            delete state.groups[id];
            if (state.selectedGroupId === id) {
                state.selectedGroupId = null;
            }
            if (state.hoveredGroupId === id) {
                state.hoveredGroupId = null;
            }
        },
        selectGroup: (state, action: PayloadAction<string | null>) => {
            state.selectedGroupId = action.payload;
        },
        hoverGroup: (state, action: PayloadAction<string | null>) => {
            state.hoveredGroupId = action.payload;
        },
        setGroups: (state, action: PayloadAction<{ [id: string]: Group }>) => {
            state.groups = action.payload;
        },
        clearGroups: (state) => {
            state.groups = {};
            state.selectedGroupId = null;
            state.hoveredGroupId = null;
        },
    },
});

export const {
    addGroup,
    updateGroup,
    deleteGroup,
    selectGroup,
    hoverGroup,
    setGroups,
    clearGroups,
} = groupSlice.actions;

export default groupSlice.reducer;
