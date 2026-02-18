import { type NodeConfig, type EvaluationNodeData } from '../../types/nodeTypes'

const classificationMetrics = [
    { value: 'Accuracy', label: 'Accuracy' },
    { value: 'Precision', label: 'Precision' },
    { value: 'Recall', label: 'Recall' },
    { value: 'F1', label: 'F1 Score' },
    { value: 'ROC-AUC', label: 'ROC-AUC' },
    { value: 'LogLoss', label: 'Log Loss' },
    { value: 'MCC', label: 'Matthews Correlation Coefficient' },
]

const regressionMetrics = [
    { value: 'MAE', label: 'Mean Absolute Error (MAE)' },
    { value: 'MSE', label: 'Mean Squared Error (MSE)' },
    { value: 'RMSE', label: 'Root MSE (RMSE)' },
    { value: 'R2', label: 'R² Score' },
    { value: 'MAPE', label: 'Mean Absolute Percentage Error (MAPE)' },
]

const clusteringMetrics = [
    { value: 'Silhouette', label: 'Silhouette Score' },
    { value: 'DaviesBouldin', label: 'Davies-Bouldin Index' },
    { value: 'CalinskiHarabasz', label: 'Calinski-Harabasz Index' },
]

export const evaluationConfig: NodeConfig = {
    type: 'evaluationNode',
    label: 'Evaluation',
    category: 'model',
    description: 'Measure model performance using metrics and visualizations.',
    defaultData: {
        label: 'Evaluation',
        category: 'model',
        evaluationType: 'Classification',
        metrics: ['Accuracy', 'F1', 'ROC-AUC'],
        crossValidation: false,
        cvFolds: 5,
        generateConfusionMatrix: true,
        generateROCCurve: false,
        generateResidualPlot: false,
    },
    properties: [
        {
            key: 'evaluationType',
            label: 'Evaluation Type',
            type: 'select',
            options: [
                { value: 'Classification', label: 'Classification' },
                { value: 'Regression', label: 'Regression' },
                { value: 'Clustering', label: 'Clustering' },
            ],
            defaultValue: 'Classification',
            required: true,
            description: 'Match this to your model\'s task type.',
        },
        {
            key: 'metrics',
            label: 'Metrics',
            type: 'multiselect',
            options: classificationMetrics,
            defaultValue: ['Accuracy', 'F1', 'ROC-AUC'],
            description: 'Select the metrics to compute.',
            dependsOn: { key: 'evaluationType', value: 'Classification' },
        },
        {
            key: 'metrics',
            label: 'Metrics',
            type: 'multiselect',
            options: regressionMetrics,
            defaultValue: ['MAE', 'RMSE', 'R2'],
            description: 'Select the metrics to compute.',
            dependsOn: { key: 'evaluationType', value: 'Regression' },
        },
        {
            key: 'metrics',
            label: 'Metrics',
            type: 'multiselect',
            options: clusteringMetrics,
            defaultValue: ['Silhouette'],
            description: 'Select the metrics to compute.',
            dependsOn: { key: 'evaluationType', value: 'Clustering' },
        },
        {
            key: 'crossValidation',
            label: 'Cross-Validation Evaluation',
            type: 'boolean',
            defaultValue: false,
            description: 'Evaluate using k-fold cross-validation instead of a single test set.',
        },
        {
            key: 'cvFolds',
            label: 'CV Folds (k)',
            type: 'slider',
            defaultValue: 5,
            min: 3,
            max: 10,
            step: 1,
            dependsOn: { key: 'crossValidation', value: true },
        },
        {
            key: 'generateConfusionMatrix',
            label: 'Confusion Matrix',
            type: 'boolean',
            defaultValue: true,
            description: 'Generate and plot a confusion matrix.',
            dependsOn: { key: 'evaluationType', value: 'Classification' },
        },
        {
            key: 'generateROCCurve',
            label: 'ROC Curve',
            type: 'boolean',
            defaultValue: false,
            description: 'Plot the Receiver Operating Characteristic curve.',
            dependsOn: { key: 'evaluationType', value: 'Classification' },
        },
        {
            key: 'generateResidualPlot',
            label: 'Residual Plot',
            type: 'boolean',
            defaultValue: false,
            description: 'Plot predicted vs actual residuals.',
            dependsOn: { key: 'evaluationType', value: 'Regression' },
        },
    ],
    codeTemplate: (data: EvaluationNodeData) => {
        const metrics: string[] = Array.isArray(data.metrics) ? data.metrics : ['Accuracy']

        if (data.evaluationType === 'Regression') {
            let code = `from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score\nimport numpy as np\n\n# Make predictions\ny_pred = model.predict(X_test)\n\n# Regression metrics\n`
            if (metrics.includes('MAE')) code += `print(f"MAE: {mean_absolute_error(y_test, y_pred):.4f}")\n`
            if (metrics.includes('MSE')) code += `print(f"MSE: {mean_squared_error(y_test, y_pred):.4f}")\n`
            if (metrics.includes('RMSE')) code += `print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.4f}")\n`
            if (metrics.includes('R2')) code += `print(f"R²: {r2_score(y_test, y_pred):.4f}")\n`
            if (metrics.includes('MAPE')) code += `print(f"MAPE: {np.mean(np.abs((y_test - y_pred) / y_test)) * 100:.2f}%")\n`
            if (data.generateResidualPlot) {
                code += `\nimport matplotlib.pyplot as plt\n\n# Residual plot\nresiduals = y_test - y_pred\nplt.figure(figsize=(10, 5))\nplt.scatter(y_pred, residuals, alpha=0.5)\nplt.axhline(y=0, color='r', linestyle='--')\nplt.xlabel("Predicted")\nplt.ylabel("Residuals")\nplt.title("Residual Plot")\nplt.show()`
            }
            return code
        }

        if (data.evaluationType === 'Clustering') {
            let code = `from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score\n\n# Clustering evaluation\n`
            if (metrics.includes('Silhouette')) code += `print(f"Silhouette Score: {silhouette_score(X, labels):.4f}")\n`
            if (metrics.includes('DaviesBouldin')) code += `print(f"Davies-Bouldin Index: {davies_bouldin_score(X, labels):.4f}")\n`
            if (metrics.includes('CalinskiHarabasz')) code += `print(f"Calinski-Harabasz Index: {calinski_harabasz_score(X, labels):.4f}")\n`
            return code
        }

        // Classification (default)
        let code = `from sklearn.metrics import `
        const imports: string[] = []
        if (metrics.includes('Accuracy')) imports.push('accuracy_score')
        if (metrics.includes('Precision')) imports.push('precision_score')
        if (metrics.includes('Recall')) imports.push('recall_score')
        if (metrics.includes('F1')) imports.push('f1_score')
        if (metrics.includes('ROC-AUC')) imports.push('roc_auc_score')
        if (metrics.includes('LogLoss')) imports.push('log_loss')
        if (metrics.includes('MCC')) imports.push('matthews_corrcoef')
        if (data.generateConfusionMatrix) imports.push('confusion_matrix', 'ConfusionMatrixDisplay')
        if (data.generateROCCurve) imports.push('RocCurveDisplay')
        code += imports.join(', ') + '\n\n'
        code += `# Make predictions\ny_pred = model.predict(X_test)\n\n# Metrics\n`
        if (metrics.includes('Accuracy')) code += `print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")\n`
        if (metrics.includes('Precision')) code += `print(f"Precision: {precision_score(y_test, y_pred, average='weighted'):.4f}")\n`
        if (metrics.includes('Recall')) code += `print(f"Recall: {recall_score(y_test, y_pred, average='weighted'):.4f}")\n`
        if (metrics.includes('F1')) code += `print(f"F1 Score: {f1_score(y_test, y_pred, average='weighted'):.4f}")\n`
        if (metrics.includes('ROC-AUC')) code += `y_prob = model.predict_proba(X_test)[:, 1]\nprint(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")\n`
        if (metrics.includes('LogLoss')) code += `y_prob = model.predict_proba(X_test)\nprint(f"Log Loss: {log_loss(y_test, y_prob):.4f}")\n`
        if (metrics.includes('MCC')) code += `print(f"MCC: {matthews_corrcoef(y_test, y_pred):.4f}")\n`

        if (data.crossValidation) {
            code += `\n# Cross-validation\nfrom sklearn.model_selection import cross_val_score\ncv_scores = cross_val_score(model, X_train, y_train, cv=${data.cvFolds || 5})\nprint(f"\\nCV Scores: {cv_scores}")\nprint(f"Mean CV: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")\n`
        }

        if (data.generateConfusionMatrix) {
            code += `\nimport matplotlib.pyplot as plt\n\n# Confusion matrix\ncm = confusion_matrix(y_test, y_pred)\ndisp = ConfusionMatrixDisplay(confusion_matrix=cm)\ndisp.plot(cmap='Blues')\nplt.title("Confusion Matrix")\nplt.show()\n`
        }

        if (data.generateROCCurve) {
            code += `\n# ROC Curve\nRocCurveDisplay.from_estimator(model, X_test, y_test)\nplt.title("ROC Curve")\nplt.show()\n`
        }

        return code
    },
    validationRules: [
        {
            type: 'error',
            condition: (_data, pipeline) => {
                const hasTraining = pipeline.nodes.some((n: any) => n.type === 'trainingNode')
                return !hasTraining
            },
            message: 'Evaluation node requires a Training node before it',
        },
    ],
}
