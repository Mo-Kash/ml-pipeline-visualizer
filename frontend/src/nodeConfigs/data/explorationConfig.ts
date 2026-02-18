import { type NodeConfig, type ExplorationNodeData } from '../../types/nodeTypes'

export const explorationConfig: NodeConfig = {
    type: 'explorationNode',
    label: 'EDA',
    category: 'data',
    description: 'Explore and visualize your data to uncover patterns and insights.',
    defaultData: {
        label: 'EDA',
        category: 'data',
        edaType: 'Profiling',
        targetColumn: '',
        plotLibrary: 'Seaborn',
        saveReport: true,
    },
    properties: [
        {
            key: 'edaType',
            label: 'Analysis Type',
            type: 'select',
            options: [
                { value: 'Univariate', label: 'Univariate Analysis' },
                { value: 'Bivariate', label: 'Bivariate Analysis' },
                { value: 'Multivariate', label: 'Multivariate / PCA' },
                { value: 'Profiling', label: 'Pandas Profiling (Auto)' },
                { value: 'Sweetviz', label: 'Sweetviz Report' },
            ],
            defaultValue: 'Profiling',
            description: 'Type of exploratory analysis to perform.',
        },
        {
            key: 'targetColumn',
            label: 'Target Column',
            type: 'text',
            defaultValue: '',
            placeholder: 'e.g. label, price',
            description: 'Focus analysis on the relationship with this column.',
        },
        {
            key: 'plotLibrary',
            label: 'Plot Library',
            type: 'select',
            options: [
                { value: 'Matplotlib', label: 'Matplotlib' },
                { value: 'Seaborn', label: 'Seaborn' },
                { value: 'Plotly', label: 'Plotly (interactive)' },
            ],
            defaultValue: 'Seaborn',
            description: 'Library to use for generating plots.',
            dependsOn: { key: 'edaType', value: ['Univariate', 'Bivariate', 'Multivariate'] },
        },
        {
            key: 'saveReport',
            label: 'Save HTML Report',
            type: 'boolean',
            defaultValue: true,
            description: 'Save the generated report as an HTML file.',
            dependsOn: { key: 'edaType', value: ['Profiling', 'Sweetviz'] },
        },
    ],
    codeTemplate: (data: ExplorationNodeData) => {
        const lib = data.plotLibrary || 'Seaborn'
        const importLine = lib === 'Plotly'
            ? `import plotly.express as px`
            : lib === 'Seaborn'
                ? `import matplotlib.pyplot as plt\nimport seaborn as sns`
                : `import matplotlib.pyplot as plt`

        const templates: Record<string, string> = {
            Univariate: `${importLine}\n\n# Univariate analysis\nfor col in df.columns:\n    fig, ax = plt.subplots(figsize=(10, 4))\n    if df[col].dtype in ['int64', 'float64']:\n        ${lib === 'Plotly' ? 'fig = px.histogram(df, x=col, title=f"Distribution of {col}")\n        fig.show()' : 'sns.histplot(df[col], kde=True, ax=ax)\n        ax.set_title(f"Distribution of {col}")\n        plt.show()'}\n    else:\n        df[col].value_counts().plot(kind='bar', ax=ax)\n        ax.set_title(f"Value counts of {col}")\n        plt.show()`,
            Bivariate: `${importLine}\n\n# Bivariate analysis\n${lib === 'Plotly' ? 'import plotly.figure_factory as ff\ncorr = df.corr(numeric_only=True)\nfig = px.imshow(corr, text_auto=True, title="Correlation Matrix")\nfig.show()' : 'sns.pairplot(df)\nplt.show()\n\n# Correlation heatmap\nplt.figure(figsize=(12, 8))\nsns.heatmap(df.corr(numeric_only=True), annot=True, cmap="coolwarm", fmt=".2f")\nplt.title("Correlation Matrix")\nplt.show()'}`,
            Multivariate: `import matplotlib.pyplot as plt\nimport seaborn as sns\nfrom sklearn.decomposition import PCA\nimport numpy as np\n\n# PCA for multivariate analysis\nnumerical_df = df.select_dtypes(include=[np.number])\npca = PCA(n_components=2)\npca_result = pca.fit_transform(numerical_df)\n\nplt.figure(figsize=(10, 6))\nplt.scatter(pca_result[:, 0], pca_result[:, 1], alpha=0.6)\nplt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]:.1%} variance)")\nplt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]:.1%} variance)")\nplt.title("PCA — First Two Principal Components")\nplt.show()\nprint(f"Total variance explained: {pca.explained_variance_ratio_.sum():.1%}")`,
            Profiling: `# pip install ydata-profiling\nfrom ydata_profiling import ProfileReport\n\n# Generate comprehensive EDA report\nprofile = ProfileReport(df, title="Dataset Profiling Report", explorative=True)\n${data.saveReport ? 'profile.to_file("eda_report.html")\nprint("EDA report saved to eda_report.html")' : 'profile.to_notebook_iframe()'}`,
            Sweetviz: `# pip install sweetviz\nimport sweetviz as sv\n\n# Generate Sweetviz report\nreport = sv.analyze(df${data.targetColumn ? `, target_feat="${data.targetColumn}"` : ''})\n${data.saveReport ? 'report.show_html("sweetviz_report.html")\nprint("Sweetviz report saved to sweetviz_report.html")' : 'report.show_notebook()'}`,
        }
        return templates[data.edaType] || templates.Profiling
    },
}
