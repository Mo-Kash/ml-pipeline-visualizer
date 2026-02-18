import { type NodeConfig, type PreprocessNodeData } from '../../types/nodeTypes'

export const preprocessConfig: NodeConfig = {
    type: 'preprocessNode',
    label: 'Preprocessing',
    category: 'data',
    description: 'Clean, normalize, and encode your data for modeling.',
    defaultData: {
        label: 'Preprocessing',
        category: 'data',
        missingValues: 'Mean',
        outlierHandling: 'None',
        scaling: 'Standard',
        encoding: 'OneHot',
        removeDuplicates: true,
        dropColumns: [],
    },
    properties: [
        {
            key: 'missingValues',
            label: 'Missing Values Strategy',
            type: 'select',
            options: [
                { value: 'Drop', label: 'Drop Rows' },
                { value: 'Mean', label: 'Fill with Mean' },
                { value: 'Median', label: 'Fill with Median' },
                { value: 'Mode', label: 'Fill with Mode' },
                { value: 'Zero', label: 'Fill with Zero' },
                { value: 'ForwardFill', label: 'Forward Fill' },
                { value: 'BackwardFill', label: 'Backward Fill' },
            ],
            defaultValue: 'Mean',
            description: 'How to handle missing (NaN) values in the dataset.',
        },
        {
            key: 'outlierHandling',
            label: 'Outlier Handling',
            type: 'select',
            options: [
                { value: 'None', label: 'None' },
                { value: 'IQR', label: 'IQR Clip' },
                { value: 'ZScore', label: 'Z-Score Remove (|z| > 3)' },
                { value: 'Winsorize', label: 'Winsorize (1st–99th pct)' },
            ],
            defaultValue: 'None',
            description: 'Strategy to detect and handle outliers.',
        },
        {
            key: 'scaling',
            label: 'Feature Scaling',
            type: 'select',
            options: [
                { value: 'None', label: 'None' },
                { value: 'Standard', label: 'Standard Scaler (z-score)' },
                { value: 'MinMax', label: 'Min-Max Scaler [0, 1]' },
                { value: 'Robust', label: 'Robust Scaler (IQR-based)' },
                { value: 'Normalizer', label: 'Normalizer (unit norm)' },
            ],
            defaultValue: 'Standard',
            description: 'Scale numerical features to a common range.',
        },
        {
            key: 'encoding',
            label: 'Categorical Encoding',
            type: 'select',
            options: [
                { value: 'None', label: 'None' },
                { value: 'OneHot', label: 'One-Hot Encoding' },
                { value: 'Label', label: 'Label Encoding' },
                { value: 'Ordinal', label: 'Ordinal Encoding' },
                { value: 'Target', label: 'Target Encoding' },
            ],
            defaultValue: 'OneHot',
            description: 'How to encode categorical (string) columns.',
        },
        {
            key: 'removeDuplicates',
            label: 'Remove Duplicate Rows',
            type: 'boolean',
            defaultValue: true,
            description: 'Drop exact duplicate rows from the dataset.',
        },
        {
            key: 'dropColumns',
            label: 'Columns to Drop',
            type: 'tags',
            defaultValue: [],
            placeholder: 'Type column name and press Enter...',
            description: 'Columns to remove before modeling (e.g. IDs, leakage columns).',
        },
    ],
    codeTemplate: (data: PreprocessNodeData) => {
        let code = `from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, Normalizer, LabelEncoder, OrdinalEncoder\nimport pandas as pd\nimport numpy as np\n\n`

        if (data.removeDuplicates) {
            code += `# Remove duplicate rows\ndf = df.drop_duplicates()\n\n`
        }

        if (data.dropColumns && data.dropColumns.length > 0) {
            code += `# Drop specified columns\ndf = df.drop(columns=${JSON.stringify(data.dropColumns)}, errors='ignore')\n\n`
        }

        // Missing values
        const mvMap: Record<string, string> = {
            Drop: `df = df.dropna()`,
            Mean: `df = df.fillna(df.mean(numeric_only=True))`,
            Median: `df = df.fillna(df.median(numeric_only=True))`,
            Mode: `df = df.fillna(df.mode().iloc[0])`,
            Zero: `df = df.fillna(0)`,
            ForwardFill: `df = df.ffill()`,
            BackwardFill: `df = df.bfill()`,
        }
        code += `# Handle missing values\n${mvMap[data.missingValues] || mvMap.Mean}\n\n`

        // Outlier handling
        if (data.outlierHandling === 'IQR') {
            code += `# Clip outliers using IQR\nnumerical_cols = df.select_dtypes(include=[np.number]).columns\nQ1 = df[numerical_cols].quantile(0.25)\nQ3 = df[numerical_cols].quantile(0.75)\nIQR = Q3 - Q1\ndf[numerical_cols] = df[numerical_cols].clip(Q1 - 1.5 * IQR, Q3 + 1.5 * IQR, axis=1)\n\n`
        } else if (data.outlierHandling === 'ZScore') {
            code += `# Remove outliers using Z-Score\nfrom scipy import stats\nnumerical_cols = df.select_dtypes(include=[np.number]).columns\ndf = df[(np.abs(stats.zscore(df[numerical_cols])) < 3).all(axis=1)]\n\n`
        } else if (data.outlierHandling === 'Winsorize') {
            code += `# Winsorize outliers (1st-99th percentile)\nfrom scipy.stats.mstats import winsorize\nnumerical_cols = df.select_dtypes(include=[np.number]).columns\nfor col in numerical_cols:\n    df[col] = winsorize(df[col], limits=[0.01, 0.01])\n\n`
        }

        // Scaling
        if (data.scaling !== 'None') {
            const scalerMap: Record<string, string> = {
                Standard: 'StandardScaler()',
                MinMax: 'MinMaxScaler()',
                Robust: 'RobustScaler()',
                Normalizer: 'Normalizer()',
            }
            code += `# Scale numerical features\nscaler = ${scalerMap[data.scaling]}\nnumerical_cols = df.select_dtypes(include=[np.number]).columns\ndf[numerical_cols] = scaler.fit_transform(df[numerical_cols])\n\n`
        }

        // Encoding
        if (data.encoding === 'OneHot') {
            code += `# One-hot encode categorical features\ndf = pd.get_dummies(df, drop_first=True)\n`
        } else if (data.encoding === 'Label') {
            code += `# Label encode categorical features\nle = LabelEncoder()\ncategorical_cols = df.select_dtypes(include=['object']).columns\nfor col in categorical_cols:\n    df[col] = le.fit_transform(df[col].astype(str))\n`
        } else if (data.encoding as string === 'Ordinal') {
            code += `# Ordinal encode categorical features\noe = OrdinalEncoder()\ncategorical_cols = df.select_dtypes(include=['object']).columns\ndf[categorical_cols] = oe.fit_transform(df[categorical_cols])\n`
        } else if (data.encoding as string === 'Target') {
            code += `# Target encode categorical features\n# pip install category_encoders\nimport category_encoders as ce\ncategorical_cols = df.select_dtypes(include=['object']).columns\nte = ce.TargetEncoder(cols=list(categorical_cols))\ndf = te.fit_transform(df, df[target_col])\n`
        }

        return code
    },
    validationRules: [
        {
            type: 'warning',
            condition: (data, pipeline) => {
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
