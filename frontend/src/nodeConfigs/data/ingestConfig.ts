import { type NodeConfig, type IngestNodeData } from '../../types/nodeTypes'

export const ingestConfig: NodeConfig = {
    type: 'ingestNode',
    label: 'Data Ingest',
    category: 'data',
    description: 'Load data from various sources',
    defaultData: {
        label: 'Data Ingest',
        category: 'data',
        sourceType: 'CSV',
        dataType: 'Tabular',
        schemaKnown: true,
    },
    properties: [
        {
            key: 'sourceType',
            label: 'Source Type',
            type: 'select',
            options: [
                { value: 'CSV', label: 'CSV File' },
                { value: 'JSON', label: 'JSON File' },
                { value: 'SQL', label: 'SQL Database' },
                { value: 'API', label: 'API Endpoint' },
            ],
            defaultValue: 'CSV',
            required: true,
        },
        {
            key: 'dataType',
            label: 'Data Type',
            type: 'select',
            options: [
                { value: 'Tabular', label: 'Tabular' },
                { value: 'Text', label: 'Text' },
                { value: 'Image', label: 'Image' },
            ],
            defaultValue: 'Tabular',
            required: true,
        },
        {
            key: 'schemaKnown',
            label: 'Schema Known',
            type: 'boolean',
            defaultValue: true,
        },
    ],
    codeTemplate: (data: IngestNodeData) => {
        const templates = {
            CSV: `import pandas as pd\n\n# Load data from CSV\ndf = pd.read_csv("data.csv")\nprint(f"Loaded {len(df)} rows")`,
            JSON: `import pandas as pd\n\n# Load data from JSON\ndf = pd.read_json("data.json")\nprint(f"Loaded {len(df)} rows")`,
            SQL: `import pandas as pd\nfrom sqlalchemy import create_engine\n\n# Load data from SQL database\nengine = create_engine("sqlite:///database.db")\ndf = pd.read_sql_query("SELECT * FROM table_name", engine)\nprint(f"Loaded {len(df)} rows")`,
            API: `import requests\nimport pandas as pd\n\n# Load data from API\nresponse = requests.get("https://api.example.com/data")\ndata = response.json()\ndf = pd.DataFrame(data)\nprint(f"Loaded {len(df)} rows")`,
        }
        return templates[data.sourceType] || templates.CSV
    },
    validationRules: [
        {
            type: 'error',
            condition: (data, pipeline) => {
                // Ingest must be the first node
                const ingestNodes = pipeline.nodes.filter((n: any) => n.type === 'ingestNode')
                return ingestNodes.length > 1
            },
            message: 'Only one Data Ingest node is allowed per pipeline',
        },
    ],
}
