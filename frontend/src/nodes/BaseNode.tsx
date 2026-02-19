
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '../lib/utils'

interface BaseNodeProps extends NodeProps {
    category: 'data' | 'model' | 'deployment'
}

export function BaseNode({ data, selected, category }: BaseNodeProps) {
    const categoryClasses = {
        data: 'node-data',
        model: 'node-model',
        deployment: 'node-deployment',
    }

    return (
        <div
            className={cn(
                'px-4 py-3 rounded-lg shadow-lg min-w-37.5 border-2 transition-all',
                categoryClasses[category],
                selected && 'ring-2 ring-white ring-offset-2 ring-offset-black'
            )}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3"
            />

            <div className="flex flex-col gap-1">
                <div className="font-semibold text-sm">{data.label as React.ReactNode}</div>
                {data.subtitle as React.ReactNode && (
                    <div className="text-xs opacity-80">{data.subtitle as React.ReactNode}</div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3"
            />
        </div>
    )
}