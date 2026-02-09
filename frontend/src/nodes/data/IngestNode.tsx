import React from 'react'
import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'

export function IngestNode(props: NodeProps) {
    const subtitle = `${props.data.sourceType} | ${props.data.dataType}`
    return <BaseNode {...props} category="data" data={{ ...props.data, subtitle }} />
}
