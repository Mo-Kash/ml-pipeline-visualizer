import React from 'react'
import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'

export function ExplorationNode(props: NodeProps) {
    const subtitle = props.data.edaType
    return <BaseNode {...props} category="data" data={{ ...props.data, subtitle }} />
}
