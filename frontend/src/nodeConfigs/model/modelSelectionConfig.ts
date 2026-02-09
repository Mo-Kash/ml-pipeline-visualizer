import { type NodeConfig, type ModelSelectionNodeData } from '../../types/nodeTypes'

export const modelSelectionConfig: NodeConfig = {
    type: 'modelSelectionNode',
    label: 'Model Selection',
    category: 'model',
    description: 'Choose ML algorithm',
    defaultData: {
        label: 'Model Selection',
        category: 'model',
        modelName: 'Random Forest',
        modelType: 'Ensemble',
        taskType: 'Classification',
    },
    properties: [
        {
            key: 'taskType',
            label: 'Task Type',
            type: 'select',
            options: [
                { value: 'Classification', label: 'Classification' },
                { value: 'Regression', label: 'Regression' },
            ],
            defaultValue: 'Classification',
            required: true,
        },
        {
            key: 'modelName',
            label: 'Model',
            type: 'select',
            options: [
                { value: 'Linear Regression', label: 'Linear Regression' },
                { value: 'Logistic Regression', label: 'Logistic Regression' },
                { value: 'Decision Tree', label: 'Decision Tree' },
                { value: 'Random Forest', label: 'Random Forest' },
                { value: 'SVM', label: 'Support Vector Machine' },
                { value: 'KNN', label: 'K-Nearest Neighbors' },
            ],
            defaultValue: 'Random Forest',
            required: true,
        },
        {
            key: 'modelType',
            label: 'Model Type',
            type: 'select',
            options: [
                { value: 'Linear', label: 'Linear' },
                { value: 'Tree', label: 'Tree-based' },
                { value: 'Ensemble', label: 'Ensemble' },
                { value: 'Neural', label: 'Neural Network' },
            ],
            defaultValue: 'Ensemble',
        },
    ],
    codeTemplate: (data: ModelSelectionNodeData) => {
        const modelImports: Record<string, string> = {
            'Linear Regression': 'from sklearn.linear_model import LinearRegression\n\nmodel = LinearRegression()',
            'Logistic Regression': 'from sklearn.linear_model import LogisticRegression\n\nmodel = LogisticRegression(random_state=42)',
            'Decision Tree': `from sklearn.tree import DecisionTreeClassifier\n\nmodel = DecisionTreeClassifier(random_state=42)`,
            'Random Forest': `from sklearn.ensemble import RandomForestClassifier\n\nmodel = RandomForestClassifier(n_estimators=100, random_state=42)`,
            'SVM': `from sklearn.svm import SVC\n\nmodel = SVC(kernel='rbf', random_state=42)`,
            'KNN': `from sklearn.neighbors import KNeighborsClassifier\n\nmodel = KNeighborsClassifier(n_neighbors=5)`,
        }

        return modelImports[data.modelName] || modelImports['Random Forest']
    },
    validationRules: [
        {
            type: 'warning',
            condition: (data, pipeline) => {
                return data.modelName === 'Logistic Regression' && data.taskType === 'Regression'
            },
            message: 'Logistic Regression is for classification, not regression tasks',
        },
        {
            type: 'warning',
            condition: (data, pipeline) => {
                return data.modelName === 'Linear Regression' && data.taskType === 'Classification'
            },
            message: 'Linear Regression is for regression, not classification tasks',
        },
    ],
}
