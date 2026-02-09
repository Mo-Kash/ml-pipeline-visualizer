import React from 'react'
import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'

export function PreprocessNode(props: NodeProps) {
    const subtitle = `${props.data.scaling} | ${props.data.encoding}`
    return <BaseNode {...props} category="data" data={{ ...props.data, subtitle }} />
}
