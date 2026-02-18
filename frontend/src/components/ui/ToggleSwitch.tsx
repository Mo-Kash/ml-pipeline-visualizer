import * as React from 'react'
import { cn } from '../../lib/utils'

interface ToggleSwitchProps {
    label?: string
    checked: boolean
    onChange: (checked: boolean) => void
    description?: string
    className?: string
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    label,
    checked,
    onChange,
    description,
    className,
}) => {
    return (
        <div className={cn('w-full', className)}>
            <div className="flex items-center justify-between">
                {label && (
                    <label className="text-sm font-medium text-zinc-300">{label}</label>
                )}
                <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    onClick={() => onChange(!checked)}
                    className={cn(
                        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
                        checked ? 'bg-violet-600' : 'bg-zinc-700'
                    )}
                >
                    <span
                        className={cn(
                            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transform ring-0 transition duration-200 ease-in-out',
                            checked ? 'translate-x-4' : 'translate-x-0'
                        )}
                    />
                </button>
            </div>
            {description && (
                <p className="text-xs text-zinc-500 mt-1">{description}</p>
            )}
        </div>
    )
}
