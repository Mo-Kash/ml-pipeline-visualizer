import * as React from 'react'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

interface TagsInputProps {
    label?: string
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    description?: string
    className?: string
}

export const TagsInput: React.FC<TagsInputProps> = ({
    label,
    value,
    onChange,
    placeholder = 'Type and press Enter...',
    description,
    className,
}) => {
    const [inputValue, setInputValue] = React.useState('')

    const addTag = (tag: string) => {
        const trimmed = tag.trim()
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed])
        }
        setInputValue('')
    }

    const removeTag = (tag: string) => {
        onChange(value.filter((v) => v !== tag))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag(inputValue)
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value[value.length - 1])
        }
    }

    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-zinc-300 mb-2">{label}</label>
            )}
            <div className="min-h-9.5 flex flex-wrap gap-1.5 items-center px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500 transition-colors">
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-600/20 border border-violet-500/40 text-violet-300 text-xs rounded"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-white transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => inputValue && addTag(inputValue)}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-20 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 outline-none"
                />
            </div>
            {description && (
                <p className="text-xs text-zinc-500 mt-1">{description}</p>
            )}
        </div>
    )
}
