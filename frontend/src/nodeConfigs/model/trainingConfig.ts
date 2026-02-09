import { type NodeConfig, type TrainingNodeData } from '../../types/nodeTypes'

export const trainingConfig: NodeConfig = {
    type: 'trainingNode',
    label: 'Training',
    category: 'model',
    description: 'Train the model',
    defaultData: {
        label: 'Training',
        category: 'model',
        learningType: 'Supervised',
        hyperparameters: {},
    },
    properties: [
        {
            key: 'learningType',
            label: 'Learning Type',
            type: 'select',
            options: [
                { value: 'Supervised', label: 'Supervised Learning' },
                { value: 'Unsupervised', label: 'Unsupervised Learning' },
                { value: 'SemiSupervised', label: 'Semi-Supervised Learning' },
                { value: 'Reinforcement', label: 'Reinforcement Learning' },
            ],
            defaultValue: 'Supervised',
            required: true,
        },
    ],
    codeTemplate: (data: TrainingNodeData) => {
        return `# Train the model\nmodel.fit(X_train, y_train)\n\nprint("Model training completed")\nprint(f"Training score: {model.score(X_train, y_train):.4f}")`
    },
    validationRules: [
        {
            type: 'error',
            condition: (data, pipeline) => {
                // Training must come after data split
                const hasDataSplit = pipeline.nodes.some((n: any) => n.type === 'dataSplitNode')
                return !hasDataSplit
            },
            message: 'Training node requires a Data Split node before it',
        },
    ],
}
