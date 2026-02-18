import * as React from 'react'
import { cn } from '../../lib/utils'
import { Check } from 'lucide-react'

interface MultiSelectFieldProps {
    label?: string
    options: { value: string; label: string }[]
    value: string[]
    onChange: (value: string[]) => void
    description?: string
    className?: string
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
    label,
    options,
    value,
    onChange,
    description,
    className,
}) => {
    const toggle = (optValue: string) => {
        if (value.includes(optValue)) {
            onChange(value.filter((v) => v !== optValue))
        } else {
            onChange([...value, optValue])
        }
    }

    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-zinc-300 mb-2">{label}</label>
            )}
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                    const selected = value.includes(opt.value)
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggle(opt.value)}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-150',
                                selected
                                    ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
                            )}
                        >
                            {selected && <Check className="w-3 h-3" />}
                            {opt.label}
                        </button>
                    )
                })}
            </div>
            {description && (
                <p className="text-xs text-zinc-500 mt-1.5">{description}</p>
            )}
        </div>
    )
}
