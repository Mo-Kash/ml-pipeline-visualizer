import { type Node, type Edge } from '@xyflow/react'
import { NODE_TEMPLATES, type CodeTemplate } from './templates'

export interface GeneratedCode {
    fullCode: string
    imports: string[]
    nodeCode: Map<string, string>
}

/**
 * Generate Python code from a pipeline
 * @param nodes - Array of pipeline nodes
 * @param edges - Array of pipeline edges
 * @returns Generated Python code with imports
 */
export function generatePipelineCode(nodes: Node[], edges: Edge[]): GeneratedCode {
    const imports = new Set<string>()
    const nodeCode = new Map<string, string>()
    const codeBlocks: string[] = []

    // Sort nodes in execution order (topological sort)
    const sortedNodes = topologicalSort(nodes, edges)

    // Generate code for each node
    sortedNodes.forEach(node => {
        const template = NODE_TEMPLATES[node.type || '']
        if (!template) return

        const config = node.data?.config || {}
        const codeTemplate = template(config)

        // Add imports
        codeTemplate.imports.forEach(imp => imports.add(imp))

        // Store node code
        nodeCode.set(node.id, codeTemplate.code)
        codeBlocks.push(codeTemplate.code)
    })

    // Build full code
    const importSection = Array.from(imports).join('\n')
    const codeSection = codeBlocks.join('\n\n')

    const fullCode = `${importSection}

# ML Pipeline Generated Code
# Generated from pipeline visualizer

${codeSection}
`

    return {
        fullCode,
        imports: Array.from(imports),
        nodeCode,
    }
}

/**
 * Topological sort of nodes based on edges
 * @param nodes - Array of nodes
 * @param edges - Array of edges
 * @returns Sorted array of nodes in execution order
 */
function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
    // Build adjacency list and in-degree map
    const adjList = new Map<string, string[]>()
    const inDegree = new Map<string, number>()

    // Initialize
    nodes.forEach(node => {
        adjList.set(node.id, [])
        inDegree.set(node.id, 0)
    })

    // Build graph
    edges.forEach(edge => {
        const neighbors = adjList.get(edge.source) || []
        neighbors.push(edge.target)
        adjList.set(edge.source, neighbors)
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
    })

    // Kahn's algorithm for topological sort
    const queue: string[] = []
    const sorted: Node[] = []

    // Add nodes with no incoming edges
    inDegree.forEach((degree, nodeId) => {
        if (degree === 0) {
            queue.push(nodeId)
        }
    })

    while (queue.length > 0) {
        const nodeId = queue.shift()!
        const node = nodes.find(n => n.id === nodeId)
        if (node) {
            sorted.push(node)
        }

        // Reduce in-degree for neighbors
        const neighbors = adjList.get(nodeId) || []
        neighbors.forEach(neighbor => {
            const newDegree = (inDegree.get(neighbor) || 0) - 1
            inDegree.set(neighbor, newDegree)
            if (newDegree === 0) {
                queue.push(neighbor)
            }
        })
    }

    // If sorted length doesn't match nodes length, there's a cycle
    // Return nodes in original order as fallback
    if (sorted.length !== nodes.length) {
        console.warn('Cycle detected in pipeline, using original node order')
        return nodes
    }

    return sorted
}

/**
 * Generate code for a single node
 * @param node - The node to generate code for
 * @returns Code template for the node
 */
export function generateNodeCode(node: Node): CodeTemplate | null {
    const template = NODE_TEMPLATES[node.type || '']
    if (!template) return null

    const config = node.data?.config || {}
    return template(config)
}

/**
 * Export code as a downloadable file
 * @param code - The code to export
 * @param filename - Name of the file
 */
export function downloadCode(code: string, filename: string = 'pipeline.py') {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
