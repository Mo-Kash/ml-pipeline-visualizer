import * as React from 'react'
import { cn } from '../../lib/utils'

interface SliderInputProps {
    label?: string
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    description?: string
    className?: string
}

export const SliderInput: React.FC<SliderInputProps> = ({
    label,
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    description,
    className,
}) => {
    const percentage = ((value - min) / (max - min)) * 100

    return (
        <div className={cn('w-full', className)}>
            {label && (
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-zinc-300">{label}</label>
                    <span className="text-sm font-mono text-violet-400 bg-zinc-800 px-2 py-0.5 rounded">
                        {value}
                    </span>
                </div>
            )}
            <div className="relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-700 slider-thumb"
                    style={{
                        background: `linear-gradient(to right, #7c3aed ${percentage}%, #3f3f46 ${percentage}%)`,
                    }}
                />
                <div className="flex justify-between mt-1">
                    <span className="text-xs text-zinc-500">{min}</span>
                    <span className="text-xs text-zinc-500">{max}</span>
                </div>
            </div>
            {description && (
                <p className="text-xs text-zinc-500 mt-1">{description}</p>
            )}
        </div>
    )
}
