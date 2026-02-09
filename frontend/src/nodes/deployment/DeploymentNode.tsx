import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'

export function DeploymentNode(props: NodeProps) {
    const subtitle = props.data.deploymentType
    return <BaseNode {...props} category="deployment" data={{ ...props.data, subtitle }} />
}
