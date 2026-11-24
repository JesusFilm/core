'use client'

import { ChangeEvent, FocusEvent, ReactElement, ReactNode } from 'react'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface BaseFieldProps {
  id: string
  name?: string
  label: ReactNode
  error?: string
  helperText?: ReactNode
  disabled?: boolean
  required?: boolean
  className?: string
}

interface TextFieldProps extends BaseFieldProps {
  value: string | number
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
  readOnly?: boolean
  autoComplete?: string
  autoFocus?: boolean
}

export function TextField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled,
  required,
  type = 'text',
  placeholder,
  readOnly,
  autoComplete,
  autoFocus,
  className
}: TextFieldProps): ReactElement {
  return (
    <Field
      name={name ?? id}
      invalid={error != null}
      disabled={disabled}
      className={className}
    >
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        name={name ?? id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className="w-full"
      />
      {error != null ? (
        <FieldError match>{error}</FieldError>
      ) : (
        helperText != null && <FieldDescription>{helperText}</FieldDescription>
      )}
    </Field>
  )
}

interface TextareaFieldProps extends BaseFieldProps {
  value: string
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void
  rows?: number
  placeholder?: string
}

export function TextareaField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled,
  required,
  rows = 2,
  placeholder,
  className
}: TextareaFieldProps): ReactElement {
  return (
    <Field
      name={name ?? id}
      invalid={error != null}
      disabled={disabled}
      className={className}
    >
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        name={name ?? id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className="w-full"
      />
      {error != null ? (
        <FieldError match>{error}</FieldError>
      ) : (
        helperText != null && <FieldDescription>{helperText}</FieldDescription>
      )}
    </Field>
  )
}
