import { toPng, toSvg } from 'html-to-image'
import { getNodesBounds, getViewportForBounds } from '@xyflow/react'
import type { Node, Viewport } from '@xyflow/react'

export interface ExportOptions {
    format: 'png' | 'svg'
    filename?: string
    backgroundColor?: string
    width?: number
    height?: number
    /** Called before capture to fit all nodes in view */
    fitViewFn?: ((opts?: { padding?: number; duration?: number }) => void) | null
    /** Returns the current viewport so it can be restored after capture */
    getViewportFn?: (() => Viewport) | null
    /** Restores the viewport after capture */
    setViewportFn?: ((viewport: Viewport, opts?: { duration?: number }) => void) | null
}

/**
 * Export the pipeline canvas to an image.
 * Temporarily fits all nodes into view before capturing so that a zoomed-in
 * canvas does not result in a cropped image.
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
        fitViewFn,
        getViewportFn,
        setViewportFn,
    } = options

    // Get the canvas element
    const canvasElement = document.querySelector('.react-flow') as HTMLElement
    if (!canvasElement) {
        throw new Error('Canvas element not found')
    }

    // Save the current viewport so we can restore it after export
    const previousViewport = getViewportFn != null ? getViewportFn() : undefined

    try {
        // Fit all nodes into view before capturing
        if (fitViewFn != null) {
            fitViewFn({ padding: 0.15, duration: 0 })
            // Wait two animation frames for React Flow to re-render
            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
            })
        }

        // Calculate bounds to fit all nodes (for the style transform fallback)
        const nodesBounds = getNodesBounds(nodes)
        const viewport = getViewportForBounds(
            nodesBounds,
            width,
            height,
            0.5,   // min zoom
            2,     // max zoom
            0.15   // padding
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
    } finally {
        // Always restore the user's original viewport
        if (setViewportFn != null && previousViewport != null) {
            setViewportFn(previousViewport, { duration: 300 })
        }
    }
}

export interface NotebookExportData {
    /** Top-level import lines collected from all node code */
    imports: string[]
    /** Per-node code keyed by node id (in execution order) */
    nodeCode: Map<string, string>
    /** Nodes in execution order (must align with nodeCode) */
    sortedNodes: Node[]
}

/**
 * Export the pipeline to a Jupyter notebook (.ipynb).
 *
 * Builds cells from the structured code data returned by `generatePipelineCode`
 * rather than re-parsing the combined string, so no code is lost.
 */
export function exportToNotebook(
    data: NotebookExportData,
    projectName: string = 'ML Pipeline'
): void {
    const { imports, nodeCode, sortedNodes } = data
    const cells: object[] = []

    // ── Title cell ──────────────────────────────────────────────────────────
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

    // ── Imports cell ─────────────────────────────────────────────────────────
    if (imports.length > 0) {
        cells.push({
            cell_type: 'code',
            execution_count: null,
            metadata: {},
            outputs: [],
            source: imports.map((line, i) =>
                i < imports.length - 1 ? `${line}\n` : line
            ),
        })
    }

    // ── One section per node ─────────────────────────────────────────────────
    sortedNodes.forEach((node, index) => {
        const code = nodeCode.get(node.id)
        if (!code) return

        // Markdown label cell
        cells.push({
            cell_type: 'markdown',
            metadata: {},
            source: [
                `## ${index + 1}. ${(node.data?.label as string) || node.type}\n`,
                '\n',
                `Category: ${(node.data?.category as string) || 'unknown'}\n`,
            ],
        })

        // Code cell — split into per-line source array as Jupyter expects
        const lines = code.split('\n')
        cells.push({
            cell_type: 'code',
            execution_count: null,
            metadata: {},
            outputs: [],
            source: lines.map((line, i) =>
                i < lines.length - 1 ? `${line}\n` : line
            ).filter((line, i, arr) => !(i === arr.length - 1 && line === '')),
        })
    })

    // ── Notebook structure ───────────────────────────────────────────────────
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
