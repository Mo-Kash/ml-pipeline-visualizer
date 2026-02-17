import { usePipelineStore } from '../../state/pipelineStore'
import { generatePipelineCode, downloadCode } from '../../services/codegen/generator'
import { Button } from '../ui/Button'
import { Code, Copy, Download, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/utils'

const CodeViewPanel = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const { nodes, edges } = usePipelineStore()

    const generatedCode = generatePipelineCode(nodes, edges)

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode.fullCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        downloadCode(generatedCode.fullCode)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors"
                title="View Generated Code"
            >
                <Code className="w-6 h-6" />
            </button>
        )
    }

    return (
        <div
            className={cn(
                'fixed bottom-0 right-0 z-40 w-full md:w-2/3 lg:w-1/2 h-2/3 bg-zinc-900 border-t border-l border-zinc-800 shadow-2xl transition-transform duration-300',
                isOpen ? 'translate-y-0' : 'translate-y-full'
            )}
        >
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
                    <div className="flex items-center gap-3">
                        <Code className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Generated Python Code</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownload}
                            className="gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </Button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-zinc-400 hover:text-white transition-colors p-2"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Code Display */}
                <div className="flex-1 overflow-auto p-4 bg-zinc-950">
                    {nodes.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-zinc-500">
                            <p>Add nodes to your pipeline to generate code</p>
                        </div>
                    ) : (
                        <pre className="text-sm text-zinc-300 font-mono">
                            <code>{generatedCode.fullCode}</code>
                        </pre>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-zinc-800 bg-zinc-950">
                    <p className="text-xs text-zinc-500">
                        {generatedCode.imports.length} imports • {nodes.length} nodes • Generated from pipeline
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CodeViewPanel
