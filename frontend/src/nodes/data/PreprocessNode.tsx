
import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'

export function PreprocessNode(props: NodeProps) {
    return <BaseNode {...props} category="data" />
}
