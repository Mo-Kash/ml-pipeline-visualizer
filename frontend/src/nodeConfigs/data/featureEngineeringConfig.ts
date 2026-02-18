import { type NodeConfig, type FeatureEngineeringNodeData } from '../../types/nodeTypes'

export const featureEngineeringConfig: NodeConfig = {
    type: 'featureEngineeringNode',
    label: 'Feature Engineering',
    category: 'data',
    description: 'Transform, select, or create features to improve model performance.',
    defaultData: {
        label: 'Feature Engineering',
        category: 'data',
        transformationType: 'Polynomial',
        polynomialDegree: 2,
        nComponents: 10,
        kBestFeatures: 10,
        selectionMethod: 'f_classif',
    },
    properties: [
        {
            key: 'transformationType',
            label: 'Transformation Type',
            type: 'select',
            options: [
                { value: 'None', label: 'None' },
                { value: 'Polynomial', label: 'Polynomial Features' },
                { value: 'Selection', label: 'Feature Selection (SelectKBest)' },
                { value: 'PCA', label: 'PCA Dimensionality Reduction' },
                { value: 'LogTransform', label: 'Log Transform' },
                { value: 'Binning', label: 'Binning / Discretization' },
                { value: 'Domain', label: 'Domain-Specific (Custom)' },
            ],
            defaultValue: 'Polynomial',
            description: 'Which feature engineering technique to apply.',
        },
        {
            key: 'polynomialDegree',
            label: 'Polynomial Degree',
            type: 'slider',
            defaultValue: 2,
            min: 2,
            max: 5,
            step: 1,
            description: 'Higher degrees capture more complexity but risk overfitting.',
            dependsOn: { key: 'transformationType', value: 'Polynomial' },
        },
        {
            key: 'nComponents',
            label: 'Number of PCA Components',
            type: 'number',
            defaultValue: 10,
            min: 1,
            placeholder: 'e.g. 10',
            description: 'Number of principal components to keep.',
            dependsOn: { key: 'transformationType', value: 'PCA' },
        },
        {
            key: 'kBestFeatures',
            label: 'K Best Features',
            type: 'number',
            defaultValue: 10,
            min: 1,
            placeholder: 'e.g. 10',
            description: 'Number of top features to select.',
            dependsOn: { key: 'transformationType', value: 'Selection' },
        },
        {
            key: 'selectionMethod',
            label: 'Selection Scoring Function',
            type: 'select',
            options: [
                { value: 'f_classif', label: 'F-test (Classification)' },
                { value: 'mutual_info_classif', label: 'Mutual Info (Classification)' },
                { value: 'chi2', label: 'Chi-Squared (Classification)' },
                { value: 'f_regression', label: 'F-test (Regression)' },
                { value: 'mutual_info_regression', label: 'Mutual Info (Regression)' },
            ],
            defaultValue: 'f_classif',
            description: 'Scoring function used to rank features.',
            dependsOn: { key: 'transformationType', value: 'Selection' },
        },
    ],
    codeTemplate: (data: FeatureEngineeringNodeData) => {
        switch (data.transformationType) {
            case 'Polynomial':
                return `from sklearn.preprocessing import PolynomialFeatures\n\n# Create polynomial features (degree=${data.polynomialDegree || 2})\npoly = PolynomialFeatures(degree=${data.polynomialDegree || 2}, include_bias=False)\nX_poly = poly.fit_transform(X)\nprint(f"Expanded from {X.shape[1]} to {X_poly.shape[1]} features")`
            case 'Selection':
                return `from sklearn.feature_selection import SelectKBest, ${data.selectionMethod || 'f_classif'}\n\n# Select top ${data.kBestFeatures || 10} features\nselector = SelectKBest(${data.selectionMethod || 'f_classif'}, k=${data.kBestFeatures || 10})\nX_selected = selector.fit_transform(X, y)\nselected_mask = selector.get_support()\nselected_features = X.columns[selected_mask].tolist()\nprint(f"Selected features: {selected_features}")`
            case 'PCA':
                return `from sklearn.decomposition import PCA\n\n# PCA dimensionality reduction to ${data.nComponents || 10} components\npca = PCA(n_components=${data.nComponents || 10})\nX_pca = pca.fit_transform(X)\nprint(f"Explained variance: {pca.explained_variance_ratio_.sum():.1%}")`
            case 'LogTransform':
                return `import numpy as np\n\n# Log transform (handles skewed distributions)\nnumerical_cols = X.select_dtypes(include=[np.number]).columns\nfor col in numerical_cols:\n    if (X[col] > 0).all():\n        X[col] = np.log1p(X[col])\nprint("Log transform applied to positive numerical columns")`
            case 'Binning':
                return `import pandas as pd\n\n# Binning / discretization\nnumerical_cols = X.select_dtypes(include=['float64', 'int64']).columns\nfor col in numerical_cols:\n    X[f"{col}_binned"] = pd.cut(X[col], bins=5, labels=False)\nprint(f"Created {len(numerical_cols)} binned features")`
            case 'Domain':
                return `# Domain-specific feature engineering\n# Example: Create interaction and ratio features\ndf['feature_interaction'] = df['feature1'] * df['feature2']\ndf['feature_ratio'] = df['feature1'] / (df['feature2'] + 1e-9)\ndf['feature_diff'] = df['feature1'] - df['feature2']\nprint("Created domain-specific features")`
            default:
                return `# No feature engineering applied\nprint("Passing data through unchanged")`
        }
    },
    validationRules: [
        {
            type: 'warning',
            condition: (data) => {
                return data.transformationType === 'Polynomial' && (data.polynomialDegree || 0) > 3
            },
            message: 'High polynomial degrees (>3) may lead to overfitting',
        },
    ],
}
