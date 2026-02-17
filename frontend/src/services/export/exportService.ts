import { toPng, toSvg } from 'html-to-image'
import { getNodesBounds, getViewportForBounds } from '@xyflow/react'
import type { Node } from '@xyflow/react'

export interface ExportOptions {
    format: 'png' | 'svg'
    filename?: string
    backgroundColor?: string
    width?: number
    height?: number
}

/**
 * Export the pipeline canvas to an image
 * @param nodes - Array of pipeline nodes
 * @param options - Export options
 */
export async function exportToImage(
    nodes: Node[],
    options: ExportOptions = { format: 'png' }
): Promise<void> {
    const {
        format = 'png',
        filename = `pipeline-${Date.now()}.${format}`,
        backgroundColor = '#000000',
        width = 1920,
        height = 1080,
    } = options

    // Get the canvas element
    const canvasElement = document.querySelector('.react-flow') as HTMLElement
    if (!canvasElement) {
        throw new Error('Canvas element not found')
    }

    try {
        // Calculate bounds to fit all nodes
        const nodesBounds = getNodesBounds(nodes)
        const viewport = getViewportForBounds(
            nodesBounds,
            width,
            height,
            0.5, // min zoom
            2, // max zoom
            0.1 // padding
        )

        // Create image based on format
        const dataUrl = format === 'svg'
            ? await toSvg(canvasElement, {
                backgroundColor,
                width,
                height,
                style: {
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                },
            })
            : await toPng(canvasElement, {
                backgroundColor,
                width,
                height,
                style: {
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                },
            })

        // Download the image
        const link = document.createElement('a')
        link.download = filename
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (error) {
        console.error('Error exporting to image:', error)
        throw error
    }
}

/**
 * Export the pipeline to a Jupyter notebook (.ipynb)
 * @param nodes - Array of pipeline nodes sorted in execution order
 * @param generatedCode - Generated Python code
 * @param projectName - Name of the project
 */
export function exportToNotebook(
    nodes: Node[],
    generatedCode: string,
    projectName: string = 'ML Pipeline'
): void {
    const cells: any[] = []

    // Add title cell
    cells.push({
        cell_type: 'markdown',
        metadata: {},
        source: [
            `# ${projectName}\n`,
            '\n',
            'This notebook was generated from the ML Pipeline Visualizer.\n',
            '\n',
            `Generated on: ${new Date().toLocaleString()}\n`,
        ],
    })

    // Add imports cell
    cells.push({
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
            '# Import required libraries\n',
            generatedCode.split('\n\n')[0], // First section should be imports
        ],
    })

    // Add a cell for each node
    const codeBlocks = generatedCode.split('\n\n').slice(1) // Skip imports
    nodes.forEach((node, index) => {
        // Add markdown cell with node description
        cells.push({
            cell_type: 'markdown',
            metadata: {},
            source: [
                `## ${index + 1}. ${node.data?.label || node.type}\n`,
                '\n',
                `Category: ${node.data?.category || 'unknown'}\n`,
            ],
        })

        // Add code cell with node code
        if (codeBlocks[index]) {
            cells.push({
                cell_type: 'code',
                execution_count: null,
                metadata: {},
                outputs: [],
                source: [codeBlocks[index]],
            })
        }
    })

    // Create notebook structure
    const notebook = {
        cells,
        metadata: {
            kernelspec: {
                display_name: 'Python 3',
                language: 'python',
                name: 'python3',
            },
            language_info: {
                codemirror_mode: {
                    name: 'ipython',
                    version: 3,
                },
                file_extension: '.py',
                mimetype: 'text/x-python',
                name: 'python',
                nbconvert_exporter: 'python',
                pygments_lexer: 'ipython3',
                version: '3.9.0',
            },
        },
        nbformat: 4,
        nbformat_minor: 4,
    }

    // Download the notebook
    const blob = new Blob([JSON.stringify(notebook, null, 2)], {
        type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${projectName.replace(/\s+/g, '_').toLowerCase()}.ipynb`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
