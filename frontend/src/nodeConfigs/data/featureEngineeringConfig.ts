import { type NodeConfig, type FeatureEngineeringNodeData } from '../../types/nodeTypes'

export const featureEngineeringConfig: NodeConfig = {
    type: 'featureEngineeringNode',
    label: 'Feature Engineering',
    category: 'data',
    description: 'Transform and create features',
    defaultData: {
        label: 'Feature Engineering',
        category: 'data',
        transformationType: 'Polynomial',
        polynomialDegree: 2,
    },
    properties: [
        {
            key: 'transformationType',
            label: 'Transformation Type',
            type: 'select',
            options: [
                { value: 'None', label: 'None' },
                { value: 'Polynomial', label: 'Polynomial Features' },
                { value: 'Selection', label: 'Feature Selection' },
                { value: 'Domain', label: 'Domain-Specific' },
            ],
            defaultValue: 'Polynomial',
        },
        {
            key: 'polynomialDegree',
            label: 'Polynomial Degree',
            type: 'number',
            defaultValue: 2,
        },
    ],
    codeTemplate: (data: FeatureEngineeringNodeData) => {
        if (data.transformationType === 'Polynomial') {
            return `from sklearn.preprocessing import PolynomialFeatures\n\n# Create polynomial features\npoly = PolynomialFeatures(degree=${data.polynomialDegree || 2})\nX_poly = poly.fit_transform(X)\nprint(f"Created {X_poly.shape[1]} polynomial features")`
        } else if (data.transformationType === 'Selection') {
            return `from sklearn.feature_selection import SelectKBest, f_classif\n\n# Select best features\nselector = SelectKBest(f_classif, k=10)\nX_selected = selector.fit_transform(X, y)\nprint(f"Selected {X_selected.shape[1]} features")`
        } else if (data.transformationType === 'Domain') {
            return `# Domain-specific feature engineering\n# Example: Create interaction features\ndf['feature_interaction'] = df['feature1'] * df['feature2']\ndf['feature_ratio'] = df['feature1'] / (df['feature2'] + 1)\nprint("Created domain-specific features")`
        }
        return `# No feature engineering applied`
    },
    validationRules: [
        {
            type: 'warning',
            condition: (data, pipeline) => {
                return data.transformationType === 'Polynomial' && (data.polynomialDegree || 0) > 3
            },
            message: 'High polynomial degrees may lead to overfitting',
        },
    ],
}
