'use client'

import { ReactElement, ReactNode } from 'react'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

interface SwitchFieldProps {
  id: string
  name?: string
  label: ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  error?: string
  helperText?: ReactNode
  disabled?: boolean
  className?: string
}

export function SwitchField({
  id,
  name,
  label,
  checked,
  onCheckedChange,
  error,
  helperText,
  disabled,
  className
}: SwitchFieldProps): ReactElement {
  return (
    <Field
      name={name ?? id}
      invalid={error != null}
      disabled={disabled}
      className={className}
    >
      <FieldLabel>
        <Switch
          id={id}
          name={name ?? id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
        {label}
      </FieldLabel>
      {error != null ? (
        <FieldError match>{error}</FieldError>
      ) : (
        helperText != null && <FieldDescription>{helperText}</FieldDescription>
      )}
    </Field>
  )
}
