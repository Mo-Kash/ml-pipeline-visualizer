import { create } from 'zustand'

export interface NodeDefinition {
    id: string
    type: string
    label: string
    category: 'data' | 'model' | 'deployment'
    description: string
    icon?: string
}

interface NodeStoreState {
    availableNodes: NodeDefinition[]

    // Actions
    getNodesByCategory: (category: string) => NodeDefinition[]
    getNodeDefinition: (type: string) => NodeDefinition | undefined
}

const initialNodes: NodeDefinition[] = [
    // Data nodes
    {
        id: 'ingest',
        type: 'ingestNode',
        label: 'Data Ingest',
        category: 'data',
        description: 'Load data from various sources (CSV, JSON, SQL, API)',
    },
    {
        id: 'preprocess',
        type: 'preprocessNode',
        label: 'Preprocessing',
        category: 'data',
        description: 'Clean and normalize data',
    },
    {
        id: 'exploration',
        type: 'explorationNode',
        label: 'EDA',
        category: 'data',
        description: 'Exploratory data analysis',
    },
    {
        id: 'featureEngineering',
        type: 'featureEngineeringNode',
        label: 'Feature Engineering',
        category: 'data',
        description: 'Transform and create features',
    },
    {
        id: 'dataSplit',
        type: 'dataSplitNode',
        label: 'Data Split',
        category: 'data',
        description: 'Split data into train/test/validation sets',
    },

    // Model nodes
    {
        id: 'modelSelection',
        type: 'modelSelectionNode',
        label: 'Model Selection',
        category: 'model',
        description: 'Choose ML algorithm',
    },
    {
        id: 'training',
        type: 'trainingNode',
        label: 'Training',
        category: 'model',
        description: 'Train the model',
    },
    {
        id: 'evaluation',
        type: 'evaluationNode',
        label: 'Evaluation',
        category: 'model',
        description: 'Evaluate model performance',
    },

    // Deployment nodes
    {
        id: 'deployment',
        type: 'deploymentNode',
        label: 'Deployment',
        category: 'deployment',
        description: 'Deploy model to production',
    },
]

export const useNodeStore = create<NodeStoreState>((set, get) => ({
    availableNodes: initialNodes,

    getNodesByCategory: (category) => {
        return get().availableNodes.filter((node) => node.category === category)
    },

    getNodeDefinition: (type) => {
        return get().availableNodes.find((node) => node.type === type)
    },
}))
