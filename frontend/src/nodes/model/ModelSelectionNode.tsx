
import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'

export function ModelSelectionNode(props: NodeProps) {
    return <BaseNode {...props} category="model" />
}
