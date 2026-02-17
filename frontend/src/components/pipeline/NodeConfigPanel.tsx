import { usePipelineStore } from '../../state/pipelineStore'
import { useConfigStore } from '../../state/configStore'
import { Button } from '../ui/Button'
import { X, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'

const NodeConfigPanel = () => {
  const { selectedNodeId, nodes, deleteNode } = usePipelineStore()
  const { isPanelOpen, closePanel } = useConfigStore()

  const selectedNode = nodes.find(node => node.id === selectedNodeId)

  if (!isPanelOpen || !selectedNode) {
    return null
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      deleteNode(selectedNodeId!)
      closePanel()
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'data':
        return 'text-blue-400'
      case 'model':
        return 'text-purple-400'
      case 'deployment':
        return 'text-green-400'
      default:
        return 'text-zinc-400'
    }
  }

  return (
    <aside
      className={cn(
        'w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col transition-transform duration-300',
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Node Configuration</h3>
          <p className={cn("text-sm mt-1", getCategoryColor(selectedNode.data.category))}>
            {selectedNode.data.label}
          </p>
        </div>
        <button
          onClick={closePanel}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Node ID
            </label>
            <div className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-400">
              {selectedNode.id}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Node Type
            </label>
            <div className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-400">
              {selectedNode.type}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Category
            </label>
            <div className={cn(
              "px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm capitalize",
              getCategoryColor(selectedNode.data.category)
            )}>
              {selectedNode.data.category}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <p className="text-sm text-zinc-400 mb-4">
              Configuration options for this node type will be available soon.
            </p>
            <p className="text-xs text-zinc-500">
              This panel will allow you to configure specific parameters for each node type,
              such as data sources, preprocessing methods, model algorithms, and deployment settings.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800">
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