import React from 'react'
import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'

export function DataSplitNode(props: NodeProps) {
    const subtitle = `Train: ${props.data.trainSize} | Test: ${props.data.testSize}`
    return <BaseNode {...props} category="data" data={{ ...props.data, subtitle }} />
}
