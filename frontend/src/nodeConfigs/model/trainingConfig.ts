import { type NodeConfig, type TrainingNodeData } from '../../types/nodeTypes'

export const trainingConfig: NodeConfig = {
    type: 'trainingNode',
    label: 'Training',
    category: 'model',
    description: 'Fit the model on training data with optional cross-validation.',
    defaultData: {
        label: 'Training',
        category: 'model',
        learningType: 'Supervised',
        crossValidation: false,
        cvFolds: 5,
        classWeights: 'None',
        earlyStoppingPatience: 10,
        verbose: false,
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
            description: 'The learning paradigm for training.',
        },
        {
            key: 'crossValidation',
            label: 'Enable Cross-Validation',
            type: 'boolean',
            defaultValue: false,
            description: 'Evaluate model stability using k-fold cross-validation during training.',
        },
        {
            key: 'cvFolds',
            label: 'CV Folds (k)',
            type: 'slider',
            defaultValue: 5,
            min: 3,
            max: 10,
            step: 1,
            description: 'Number of folds for cross-validation.',
            dependsOn: { key: 'crossValidation', value: true },
        },
        {
            key: 'classWeights',
            label: 'Class Weights',
            type: 'select',
            options: [
                { value: 'None', label: 'None (default)' },
                { value: 'balanced', label: 'Balanced (auto-weight by frequency)' },
            ],
            defaultValue: 'None',
            description: 'Handle class imbalance by weighting minority classes higher.',
            dependsOn: { key: 'learningType', value: 'Supervised' },
        },
        {
            key: 'earlyStoppingPatience',
            label: 'Early Stopping Patience',
            type: 'number',
            defaultValue: 10,
            min: 1,
            placeholder: '10',
            description: 'Stop training if validation loss doesn\'t improve for N epochs (neural networks).',
            dependsOn: { key: 'learningType', value: 'Supervised' },
        },
        {
            key: 'verbose',
            label: 'Verbose Output',
            type: 'boolean',
            defaultValue: false,
            description: 'Print detailed training progress to the console.',
        },
    ],
    codeTemplate: (data: TrainingNodeData) => {
        let code = `# Train the model\n`

        if (data.crossValidation) {
            code += `from sklearn.model_selection import cross_val_score\nimport numpy as np\n\n# Cross-validation training\ncv_scores = cross_val_score(model, X_train, y_train, cv=${data.cvFolds || 5}, scoring='accuracy')\nprint(f"CV Scores: {cv_scores}")\nprint(f"Mean CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")\n\n# Final fit on full training data\n`
        }

        if (data.classWeights === 'balanced') {
            code += `# Note: set class_weight='balanced' in your model constructor for imbalanced datasets\n`
        }

        code += `model.fit(X_train, y_train${data.verbose ? '' : ''})\n\nprint("Training complete")\nprint(f"Training score: {model.score(X_train, y_train):.4f}")`

        return code
    },
    validationRules: [
        {
            type: 'error',
            condition: (_data, pipeline) => {
                const hasDataSplit = pipeline.nodes.some((n: any) => n.type === 'dataSplitNode')
                return !hasDataSplit
            },
            message: 'Training node requires a Data Split node before it',
        },
    ],
}
