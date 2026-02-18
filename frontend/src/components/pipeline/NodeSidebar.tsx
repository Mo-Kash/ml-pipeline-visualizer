import React, { useState } from 'react'
import {
  Database,
  Settings,
  BarChart3,
  Wrench,
  Split,
  Brain,
  Play,
  Target,
  Cloud,
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface NodeType {
  type: string
  label: string
  icon: React.ReactNode
  category: 'data' | 'model' | 'deployment'
  description: string
}

const nodeTypes: NodeType[] = [
  // Data Processing
  {
    type: 'ingestNode',
    label: 'Data Ingestion',
    icon: <Database className="w-4 h-4" />,
    category: 'data',
    description: 'Load data from various sources'
  },
  {
    type: 'preprocessNode',
    label: 'Preprocessing',
    icon: <Settings className="w-4 h-4" />,
    category: 'data',
    description: 'Clean and transform data'
  },
  {
    type: 'explorationNode',
    label: 'Data Exploration',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'data',
    description: 'Analyze and visualize data'
  },
  {
    type: 'featureEngineeringNode',
    label: 'Feature Engineering',
    icon: <Wrench className="w-4 h-4" />,
    category: 'data',
    description: 'Create and select features'
  },
  {
    type: 'dataSplitNode',
    label: 'Data Split',
    icon: <Split className="w-4 h-4" />,
    category: 'data',
    description: 'Split into train/test sets'
  },
  // Model Development
  {
    type: 'modelSelectionNode',
    label: 'Model Selection',
    icon: <Brain className="w-4 h-4" />,
    category: 'model',
    description: 'Choose ML algorithm'
  },
  {
    type: 'trainingNode',
    label: 'Model Training',
    icon: <Play className="w-4 h-4" />,
    category: 'model',
    description: 'Train the model'
  },
  {
    type: 'evaluationNode',
    label: 'Model Evaluation',
    icon: <Target className="w-4 h-4" />,
    category: 'model',
    description: 'Evaluate model performance'
  },
  // Deployment
  {
    type: 'deploymentNode',
    label: 'Deployment',
    icon: <Cloud className="w-4 h-4" />,
    category: 'deployment',
    description: 'Deploy model to production'
  },
]

const categories = [
  { id: 'data', label: 'Data Processing', color: 'text-blue-400' },
  { id: 'model', label: 'Model Development', color: 'text-purple-400' },
  { id: 'deployment', label: 'Deployment', color: 'text-green-400' },
]

const NodeSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['data', 'model', 'deployment'])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType.type)
    event.dataTransfer.setData('nodeLabel', nodeType.label)
    event.dataTransfer.setData('nodeCategory', nodeType.category)
    event.dataTransfer.effectAllowed = 'move'
  }

  const filteredNodes = nodeTypes.filter(node =>
    node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <aside className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-3">Pipeline Nodes</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {categories.map(category => {
          const categoryNodes = filteredNodes.filter(node => node.category === category.id)
          const isExpanded = expandedCategories.includes(category.id)

          if (categoryNodes.length === 0 && searchQuery) return null

          return (
            <div key={category.id} className="space-y-2">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  )}
                  <span className={cn("font-medium", category.color)}>
                    {category.label}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">
                  {categoryNodes.length}
                </span>
              </button>

              {isExpanded && (
                <div className="space-y-1 ml-2">
                  {categoryNodes.map(node => (
                    <div
                      key={node.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, node)}
                      className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800 border border-zinc-700 cursor-move hover:border-zinc-600 hover:bg-zinc-750 transition-all group"
                    >
                      <div className="mt-0.5 text-zinc-400 group-hover:text-white transition-colors">
                        {node.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white group-hover:text-zinc-100">
                          {node.label}
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          {node.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {filteredNodes.length === 0 && (
          <div className="text-center py-8 text-zinc-500 text-sm">
            No nodes found matching "{searchQuery}"
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 text-center">
          Drag nodes onto the canvas to build your pipeline
        </p>
      </div>
    </aside>
  )
}

export default NodeSidebar