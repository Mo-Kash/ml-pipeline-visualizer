
import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'

export function IngestNode(props: NodeProps) {
    return <BaseNode {...props} category="data" />
}
