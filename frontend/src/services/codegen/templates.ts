// Code templates for generating Python/sklearn code from ML pipeline nodes

export interface CodeTemplate {
    imports: string[]
    code: string
    variables: {
        input?: string
        output?: string
    }
}

// Data Processing Templates
export const DATA_INGESTION_TEMPLATE = (config: any): CodeTemplate => ({
    imports: ['import pandas as pd'],
    code: `# Data Ingestion
${config.sourceType === 'csv' ? `data = pd.read_csv('${config.filePath || 'data.csv'}')` : ''}
${config.sourceType === 'database' ? `# Connect to database and load data\ndata = pd.read_sql_query('${config.query || 'SELECT * FROM table'}', connection)` : ''}
${config.sourceType === 'api' ? `# Fetch data from API\nimport requests\nresponse = requests.get('${config.apiUrl || 'https://api.example.com/data'}')\ndata = pd.DataFrame(response.json())` : ''}
print(f"Loaded {len(data)} rows and {len(data.columns)} columns")`,
    variables: {
        output: 'data',
    },
})

export const PREPROCESSING_TEMPLATE = (config: any): CodeTemplate => ({
    imports: ['from sklearn.preprocessing import StandardScaler, LabelEncoder'],
    code: `# Preprocessing
${config.handleMissing ? `# Handle missing values\ndata = data.fillna(data.mean(numeric_only=True))` : ''}
${config.scaleFeatures ? `# Scale features\nscaler = StandardScaler()\ndata[numeric_columns] = scaler.fit_transform(data[numeric_columns])` : ''}
${config.encodeCategories ? `# Encode categorical variables\nle = LabelEncoder()\nfor col in categorical_columns:\n    data[col] = le.fit_transform(data[col])` : ''}
print("Preprocessing complete")`,
    variables: {
        input: 'data',
        output: 'data',
    },
})

export const EXPLORATION_TEMPLATE = (config: any): CodeTemplate => ({
    imports: ['import matplotlib.pyplot as plt', 'import seaborn as sns'],
    code: `# Data Exploration
print(data.describe())
print(data.info())

# Visualizations
${config.showCorrelation ? `plt.figure(figsize=(10, 8))\nsns.heatmap(data.corr(), annot=True, cmap='coolwarm')\nplt.title('Correlation Matrix')\nplt.show()` : ''}
${config.showDistributions ? `data.hist(figsize=(12, 10))\nplt.tight_layout()\nplt.show()` : ''}`,
    variables: {
        input: 'data',
    },
})

export const FEATURE_ENGINEERING_TEMPLATE = (config: any): CodeTemplate => ({
    imports: ['from sklearn.feature_selection import SelectKBest, f_classif'],
    code: `# Feature Engineering
${config.createPolynomial ? `from sklearn.preprocessing import PolynomialFeatures\npoly = PolynomialFeatures(degree=${config.polynomialDegree || 2})\nX_poly = poly.fit_transform(X)` : ''}
${config.selectFeatures ? `# Feature selection\nselector = SelectKBest(f_classif, k=${config.numFeatures || 10})\nX_selected = selector.fit_transform(X, y)` : ''}
${config.createInteractions ? `# Create interaction features\n# Add custom interaction features here` : ''}
print("Feature engineering complete")`,
    variables: {
        input: 'X',
        output: 'X',
    },
})

export const DATA_SPLIT_TEMPLATE = (config: any): CodeTemplate => ({
    imports: ['from sklearn.model_selection import train_test_split'],
    code: `# Split data into train and test sets
X = data.drop('${config.targetColumn || 'target'}', axis=1)
y = data['${config.targetColumn || 'target'}']

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=${config.testSize || 0.2},
    random_state=${config.randomState || 42}${config.stratify ? ',\n    stratify=y' : ''}
)
print(f"Training set: {len(X_train)} samples")
print(f"Test set: {len(X_test)} samples")`,
    variables: {
        input: 'data',
        output: 'X_train, X_test, y_train, y_test',
    },
})

// Model Development Templates
export const MODEL_SELECTION_TEMPLATE = (config: any): CodeTemplate => {
    const modelImports: Record<string, string> = {
        linearRegression: 'from sklearn.linear_model import LinearRegression',
        logisticRegression: 'from sklearn.linear_model import LogisticRegression',
        randomForest: 'from sklearn.ensemble import RandomForestClassifier',
        decisionTree: 'from sklearn.tree import DecisionTreeClassifier',
        svm: 'from sklearn.svm import SVC',
        xgboost: 'from xgboost import XGBClassifier',
        neuralNetwork: 'from sklearn.neural_network import MLPClassifier',
    }

    const modelCode: Record<string, string> = {
        linearRegression: 'model = LinearRegression()',
        logisticRegression: `model = LogisticRegression(max_iter=${config.maxIter || 1000})`,
        randomForest: `model = RandomForestClassifier(n_estimators=${config.nEstimators || 100}, random_state=42)`,
        decisionTree: `model = DecisionTreeClassifier(max_depth=${config.maxDepth || 'None'}, random_state=42)`,
        svm: `model = SVC(kernel='${config.kernel || 'rbf'}', C=${config.C || 1.0})`,
        xgboost: `model = XGBClassifier(n_estimators=${config.nEstimators || 100}, learning_rate=${config.learningRate || 0.1})`,
        neuralNetwork: `model = MLPClassifier(hidden_layer_sizes=(${config.hiddenLayers || '100, 50'}), max_iter=${config.maxIter || 1000})`,
    }

    const modelType = config.algorithm || 'randomForest'

    return {
        imports: [modelImports[modelType] || modelImports.randomForest],
        code: `# Model Selection
${modelCode[modelType] || modelCode.randomForest}
print(f"Selected model: {type(model).__name__}")`,
        variables: {
            output: 'model',
        },
    }
}

export const TRAINING_TEMPLATE = (config: any): CodeTemplate => ({
    imports: [],
    code: `# Model Training
${config.crossValidation ? `from sklearn.model_selection import cross_val_score\ncv_scores = cross_val_score(model, X_train, y_train, cv=${config.cvFolds || 5})\nprint(f"Cross-validation scores: {cv_scores}")\nprint(f"Mean CV score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")` : ''}

model.fit(X_train, y_train)
print("Model training complete")`,
    variables: {
        input: 'model, X_train, y_train',
        output: 'model',
    },
})

export const EVALUATION_TEMPLATE = (config: any): CodeTemplate => ({
    imports: [
        'from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score',
        'from sklearn.metrics import confusion_matrix, classification_report',
    ],
    code: `# Model Evaluation
y_pred = model.predict(X_test)

# Calculate metrics
accuracy = accuracy_score(y_test, y_pred)
${config.showPrecision ? `precision = precision_score(y_test, y_pred, average='weighted')` : ''}
${config.showRecall ? `recall = recall_score(y_test, y_pred, average='weighted')` : ''}
${config.showF1 ? `f1 = f1_score(y_test, y_pred, average='weighted')` : ''}

print(f"Accuracy: {accuracy:.4f}")
${config.showPrecision ? `print(f"Precision: {precision:.4f}")` : ''}
${config.showRecall ? `print(f"Recall: {recall:.4f}")` : ''}
${config.showF1 ? `print(f"F1 Score: {f1:.4f}")` : ''}

${config.showConfusionMatrix ? `# Confusion Matrix\nprint("\\nConfusion Matrix:")\nprint(confusion_matrix(y_test, y_pred))` : ''}

${config.showClassificationReport ? `# Classification Report\nprint("\\nClassification Report:")\nprint(classification_report(y_test, y_pred))` : ''}`,
    variables: {
        input: 'model, X_test, y_test',
    },
})

// Deployment Template
export const DEPLOYMENT_TEMPLATE = (config: any): CodeTemplate => ({
    imports: ['import joblib'],
    code: `# Model Deployment
# Save the model
joblib.dump(model, '${config.modelPath || 'model.pkl'}')
print(f"Model saved to ${config.modelPath || 'model.pkl'}")

${config.platform === 'flask' ? `# Flask API example
from flask import Flask, request, jsonify

app = Flask(__name__)
model = joblib.load('${config.modelPath || 'model.pkl'}')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    prediction = model.predict([data['features']])
    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(debug=True)` : ''}

${config.platform === 'docker' ? `# Dockerfile example
# FROM python:3.9-slim
# COPY requirements.txt .
# RUN pip install -r requirements.txt
# COPY model.pkl .
# COPY app.py .
# CMD ["python", "app.py"]` : ''}`,
    variables: {
        input: 'model',
    },
})

// Template mapping
export const NODE_TEMPLATES: Record<string, (config: any) => CodeTemplate> = {
    dataIngest: DATA_INGESTION_TEMPLATE,
    preprocess: PREPROCESSING_TEMPLATE,
    exploration: EXPLORATION_TEMPLATE,
    featureEngineering: FEATURE_ENGINEERING_TEMPLATE,
    dataSplit: DATA_SPLIT_TEMPLATE,
    modelSelection: MODEL_SELECTION_TEMPLATE,
    training: TRAINING_TEMPLATE,
    evaluation: EVALUATION_TEMPLATE,
    deployment: DEPLOYMENT_TEMPLATE,
}
