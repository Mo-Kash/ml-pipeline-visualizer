import { type Node, type Edge } from '@xyflow/react'
import {
    validateConnection,
    validatePipelineStructure,
    type ValidationResult,
    type ValidationLevel,
    type NodeCategory,
} from './compatibilityMatrix'

export interface PipelineValidation {
    isValid: boolean
    errors: ValidationResult[]
    warnings: ValidationResult[]
    edgeValidations: Map<string, ValidationResult>
}

export function validatePipeline(nodes: Node[], edges: Edge[]): PipelineValidation {
    const errors: ValidationResult[] = []
    const warnings: ValidationResult[] = []
    const edgeValidations = new Map<string, ValidationResult>()

    // Validate overall pipeline structure
    const structureResults = validatePipelineStructure(nodes, edges)
    structureResults.forEach(result => {
        if (result.level === 'error') {
            errors.push(result)
        } else if (result.level === 'warning') {
            warnings.push(result)
        }
    })

    // Validate each edge connection
    edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source)
        const targetNode = nodes.find(n => n.id === edge.target)

        if (!sourceNode || !targetNode) {
            const result: ValidationResult = {
                level: 'error',
                message: 'Invalid connection: node not found',
            }
            edgeValidations.set(edge.id, result)
            errors.push(result)
            return
        }

        const result = validateConnection(
            sourceNode.type || '',
            targetNode.type || '',
            sourceNode.data?.category as NodeCategory,
            targetNode.data?.category as NodeCategory
        )

        edgeValidations.set(edge.id, result)

        if (result.level === 'error') {
            errors.push(result)
        } else if (result.level === 'warning') {
            warnings.push(result)
        }
    })

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        edgeValidations,
    }
}

export function getValidationLevel(edgeId: string, validation: PipelineValidation): ValidationLevel {
    const result = validation.edgeValidations.get(edgeId)
    return result?.level || 'valid'
}
