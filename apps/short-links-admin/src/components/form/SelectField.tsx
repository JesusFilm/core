'use client'

import { ReactElement, ReactNode } from 'react'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field'
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  id: string
  name?: string
  label: ReactNode
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  error?: string
  helperText?: ReactNode
  disabled?: boolean
  required?: boolean
  placeholder?: string
  className?: string
  size?: 'sm' | 'default'
}

/**
 * A single-value select bound to a string. Callers map non-string values
 * (numbers, enums) to strings at the boundary.
 */
export function SelectField({
  id,
  name,
  label,
  value,
  onValueChange,
  options,
  error,
  helperText,
  disabled,
  required,
  placeholder,
  className,
  size = 'default'
}: SelectFieldProps): ReactElement {
  function handleValueChange(next: string | null): void {
    onValueChange(next ?? '')
  }

  return (
    <Field
      name={name ?? id}
      invalid={error != null}
      disabled={disabled}
      className={className}
    >
      <FieldLabel>{label}</FieldLabel>
      <Select
        items={options}
        value={value}
        onValueChange={handleValueChange}
        required={required}
        disabled={disabled}
      >
        <SelectTrigger id={id} size={size} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectPopup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
      {error != null ? (
        <FieldError match>{error}</FieldError>
      ) : (
        helperText != null && <FieldDescription>{helperText}</FieldDescription>
      )}
    </Field>
  )
}
