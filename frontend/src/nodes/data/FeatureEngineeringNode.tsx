import React from 'react'
import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'

export function FeatureEngineeringNode(props: NodeProps) {
    const subtitle = props.data.transformationType
    return <BaseNode {...props} category="data" data={{ ...props.data, subtitle }} />
}
