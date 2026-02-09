import { type NodeConfig, type DataSplitNodeData } from '../../types/nodeTypes'

export const dataSplitConfig: NodeConfig = {
    type: 'dataSplitNode',
    label: 'Data Split',
    category: 'data',
    description: 'Split data into train/test/validation sets',
    defaultData: {
        label: 'Data Split',
        category: 'data',
        trainSize: 0.7,
        testSize: 0.3,
        randomState: 42,
        stratify: false,
    },
    properties: [
        {
            key: 'trainSize',
            label: 'Train Size',
            type: 'number',
            defaultValue: 0.7,
            required: true,
        },
        {
            key: 'testSize',
            label: 'Test Size',
            type: 'number',
            defaultValue: 0.3,
            required: true,
        },
        {
            key: 'randomState',
            label: 'Random State',
            type: 'number',
            defaultValue: 42,
        },
        {
            key: 'stratify',
            label: 'Stratify',
            type: 'boolean',
            defaultValue: false,
        },
    ],
    codeTemplate: (data: DataSplitNodeData) => {
        return `from sklearn.model_selection import train_test_split\n\n# Split data into train and test sets\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y,\n    train_size=${data.trainSize},\n    test_size=${data.testSize},\n    random_state=${data.randomState}${data.stratify ? ',\n    stratify=y' : ''}\n)\n\nprint(f"Train set: {len(X_train)} samples")\nprint(f"Test set: {len(X_test)} samples")`
    },
    validationRules: [
        {
            type: 'error',
            condition: (data, pipeline) => {
                const splitNodes = pipeline.nodes.filter((n: any) => n.type === 'dataSplitNode')
                return splitNodes.length > 1
            },
            message: 'Only one Data Split node is allowed per pipeline',
        },
        {
            type: 'warning',
            condition: (data) => {
                return (data.trainSize + data.testSize) !== 1.0
            },
            message: 'Train and test sizes should sum to 1.0',
        },
    ],
}
