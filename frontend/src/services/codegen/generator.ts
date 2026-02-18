import { type Node, type Edge } from '@xyflow/react'
import { getNodeConfig } from '../../nodeConfigs'

export interface GeneratedCode {
    fullCode: string
    imports: string[]
    nodeCode: Map<string, string>
}

/**
 * Generate Python code from a pipeline using each node's codeTemplate function.
 * @param nodes - Array of pipeline nodes
 * @param edges - Array of pipeline edges
 * @returns Generated Python code
 */
export function generatePipelineCode(nodes: Node[], edges: Edge[]): GeneratedCode {
    const nodeCode = new Map<string, string>()
    const codeBlocks: string[] = []

    // Sort nodes in execution order (topological sort)
    const sortedNodes = topologicalSort(nodes, edges)

    // Generate code for each node using its config's codeTemplate
    sortedNodes.forEach(node => {
        const config = getNodeConfig(node.type as string)
        if (!config) return

        // Pass the full node data (which includes all config values)
        const code = config.codeTemplate(node.data)
        if (!code || !code.trim()) return

        nodeCode.set(node.id, code)
        codeBlocks.push(`# ── ${config.label} ──\n${code}`)
    })

    // Extract top-level import lines from all code blocks
    const importLines = new Set<string>()
    const bodyBlocks: string[] = []

    codeBlocks.forEach(block => {
        const lines = block.split('\n')
        const nonImportLines: string[] = []
        lines.forEach(line => {
            if (/^(import |from )/.test(line.trim())) {
                importLines.add(line.trim())
            } else {
                nonImportLines.push(line)
            }
        })
        const body = nonImportLines.join('\n').trim()
        if (body) bodyBlocks.push(body)
    })

    const importSection = Array.from(importLines).join('\n')
    const codeSection = bodyBlocks.join('\n\n')

    const fullCode = nodes.length === 0
        ? '# Add nodes to your pipeline to generate code'
        : `${importSection}\n\n# ═══════════════════════════════════════════\n# ML Pipeline — Generated Code\n# ═══════════════════════════════════════════\n\n${codeSection}\n`

    return {
        fullCode,
        imports: Array.from(importLines),
        nodeCode,
    }
}

/**
 * Topological sort of nodes based on edges (Kahn's algorithm).
 */
function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
    const adjList = new Map<string, string[]>()
    const inDegree = new Map<string, number>()

    nodes.forEach(node => {
        adjList.set(node.id, [])
        inDegree.set(node.id, 0)
    })

    edges.forEach(edge => {
        const neighbors = adjList.get(edge.source) || []
        neighbors.push(edge.target)
        adjList.set(edge.source, neighbors)
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
    })

    const queue: string[] = []
    const sorted: Node[] = []

    inDegree.forEach((degree, nodeId) => {
        if (degree === 0) queue.push(nodeId)
    })

    while (queue.length > 0) {
        const nodeId = queue.shift()!
        const node = nodes.find(n => n.id === nodeId)
        if (node) sorted.push(node)

        const neighbors = adjList.get(nodeId) || []
        neighbors.forEach(neighbor => {
            const newDegree = (inDegree.get(neighbor) || 0) - 1
            inDegree.set(neighbor, newDegree)
            if (newDegree === 0) queue.push(neighbor)
        })
    }

    // Fallback: if cycle detected, return original order
    if (sorted.length !== nodes.length) {
        console.warn('Cycle detected in pipeline, using original node order')
        return nodes
    }

    return sorted
}

/**
 * Export code as a downloadable file.
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
