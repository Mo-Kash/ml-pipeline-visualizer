import { create } from 'zustand'
import { type Node, type Edge, type Connection, addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react'

interface PipelineState {
    nodes: Node[]
    edges: Edge[]
    selectedNodeId: string | null

    // Actions
    setNodes: (nodes: Node[]) => void
    setEdges: (edges: Edge[]) => void
    onNodesChange: (changes: any) => void
    onEdgesChange: (changes: any) => void
    onConnect: (connection: Connection) => void
    addNode: (node: Node) => void
    updateNode: (nodeId: string, data: any) => void
    deleteNode: (nodeId: string) => void
    selectNode: (nodeId: string | null) => void
    clearPipeline: () => void
    loadPipeline: (nodes: Node[], edges: Edge[]) => void
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,

    setNodes: (nodes) => set({ nodes }),

    setEdges: (edges) => set({ edges }),

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        })
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        })
    },

    onConnect: (connection) => {
        set({
            edges: addEdge(connection, get().edges),
        })
    },

    addNode: (node) => {
        set({
            nodes: [...get().nodes, node],
        })
    },

    updateNode: (nodeId, data) => {
        set({
            nodes: get().nodes.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
            ),
        })
    },

    deleteNode: (nodeId) => {
        set({
            nodes: get().nodes.filter((node) => node.id !== nodeId),
            edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
            selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
        })
    },

    selectNode: (nodeId) => {
        set({ selectedNodeId: nodeId })
    },

    clearPipeline: () => {
        set({
            nodes: [],
            edges: [],
            selectedNodeId: null,
        })
    },

    loadPipeline: (nodes, edges) => {
        set({
            nodes,
            edges,
            selectedNodeId: null,
        })
    },
}))
