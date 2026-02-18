// Node categories
export type NodeCategory = 'data' | 'model' | 'deployment'

// Base node data interface
export interface BaseNodeData {
    label: string
    category: NodeCategory
    [key: string]: any
}

// Data node types
export interface IngestNodeData extends BaseNodeData {
    sourceType: 'CSV' | 'JSON' | 'SQL' | 'API'
    dataType: 'Tabular' | 'Text' | 'Image'
    schemaKnown: boolean
}

export interface PreprocessNodeData extends BaseNodeData {
    scaling: 'None' | 'Standard' | 'MinMax'
    encoding: 'None' | 'Label' | 'OneHot'
    missingValues: 'Drop' | 'Mean' | 'Median' | 'Mode'
}

export interface ExplorationNodeData extends BaseNodeData {
    edaType: 'Univariate' | 'Bivariate' | 'Multivariate' | 'Profiling'
}

export interface FeatureEngineeringNodeData extends BaseNodeData {
    transformationType: 'Polynomial' | 'Selection' | 'Domain' | 'None' | 'PCA' | 'LogTransform' | 'Binning'
    polynomialDegree?: number
}

export interface DataSplitNodeData extends BaseNodeData {
    trainSize: number
    testSize: number
    validationSize?: number
    randomState: number
    stratify: boolean
}

// Model node types
export interface ModelSelectionNodeData extends BaseNodeData {
    modelName: string
    modelType: 'Linear' | 'Tree' | 'Ensemble' | 'Neural'
    taskType: 'Classification' | 'Regression'
}

export interface TrainingNodeData extends BaseNodeData {
    learningType: 'Supervised' | 'Unsupervised' | 'SemiSupervised' | 'Reinforcement'
    hyperparameters: Record<string, any>
}

export interface EvaluationNodeData extends BaseNodeData {
    metrics: string[]
    crossValidation: boolean
    cvFolds?: number
}

// Deployment node types
export interface DeploymentNodeData extends BaseNodeData {
    deploymentType: 'REST API' | 'Batch' | 'Streaming'
    monitoring: boolean
    framework?: string
}

// Node configuration interface
export interface NodeConfig {
    type: string
    label: string
    category: NodeCategory
    description: string
    defaultData: BaseNodeData
    properties: NodeProperty[]
    codeTemplate: (data: any) => string
    validationRules?: ValidationRule[]
}

export interface NodeProperty {
    key: string
    label: string
    type: 'text' | 'select' | 'number' | 'boolean' | 'multiselect' | 'slider' | 'textarea' | 'tags'
    options?: { value: string; label: string }[]
    defaultValue: any
    required?: boolean
    min?: number
    max?: number
    step?: number
    placeholder?: string
    description?: string
    dependsOn?: { key: string; value: any }
}

export interface ValidationRule {
    type: 'error' | 'warning' | 'info'
    condition: (data: any, pipeline: any) => boolean
    message: string
}
