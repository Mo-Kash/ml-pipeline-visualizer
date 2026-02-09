import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'

export function EvaluationNode(props: NodeProps) {
    const subtitle = props.data.crossValidation ? 'With CV' : 'No CV'
    return <BaseNode {...props} category="model" data={{ ...props.data, subtitle }} />
}
