import { create } from 'zustand'

interface ConfigStoreState {
    selectedNodeId: string | null
    isPanelOpen: boolean

    // Actions
    openPanel: (nodeId: string) => void
    closePanel: () => void
    setSelectedNode: (nodeId: string | null) => void
}

export const useConfigStore = create<ConfigStoreState>((set) => ({
    selectedNodeId: null,
    isPanelOpen: false,

    openPanel: (nodeId) => {
        set({
            selectedNodeId: nodeId,
            isPanelOpen: true,
        })
    },

    closePanel: () => {
        set({
            isPanelOpen: false,
            selectedNodeId: null,
        })
    },

    setSelectedNode: (nodeId) => {
        set({
            selectedNodeId: nodeId,
            isPanelOpen: nodeId !== null,
        })
    },
}))
