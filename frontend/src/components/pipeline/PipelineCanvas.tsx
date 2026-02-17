import React, { useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type NodeTypes,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { usePipelineStore } from '../../state/pipelineStore'
import { useConfigStore } from '../../state/configStore'

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
    onConnect,
    addNode,
    selectNode,
  } = usePipelineStore()
  const { openPanel } = useConfigStore()

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
    },
    [addNode]
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
        edges={edges}
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