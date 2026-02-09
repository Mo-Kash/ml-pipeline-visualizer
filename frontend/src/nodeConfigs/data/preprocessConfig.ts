import { type NodeConfig, type PreprocessNodeData } from '../../types/nodeTypes'

export const preprocessConfig: NodeConfig = {
    type: 'preprocessNode',
    label: 'Preprocessing',
    category: 'data',
    description: 'Clean and normalize data',
    defaultData: {
        label: 'Preprocessing',
        category: 'data',
        scaling: 'Standard',
        encoding: 'OneHot',
        missingValues: 'Mean',
    },
    properties: [
        {
            key: 'scaling',
            label: 'Scaling Method',
            type: 'select',
            options: [
                { value: 'None', label: 'None' },
                { value: 'Standard', label: 'Standard Scaler' },
                { value: 'MinMax', label: 'Min-Max Scaler' },
            ],
            defaultValue: 'Standard',
        },
        {
            key: 'encoding',
            label: 'Encoding Method',
            type: 'select',
            options: [
                { value: 'None', label: 'None' },
                { value: 'Label', label: 'Label Encoding' },
                { value: 'OneHot', label: 'One-Hot Encoding' },
            ],
            defaultValue: 'OneHot',
        },
        {
            key: 'missingValues',
            label: 'Missing Values',
            type: 'select',
            options: [
                { value: 'Drop', label: 'Drop Rows' },
                { value: 'Mean', label: 'Fill with Mean' },
                { value: 'Median', label: 'Fill with Median' },
                { value: 'Mode', label: 'Fill with Mode' },
            ],
            defaultValue: 'Mean',
        },
    ],
    codeTemplate: (data: PreprocessNodeData) => {
        let code = `from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder\nimport pandas as pd\nimport numpy as np\n\n`

        // Missing values
        if (data.missingValues === 'Drop') {
            code += `# Handle missing values\ndf = df.dropna()\n\n`
        } else {
            code += `# Handle missing values\ndf = df.fillna(df.${data.missingValues.toLowerCase()}())\n\n`
        }

        // Scaling
        if (data.scaling !== 'None') {
            const scalerType = data.scaling === 'Standard' ? 'StandardScaler' : 'MinMaxScaler'
            code += `# Scale numerical features\nscaler = ${scalerType}()\nnumerical_cols = df.select_dtypes(include=[np.number]).columns\ndf[numerical_cols] = scaler.fit_transform(df[numerical_cols])\n\n`
        }

        // Encoding
        if (data.encoding === 'OneHot') {
            code += `# Encode categorical features\ndf = pd.get_dummies(df, drop_first=True)\n`
        } else if (data.encoding === 'Label') {
            code += `# Encode categorical features\nle = LabelEncoder()\ncategorical_cols = df.select_dtypes(include=['object']).columns\nfor col in categorical_cols:\n    df[col] = le.fit_transform(df[col])\n`
        }

        return code
    },
    validationRules: [
        {
            type: 'warning',
            condition: (data, pipeline) => {
                // Check if tree-based model is used with scaling
                const hasTreeModel = pipeline.nodes.some((n: any) =>
                    n.type === 'modelSelectionNode' &&
                    (n.data.modelType === 'Tree' || n.data.modelType === 'Ensemble')
                )
                return hasTreeModel && data.scaling !== 'None'
            },
            message: 'Tree-based models typically don\'t require feature scaling',
        },
    ],
}
