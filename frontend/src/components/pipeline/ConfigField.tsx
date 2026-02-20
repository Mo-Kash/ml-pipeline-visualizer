import * as React from 'react'
import { type NodeProperty } from '../../types/nodeTypes'
import { SliderInput } from '../ui/SliderInput'
import { ToggleSwitch } from '../ui/ToggleSwitch'
import { MultiSelectField } from '../ui/MultiSelectField'
import { TagsInput } from '../ui/TagsInput'

interface ConfigFieldProps {
    property: NodeProperty
    value: any
    allValues: Record<string, any>
    onChange: (key: string, value: any) => void
}

export const ConfigField: React.FC<ConfigFieldProps> = ({
    property,
    value,
    allValues,
    onChange,
}) => {
    // Handle conditional visibility
    if (property.dependsOn) {
        const depValue = allValues[property.dependsOn.key]
        const expected = property.dependsOn.value
        const visible = Array.isArray(expected)
            ? expected.includes(depValue)
            : depValue === expected
        if (!visible) return null
    }

    const fieldId = `config-field-${property.key}`

    const labelEl = (
        <label
            htmlFor={fieldId}
            className="block text-sm font-medium text-zinc-300 mb-1.5"
        >
            {property.label}
            {property.required && <span className="text-red-400 ml-1">*</span>}
        </label>
    )

    const descEl = property.description && (
        <p className="text-xs text-zinc-500 mt-1">{property.description}</p>
    )

    switch (property.type) {
        case 'select':
            return (
                <div>
                    {labelEl}
                    <select
                        id={fieldId}
                        value={value ?? property.defaultValue}
                        onChange={(e) => onChange(property.key, e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    >
                        {property.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {descEl}
                </div>
            )

        case 'multiselect':
            return (
                <MultiSelectField
                    label={property.label}
                    options={property.options ?? []}
                    value={Array.isArray(value) ? value : (property.defaultValue ?? [])}
                    onChange={(v) => onChange(property.key, v)}
                    description={property.description}
                />
            )

        case 'boolean':
            return (
                <ToggleSwitch
                    label={property.label}
                    checked={value ?? property.defaultValue ?? false}
                    onChange={(v) => onChange(property.key, v)}
                    description={property.description}
                />
            )

        case 'slider':
            return (
                <SliderInput
                    label={property.label}
                    value={value ?? property.defaultValue ?? property.min ?? 0}
                    onChange={(v) => onChange(property.key, v)}
                    min={property.min ?? 0}
                    max={property.max ?? 100}
                    step={property.step ?? 1}
                    description={property.description}
                />
            )

        case 'number':
            return (
                <div>
                    {labelEl}
                    <input
                        id={fieldId}
                        type="number"
                        value={value ?? property.defaultValue ?? ''}
                        min={property.min}
                        max={property.max}
                        step={property.step ?? 1}
                        placeholder={property.placeholder}
                        onChange={(e) => onChange(property.key, Number(e.target.value))}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    />
                    {descEl}
                </div>
            )

        case 'textarea':
            return (
                <div>
                    {labelEl}
                    <textarea
                        id={fieldId}
                        value={value ?? property.defaultValue ?? ''}
                        placeholder={property.placeholder}
                        rows={3}
                        onChange={(e) => onChange(property.key, e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none"
                    />
                    {descEl}
                </div>
            )

        case 'tags':
            return (
                <TagsInput
                    label={property.label}
                    value={Array.isArray(value) ? value : (property.defaultValue ?? [])}
                    onChange={(v) => onChange(property.key, v)}
                    placeholder={property.placeholder}
                    description={property.description}
                />
            )

        case 'text':
        default:
            return (
                <div>
                    {labelEl}
                    <input
                        id={fieldId}
                        type="text"
                        value={value ?? property.defaultValue ?? ''}
                        placeholder={property.placeholder}
                        onChange={(e) => onChange(property.key, e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    />
                    {descEl}
                </div>
            )
    }
}
