import { useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type NodeTypes,
  type Connection,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { usePipelineStore } from '../../state/pipelineStore'
import { useConfigStore } from '../../state/configStore'
import { useNotificationStore } from '../../state/notificationStore'
import { validatePipeline } from '../../services/validation/validationService'
import { validateConnection, getEdgeStyle, type NodeCategory } from '../../services/validation/compatibilityMatrix'

// Import node components
import { IngestNode } from '../../nodes/data/IngestNode'
import { PreprocessNode } from '../../nodes/data/PreprocessNode'
import { ExplorationNode } from '../../nodes/data/ExplorationNode'
import { FeatureEngineeringNode } from '../../nodes/data/FeatureEngineeringNode'
import { DataSplitNode } from '../../nodes/data/DataSplitNode'
import { ModelSelectionNode } from '../../nodes/model/ModelSelectionNode'
import { TrainingNode } from '../../nodes/model/TrainingNode'
import { EvaluationNode } from '../../nodes/model/EvaluationNode'

const nodeTypes: NodeTypes = {
  dataIngest: IngestNode,
  preprocess: PreprocessNode,
  exploration: ExplorationNode,
  featureEngineering: FeatureEngineeringNode,
  dataSplit: DataSplitNode,
  modelSelection: ModelSelectionNode,
  training: TrainingNode,
  evaluation: EvaluationNode,
}

const PipelineCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect: onConnectStore,
    addNode,
    selectNode,
  } = usePipelineStore()
  const { openPanel } = useConfigStore()
  const { addNotification, clearAll } = useNotificationStore()

  // Validate pipeline whenever nodes or edges change
  useEffect(() => {
    if (nodes.length === 0) return

    const validation = validatePipeline(nodes, edges)

    // Clear previous notifications
    clearAll()

    // Show errors
    validation.errors.forEach(error => {
      addNotification({
        type: 'error',
        message: error.message,
        suggestion: error.suggestion,
        dismissible: true,
        duration: 0, // Don't auto-dismiss errors
      })
    })

    // Show warnings (auto-dismiss after 5 seconds)
    validation.warnings.forEach(warning => {
      addNotification({
        type: 'warning',
        message: warning.message,
        suggestion: warning.suggestion,
        dismissible: true,
        duration: 5000,
      })
    })
  }, [nodes, edges, addNotification, clearAll])

  // Apply validation styling to edges
  const styledEdges = edges.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)

    if (!sourceNode || !targetNode) return edge

    const validation = validateConnection(
      sourceNode.type || '',
      targetNode.type || '',
      sourceNode.data?.category as NodeCategory,
      targetNode.data?.category as NodeCategory
    )

    const style = getEdgeStyle(validation.level)

    return {
      ...edge,
      style,
      animated: style.animated || false,
    }
  })

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      const label = event.dataTransfer.getData('nodeLabel')
      const category = event.dataTransfer.getData('nodeCategory')

      if (!type || !reactFlowWrapper.current) {
        return
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = {
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top - 20,
      }

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label,
          category,
          config: {},
        },
      }

      addNode(newNode)

      // Show success notification
      addNotification({
        type: 'success',
        message: `Added ${label} node`,
        dismissible: true,
        duration: 2000,
      })
    },
    [addNode, addNotification]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find(n => n.id === connection.source)
      const targetNode = nodes.find(n => n.id === connection.target)

      if (!sourceNode || !targetNode) return

      // Validate the connection before adding
      const validation = validateConnection(
        sourceNode.type || '',
        targetNode.type || '',
        sourceNode.data?.category as NodeCategory,
        targetNode.data?.category as NodeCategory
      )

      // Always add the connection, but show notification based on validation
      onConnectStore(connection)

      if (validation.level === 'error') {
        addNotification({
          type: 'error',
          message: validation.message,
          suggestion: validation.suggestion,
          dismissible: true,
          duration: 0,
        })
      } else if (validation.level === 'warning') {
        addNotification({
          type: 'warning',
          message: validation.message,
          suggestion: validation.suggestion,
          dismissible: true,
          duration: 5000,
        })
      } else {
        addNotification({
          type: 'success',
          message: 'Connection created successfully',
          dismissible: true,
          duration: 2000,
        })
      }
    },
    [nodes, onConnectStore, addNotification]
  )

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectNode(node.id)
      openPanel(node.id)
    },
    [selectNode, openPanel]
  )

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-black"
        defaultEdgeOptions={{
          style: { stroke: '#52525b', strokeWidth: 2 },
          type: 'smoothstep',
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#27272a"
        />
        <Controls
          className="bg-zinc-900 border border-zinc-800 rounded-lg"
          showInteractive={false}
        />
        <MiniMap
          className="bg-zinc-900 border border-zinc-800 rounded-lg"
          nodeColor={(node) => {
            const category = node.data?.category
            if (category === 'data') return '#3b82f6'
            if (category === 'model') return '#a855f7'
            if (category === 'deployment') return '#22c55e'
            return '#71717a'
          }}
        />
      </ReactFlow>
    </div>
  )
}

export default PipelineCanvas