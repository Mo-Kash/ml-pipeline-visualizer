import { type NodeConfig, type DeploymentNodeData } from '../../types/nodeTypes'

export const deploymentConfig: NodeConfig = {
    type: 'deploymentNode',
    label: 'Deployment',
    category: 'deployment',
    description: 'Deploy model to production',
    defaultData: {
        label: 'Deployment',
        category: 'deployment',
        deploymentType: 'REST API',
        monitoring: true,
        framework: 'FastAPI',
    },
    properties: [
        {
            key: 'deploymentType',
            label: 'Deployment Type',
            type: 'select',
            options: [
                { value: 'REST API', label: 'REST API' },
                { value: 'Batch', label: 'Batch Processing' },
                { value: 'Streaming', label: 'Streaming' },
            ],
            defaultValue: 'REST API',
            required: true,
        },
        {
            key: 'monitoring',
            label: 'Enable Monitoring',
            type: 'boolean',
            defaultValue: true,
        },
        {
            key: 'framework',
            label: 'Framework',
            type: 'select',
            options: [
                { value: 'FastAPI', label: 'FastAPI' },
                { value: 'Flask', label: 'Flask' },
                { value: 'Django', label: 'Django' },
            ],
            defaultValue: 'FastAPI',
        },
    ],
    codeTemplate: (data: DeploymentNodeData) => {
        if (data.deploymentType === 'REST API') {
            return `# Save the model\nimport joblib\njoblib.dump(model, 'model.pkl')\n\n# FastAPI deployment example\nfrom fastapi import FastAPI\nimport numpy as np\n\napp = FastAPI()\n\n@app.post("/predict")\ndef predict(features: list):\n    model = joblib.load('model.pkl')\n    prediction = model.predict([features])\n    return {"prediction": prediction.tolist()}\n\n# Run with: uvicorn main:app --reload\n# Docs: https://fastapi.tiangolo.com/`
        } else if (data.deploymentType === 'Batch') {
            return `# Save the model\nimport joblib\njoblib.dump(model, 'model.pkl')\n\n# Batch prediction\ndef batch_predict(input_file, output_file):\n    model = joblib.load('model.pkl')\n    data = pd.read_csv(input_file)\n    predictions = model.predict(data)\n    \n    results = pd.DataFrame({\n        'prediction': predictions\n    })\n    results.to_csv(output_file, index=False)\n    print(f"Predictions saved to {output_file}")\n\nbatch_predict('input.csv', 'predictions.csv')`
        }
        return `# Model deployment code`
    },
}
