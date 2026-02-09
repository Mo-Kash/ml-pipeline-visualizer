import { type NodeConfig, type EvaluationNodeData } from '../../types/nodeTypes'

export const evaluationConfig: NodeConfig = {
    type: 'evaluationNode',
    label: 'Evaluation',
    category: 'model',
    description: 'Evaluate model performance',
    defaultData: {
        label: 'Evaluation',
        category: 'model',
        metrics: ['Accuracy', 'Precision', 'Recall'],
        crossValidation: false,
    },
    properties: [
        {
            key: 'crossValidation',
            label: 'Cross Validation',
            type: 'boolean',
            defaultValue: false,
        },
        {
            key: 'cvFolds',
            label: 'CV Folds',
            type: 'number',
            defaultValue: 5,
        },
    ],
    codeTemplate: (data: EvaluationNodeData) => {
        let code = `from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score\n\n# Make predictions\ny_pred = model.predict(X_test)\n\n# Calculate metrics\naccuracy = accuracy_score(y_test, y_pred)\nprecision = precision_score(y_test, y_pred, average='weighted')\nrecall = recall_score(y_test, y_pred, average='weighted')\nf1 = f1_score(y_test, y_pred, average='weighted')\n\nprint(f"Accuracy: {accuracy:.4f}")\nprint(f"Precision: {precision:.4f}")\nprint(f"Recall: {recall:.4f}")\nprint(f"F1 Score: {f1:.4f}")\n`

        if (data.crossValidation) {
            code += `\n# Cross-validation\nfrom sklearn.model_selection import cross_val_score\ncv_scores = cross_val_score(model, X_train, y_train, cv=${data.cvFolds || 5})\nprint(f"\\nCross-validation scores: {cv_scores}")\nprint(f"Mean CV score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")`
        }

        return code
    },
    validationRules: [
        {
            type: 'error',
            condition: (data, pipeline) => {
                // Evaluation must come after training
                const hasTraining = pipeline.nodes.some((n: any) => n.type === 'trainingNode')
                return !hasTraining
            },
            message: 'Evaluation node requires a Training node before it',
        },
    ],
}
