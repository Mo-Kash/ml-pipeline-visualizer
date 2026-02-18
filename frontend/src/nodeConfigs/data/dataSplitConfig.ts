import { type NodeConfig, type DataSplitNodeData } from '../../types/nodeTypes'

export const dataSplitConfig: NodeConfig = {
    type: 'dataSplitNode',
    label: 'Data Split',
    category: 'data',
    description: 'Split your dataset into training, validation, and test sets.',
    defaultData: {
        label: 'Data Split',
        category: 'data',
        splitStrategy: 'Random',
        trainSize: 0.7,
        validationSize: 0,
        testSize: 0.3,
        randomState: 42,
        shuffle: true,
        stratify: false,
    },
    properties: [
        {
            key: 'splitStrategy',
            label: 'Split Strategy',
            type: 'select',
            options: [
                { value: 'Random', label: 'Random Split' },
                { value: 'Stratified', label: 'Stratified Split (preserves class ratio)' },
                { value: 'TimeSeries', label: 'Time Series Split (no shuffle)' },
                { value: 'GroupKFold', label: 'Group K-Fold' },
            ],
            defaultValue: 'Random',
            description: 'How to partition the data.',
        },
        {
            key: 'trainSize',
            label: 'Train Size',
            type: 'slider',
            defaultValue: 0.7,
            min: 0.5,
            max: 0.9,
            step: 0.05,
            description: 'Fraction of data used for training.',
        },
        {
            key: 'validationSize',
            label: 'Validation Size',
            type: 'slider',
            defaultValue: 0,
            min: 0,
            max: 0.3,
            step: 0.05,
            description: 'Fraction for validation (0 = no validation set).',
        },
        {
            key: 'randomState',
            label: 'Random Seed',
            type: 'number',
            defaultValue: 42,
            min: 0,
            placeholder: '42',
            description: 'Seed for reproducibility.',
        },
        {
            key: 'shuffle',
            label: 'Shuffle Data',
            type: 'boolean',
            defaultValue: true,
            description: 'Randomly shuffle before splitting.',
            dependsOn: { key: 'splitStrategy', value: ['Random', 'Stratified', 'GroupKFold'] },
        },
        {
            key: 'stratify',
            label: 'Stratify by Target',
            type: 'boolean',
            defaultValue: false,
            description: 'Preserve class distribution in each split.',
            dependsOn: { key: 'splitStrategy', value: 'Stratified' },
        },
    ],
    codeTemplate: (data: DataSplitNodeData) => {
        const testSize = Math.max(0.05, parseFloat((1 - data.trainSize - (data.validationSize || 0)).toFixed(2)))
        if (data.splitStrategy === 'TimeSeries') {
            return `from sklearn.model_selection import TimeSeriesSplit\n\n# Time series split (respects temporal order)\ntscv = TimeSeriesSplit(n_splits=5)\nfor fold, (train_idx, test_idx) in enumerate(tscv.split(X)):\n    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]\n    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]\n    print(f"Fold {fold+1}: train={len(train_idx)}, test={len(test_idx)}")`
        }
        if (data.validationSize && data.validationSize > 0) {
            return `from sklearn.model_selection import train_test_split\n\n# First split: train+val vs test\nX_trainval, X_test, y_trainval, y_test = train_test_split(\n    X, y,\n    test_size=${testSize},\n    random_state=${data.randomState}${data.stratify ? ',\n    stratify=y' : ''}\n)\n\n# Second split: train vs val\nval_ratio = ${data.validationSize} / (${data.trainSize} + ${data.validationSize})\nX_train, X_val, y_train, y_val = train_test_split(\n    X_trainval, y_trainval,\n    test_size=val_ratio,\n    random_state=${data.randomState}\n)\n\nprint(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")`
        }
        return `from sklearn.model_selection import train_test_split\n\n# Split data into train and test sets\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y,\n    train_size=${data.trainSize},\n    test_size=${testSize},\n    random_state=${data.randomState},\n    shuffle=${data.shuffle ? 'True' : 'False'}${data.stratify ? ',\n    stratify=y' : ''}\n)\n\nprint(f"Train: {len(X_train)} samples, Test: {len(X_test)} samples")`
    },
    validationRules: [
        {
            type: 'error',
            condition: (_data, pipeline) => {
                const splitNodes = pipeline.nodes.filter((n: any) => n.type === 'dataSplitNode')
                return splitNodes.length > 1
            },
            message: 'Only one Data Split node is allowed per pipeline',
        },
        {
            type: 'warning',
            condition: (data) => {
                const total = data.trainSize + (data.validationSize || 0)
                return total > 0.95
            },
            message: 'Very little data left for the test set — consider reducing train/val sizes',
        },
    ],
}
