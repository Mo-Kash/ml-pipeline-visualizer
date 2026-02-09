import { type NodeConfig, type ExplorationNodeData } from '../../types/nodeTypes'

export const explorationConfig: NodeConfig = {
    type: 'explorationNode',
    label: 'EDA',
    category: 'data',
    description: 'Exploratory data analysis',
    defaultData: {
        label: 'EDA',
        category: 'data',
        edaType: 'Profiling',
    },
    properties: [
        {
            key: 'edaType',
            label: 'Analysis Type',
            type: 'select',
            options: [
                { value: 'Univariate', label: 'Univariate Analysis' },
                { value: 'Bivariate', label: 'Bivariate Analysis' },
                { value: 'Multivariate', label: 'Multivariate Analysis' },
                { value: 'Profiling', label: 'Pandas Profiling' },
            ],
            defaultValue: 'Profiling',
        },
    ],
    codeTemplate: (data: ExplorationNodeData) => {
        const templates = {
            Univariate: `import matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Univariate analysis\nfor col in df.columns:\n    plt.figure(figsize=(10, 4))\n    if df[col].dtype in ['int64', 'float64']:\n        sns.histplot(df[col], kde=True)\n    else:\n        df[col].value_counts().plot(kind='bar')\n    plt.title(f'Distribution of {col}')\n    plt.show()`,
            Bivariate: `import matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Bivariate analysis\nsns.pairplot(df)\nplt.show()\n\n# Correlation matrix\nplt.figure(figsize=(12, 8))\nsns.heatmap(df.corr(), annot=True, cmap='coolwarm')\nplt.title('Correlation Matrix')\nplt.show()`,
            Multivariate: `import matplotlib.pyplot as plt\nimport seaborn as sns\nfrom sklearn.decomposition import PCA\n\n# PCA for multivariate analysis\npca = PCA(n_components=2)\npca_result = pca.fit_transform(df.select_dtypes(include=['float64', 'int64']))\n\nplt.figure(figsize=(10, 6))\nplt.scatter(pca_result[:, 0], pca_result[:, 1])\nplt.xlabel('First Principal Component')\nplt.ylabel('Second Principal Component')\nplt.title('PCA Analysis')\nplt.show()`,
            Profiling: `from pandas_profiling import ProfileReport\n\n# Generate comprehensive EDA report\nprofile = ProfileReport(df, title='Pandas Profiling Report')\nprofile.to_file("eda_report.html")\nprint("EDA report saved to eda_report.html")`,
        }
        return templates[data.edaType] || templates.Profiling
    },
}
