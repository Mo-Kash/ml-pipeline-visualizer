// Compatibility matrix for ML pipeline nodes
// Defines which node types can connect to each other and validation rules

export type NodeCategory = 'data' | 'model' | 'deployment'
export type ValidationLevel = 'valid' | 'warning' | 'error'

export interface ValidationResult {
    level: ValidationLevel
    message: string
    suggestion?: string
}

// Define the expected flow order
const PHASE_ORDER = {
    data: 1,
    model: 2,
    deployment: 3,
}

// Compatibility rules: source -> target
const COMPATIBILITY_RULES: Record<string, {
    allowed: string[]
    warnings: string[]
    suggestions: Record<string, string>
}> = {
    // Data Processing Phase
    dataIngest: {
        allowed: ['preprocess', 'exploration', 'featureEngineering', 'dataSplit'],
        warnings: ['dataSplit'], // Skipping preprocessing might be suboptimal
        suggestions: {
            dataSplit: 'Consider adding preprocessing before splitting data',
        },
    },
    preprocess: {
        allowed: ['exploration', 'featureEngineering', 'dataSplit', 'preprocess'],
        warnings: [],
        suggestions: {},
    },
    exploration: {
        allowed: ['preprocess', 'featureEngineering', 'dataSplit'],
        warnings: ['dataSplit'],
        suggestions: {
            dataSplit: 'Consider feature engineering before splitting',
        },
    },
    featureEngineering: {
        allowed: ['dataSplit', 'featureEngineering'],
        warnings: [],
        suggestions: {},
    },
    dataSplit: {
        allowed: ['modelSelection', 'training'],
        warnings: ['training'],
        suggestions: {
            training: 'Consider selecting a model before training',
        },
    },

    // Model Development Phase
    modelSelection: {
        allowed: ['training', 'modelSelection'],
        warnings: [],
        suggestions: {},
    },
    training: {
        allowed: ['evaluation', 'training'],
        warnings: [],
        suggestions: {},
    },
    evaluation: {
        allowed: ['deployment', 'training', 'evaluation'],
        warnings: ['deployment'],
        suggestions: {
            deployment: 'Ensure model performance is satisfactory before deployment',
        },
    },

    // Deployment Phase
    deployment: {
        allowed: ['deployment'],
        warnings: [],
        suggestions: {},
    },
}

// Data type compatibility with models
const DATA_MODEL_COMPATIBILITY: Record<string, {
    optimal: string[]
    suboptimal: string[]
    incompatible: string[]
}> = {
    // This would be expanded based on actual data types
    // For now, we'll use general rules
    tabular: {
        optimal: ['linearRegression', 'logisticRegression', 'randomForest', 'decisionTree', 'xgboost'],
        suboptimal: ['neuralNetwork'],
        incompatible: ['cnn', 'rnn'],
    },
    image: {
        optimal: ['cnn', 'neuralNetwork'],
        suboptimal: ['randomForest'],
        incompatible: ['linearRegression', 'logisticRegression'],
    },
    text: {
        optimal: ['rnn', 'transformer', 'neuralNetwork'],
        suboptimal: ['randomForest'],
        incompatible: ['linearRegression'],
    },
    timeSeries: {
        optimal: ['rnn', 'lstm', 'arima'],
        suboptimal: ['randomForest', 'xgboost'],
        incompatible: ['cnn'],
    },
}

export function validateConnection(
    sourceType: string,
    targetType: string,
    sourceCategory: NodeCategory,
    targetCategory: NodeCategory
): ValidationResult {
    // Check if connecting backwards in the pipeline
    if (PHASE_ORDER[targetCategory] < PHASE_ORDER[sourceCategory]) {
        return {
            level: 'warning',
            message: 'Connecting backwards in the pipeline flow',
            suggestion: 'Standard flow is: Data → Model → Deployment',
        }
    }

    // Check if skipping a phase
    if (PHASE_ORDER[targetCategory] - PHASE_ORDER[sourceCategory] > 1) {
        return {
            level: 'warning',
            message: `Skipping ${getSkippedPhase(sourceCategory, targetCategory)} phase`,
            suggestion: 'Consider adding intermediate steps for better results',
        }
    }

    // Check specific node type compatibility
    const rules = COMPATIBILITY_RULES[sourceType]
    if (!rules) {
        return {
            level: 'valid',
            message: 'Connection allowed',
        }
    }

    if (!rules.allowed.includes(targetType)) {
        return {
            level: 'error',
            message: `${sourceType} cannot connect to ${targetType}`,
            suggestion: `${sourceType} can connect to: ${rules.allowed.join(', ')}`,
        }
    }

    if (rules.warnings.includes(targetType)) {
        return {
            level: 'warning',
            message: rules.suggestions[targetType] || 'This connection may be suboptimal',
            suggestion: 'Consider adding intermediate nodes',
        }
    }

    return {
        level: 'valid',
        message: 'Connection is valid',
    }
}

function getSkippedPhase(source: NodeCategory, target: NodeCategory): string {
    if (source === 'data' && target === 'deployment') return 'model development'
    return 'intermediate'
}

export function validatePipelineStructure(nodes: any[], edges: any[]): ValidationResult[] {
    const results: ValidationResult[] = []

    // Check if pipeline has at least one node from each phase
    const categories = new Set(nodes.map(n => n.data?.category))

    if (!categories.has('data')) {
        results.push({
            level: 'error',
            message: 'Pipeline must include at least one data processing node',
            suggestion: 'Add a Data Ingestion node to start your pipeline',
        })
    }

    if (!categories.has('model')) {
        results.push({
            level: 'warning',
            message: 'Pipeline has no model development nodes',
            suggestion: 'Add Model Selection and Training nodes',
        })
    }

    // Check for disconnected nodes
    const connectedNodes = new Set<string>()
    edges.forEach(edge => {
        connectedNodes.add(edge.source)
        connectedNodes.add(edge.target)
    })

    const disconnectedNodes = nodes.filter(n => !connectedNodes.has(n.id))
    if (disconnectedNodes.length > 0 && nodes.length > 1) {
        results.push({
            level: 'warning',
            message: `${disconnectedNodes.length} disconnected node(s)`,
            suggestion: 'Connect all nodes to create a complete pipeline',
        })
    }

    // Check for circular dependencies
    if (hasCircularDependency(nodes, edges)) {
        results.push({
            level: 'error',
            message: 'Pipeline contains circular dependencies',
            suggestion: 'Remove cycles to create a valid directed acyclic graph',
        })
    }

    return results
}

function hasCircularDependency(nodes: any[], edges: any[]): boolean {
    const graph = new Map<string, string[]>()

    // Build adjacency list
    nodes.forEach(node => graph.set(node.id, []))
    edges.forEach(edge => {
        const neighbors = graph.get(edge.source) || []
        neighbors.push(edge.target)
        graph.set(edge.source, neighbors)
    })

    // DFS to detect cycles
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    function hasCycle(nodeId: string): boolean {
        visited.add(nodeId)
        recursionStack.add(nodeId)

        const neighbors = graph.get(nodeId) || []
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                if (hasCycle(neighbor)) return true
            } else if (recursionStack.has(neighbor)) {
                return true
            }
        }

        recursionStack.delete(nodeId)
        return false
    }

    for (const nodeId of graph.keys()) {
        if (!visited.has(nodeId)) {
            if (hasCycle(nodeId)) return true
        }
    }

    return false
}

export function getEdgeStyle(validationLevel: ValidationLevel): {
    stroke: string
    strokeWidth: number
    animated?: boolean
} {
    switch (validationLevel) {
        case 'valid':
            return { stroke: '#22c55e', strokeWidth: 2 } // Green
        case 'warning':
            return { stroke: '#eab308', strokeWidth: 2, animated: true } // Yellow
        case 'error':
            return { stroke: '#ef4444', strokeWidth: 2, animated: true } // Red
    }
}
