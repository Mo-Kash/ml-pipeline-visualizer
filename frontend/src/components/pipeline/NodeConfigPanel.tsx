import { useState, useEffect, useCallback } from 'react'
import { usePipelineStore } from '../../state/pipelineStore'
import { useConfigStore } from '../../state/configStore'
import { getNodeConfig } from '../../nodeConfigs'
import { ConfigField } from './ConfigField'
import { Button } from '../ui/Button'
import { X, Trash2, RotateCcw, Check, Info } from 'lucide-react'
import { cn } from '../../lib/utils'

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'data': return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' }
    case 'model': return { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
    case 'deployment': return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' }
    default: return { text: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/30' }
  }
}

const NodeConfigPanel = () => {
  const { selectedNodeId, nodes, deleteNode, updateNode } = usePipelineStore()
  const { isPanelOpen, closePanel } = useConfigStore()

  const selectedNode = nodes.find(node => node.id === selectedNodeId)
  const config = selectedNode ? getNodeConfig(selectedNode.type as string) : undefined

  // Local form state — initialized from node.data
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [saved, setSaved] = useState(false)

  // Reset form whenever selected node changes
  useEffect(() => {
    if (selectedNode) {
      setFormValues({ ...(selectedNode.data as Record<string, any>) })
      setSaved(false)
    }
  }, [selectedNode?.id])

  const handleChange = useCallback((key: string, value: any) => {
    setFormValues(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }, [])

  const handleApply = () => {
    if (!selectedNodeId) return
    updateNode(selectedNodeId, formValues)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (selectedNode) {
      setFormValues({ ...(selectedNode.data as Record<string, any>) })
      setSaved(false)
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      deleteNode(selectedNodeId!)
      closePanel()
    }
  }

  if (!isPanelOpen || !selectedNode) return null

  const category = selectedNode.data.category as string
  const colors = getCategoryColor(category)

  // Deduplicate properties with same key (for conditional selects like modelName)
  // We show only the first matching property for each key based on dependsOn
  const visibleProperties = config?.properties.filter(prop => {
    if (!prop.dependsOn) return true
    const depValue = formValues[prop.dependsOn.key]
    const expected = prop.dependsOn.value
    return Array.isArray(expected) ? expected.includes(depValue) : depValue === expected
  }) ?? []

  // Deduplicate by key — keep first visible one
  const seenKeys = new Set<string>()
  const deduplicatedProperties = visibleProperties.filter(prop => {
    if (seenKeys.has(prop.key)) return false
    seenKeys.add(prop.key)
    return true
  })

  return (
    <aside
      className={cn(
        'w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col transition-transform duration-300',
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white truncate">
            {selectedNode.data.label as string}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize',
              colors.text, colors.bg, colors.border
            )}>
              {category}
            </span>
            <span className="text-xs text-zinc-500 truncate">{selectedNode.type}</span>
          </div>
        </div>
        <button
          onClick={closePanel}
          className="text-zinc-400 hover:text-white transition-colors mt-0.5 shrink-0"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      {config?.description && (
        <div className="px-4 py-3 border-b border-zinc-800 flex gap-2 bg-zinc-800/40">
          <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-400 leading-relaxed">{config.description}</p>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        {config && deduplicatedProperties.length > 0 ? (
          <div className="space-y-5">
            {config.properties.map((prop) => (
              <ConfigField
                key={`${prop.key}-${prop.dependsOn?.value ?? 'base'}`}
                property={prop}
                value={formValues[prop.key]}
                allValues={formValues}
                onChange={handleChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500">No configuration options available for this node type.</p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-zinc-800 space-y-2">
        {/* Apply / Reset row */}
        <div className="flex gap-2">
          <Button
            variant="default"
            className={cn(
              'flex-1 gap-2 transition-all',
              saved && 'bg-green-600 hover:bg-green-600'
            )}
            onClick={handleApply}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Apply
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleReset}
            title="Reset to last saved values"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Delete */}
        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
          Delete Node
        </Button>
      </div>
    </aside>
  )
}

export default NodeConfigPanel