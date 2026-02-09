import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'

export function ModelSelectionNode(props: NodeProps) {
    const subtitle = props.data.modelName
    return <BaseNode {...props} category="model" data={{ ...props.data, subtitle }} />
}
