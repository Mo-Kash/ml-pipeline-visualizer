import { type NodeConfig, type IngestNodeData } from '../../types/nodeTypes'

export const ingestConfig: NodeConfig = {
    type: 'ingestNode',
    label: 'Data Ingest',
    category: 'data',
    description: 'Load data from various sources into your pipeline.',
    defaultData: {
        label: 'Data Ingest',
        category: 'data',
        sourceType: 'CSV',
        dataType: 'Tabular',
        schemaKnown: true,
        delimiter: ',',
        targetColumn: '',
        sampleSize: 0,
    },
    properties: [
        {
            key: 'sourceType',
            label: 'Source Type',
            type: 'select',
            options: [
                { value: 'CSV', label: 'CSV File' },
                { value: 'Excel', label: 'Excel (XLSX)' },
                { value: 'JSON', label: 'JSON File' },
                { value: 'Parquet', label: 'Parquet File' },
                { value: 'SQL', label: 'SQL Database' },
                { value: 'API', label: 'REST API' },
                { value: 'Scraping', label: 'Web Scraping' },
                { value: 'HuggingFace', label: 'HuggingFace Dataset' },
            ],
            defaultValue: 'CSV',
            required: true,
            description: 'Where to load your data from.',
        },
        {
            key: 'filePath',
            label: 'File Path / URL',
            type: 'text',
            defaultValue: '',
            placeholder: 'e.g. data/train.csv or https://...',
            description: 'Path to the file or URL of the data source.',
            dependsOn: { key: 'sourceType', value: ['CSV', 'Excel', 'JSON', 'Parquet', 'API', 'Scraping', 'HuggingFace'] },
        },
        {
            key: 'delimiter',
            label: 'Delimiter',
            type: 'text',
            defaultValue: ',',
            placeholder: ',',
            description: 'Column separator character.',
            dependsOn: { key: 'sourceType', value: 'CSV' },
        },
        {
            key: 'dataType',
            label: 'Data Type',
            type: 'select',
            options: [
                { value: 'Tabular', label: 'Tabular' },
                { value: 'Text', label: 'Text / NLP' },
                { value: 'Image', label: 'Image' },
                { value: 'TimeSeries', label: 'Time Series' },
                { value: 'Audio', label: 'Audio' },
            ],
            defaultValue: 'Tabular',
            required: true,
            description: 'The type/modality of the data.',
        },
        {
            key: 'targetColumn',
            label: 'Target Column',
            type: 'text',
            defaultValue: '',
            placeholder: 'e.g. label, price, survived',
            description: 'Name of the column to predict (leave blank for unsupervised).',
        },
        {
            key: 'sampleSize',
            label: 'Sample Size (rows)',
            type: 'number',
            defaultValue: 0,
            min: 0,
            placeholder: '0 = load all rows',
            description: 'Limit rows loaded. 0 means load the full dataset.',
        },
        {
            key: 'schemaKnown',
            label: 'Schema Known',
            type: 'boolean',
            defaultValue: true,
            description: 'Whether the column types are known in advance.',
        },
    ],
    codeTemplate: (data: IngestNodeData) => {
        const templates: Record<string, string> = {
            CSV: `import pandas as pd\n\n# Load data from CSV\ndf = pd.read_csv("${data.filePath || 'data.csv'}", sep="${data.delimiter || ','}")\nprint(f"Loaded {len(df)} rows, {len(df.columns)} columns")`,
            Excel: `import pandas as pd\n\n# Load data from Excel\ndf = pd.read_excel("${data.filePath || 'data.xlsx'}")\nprint(f"Loaded {len(df)} rows, {len(df.columns)} columns")`,
            JSON: `import pandas as pd\n\n# Load data from JSON\ndf = pd.read_json("${data.filePath || 'data.json'}")\nprint(f"Loaded {len(df)} rows, {len(df.columns)} columns")`,
            Parquet: `import pandas as pd\n\n# Load data from Parquet\ndf = pd.read_parquet("${data.filePath || 'data.parquet'}")\nprint(f"Loaded {len(df)} rows, {len(df.columns)} columns")`,
            SQL: `import pandas as pd\nfrom sqlalchemy import create_engine\n\n# Load data from SQL database\nengine = create_engine("sqlite:///database.db")\ndf = pd.read_sql_query("SELECT * FROM table_name", engine)\nprint(f"Loaded {len(df)} rows, {len(df.columns)} columns")`,
            API: `import requests\nimport pandas as pd\n\n# Load data from REST API\nresponse = requests.get("${data.filePath || 'https://api.example.com/data'}")\ndata = response.json()\ndf = pd.DataFrame(data)\nprint(f"Loaded {len(df)} rows, {len(df.columns)} columns")`,
            Scraping: `import requests\nfrom bs4 import BeautifulSoup\nimport pandas as pd\n\n# Scrape data from web\nresponse = requests.get("${data.filePath || 'https://example.com'}")\nsoup = BeautifulSoup(response.text, 'html.parser')\n# Parse the page and build a DataFrame\ndf = pd.DataFrame()  # Fill in your parsing logic\nprint(f"Scraped {len(df)} rows")`,
            HuggingFace: `from datasets import load_dataset\nimport pandas as pd\n\n# Load dataset from HuggingFace Hub\ndataset = load_dataset("${data.filePath || 'dataset_name'}")\ndf = dataset['train'].to_pandas()\nprint(f"Loaded {len(df)} rows, {len(df.columns)} columns")`,
        }
        let code = templates[data.sourceType] || templates.CSV
        if (data.sampleSize && data.sampleSize > 0) {
            code += `\n\n# Sample the dataset\ndf = df.sample(n=${data.sampleSize}, random_state=42)`
        }
        return code
    },
    validationRules: [
        {
            type: 'error',
            condition: (data, pipeline) => {
                const ingestNodes = pipeline.nodes.filter((n: any) => n.type === 'ingestNode')
                return ingestNodes.length > 1
            },
            message: 'Only one Data Ingest node is allowed per pipeline',
        },
    ],
}
