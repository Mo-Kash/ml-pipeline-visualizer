
import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'

export function ExplorationNode(props: NodeProps) {
    return <BaseNode {...props} category="data" />
}
