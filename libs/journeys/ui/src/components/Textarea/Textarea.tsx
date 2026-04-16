import {
  CSSProperties,
  ChangeEventHandler,
  KeyboardEventHandler,
  ReactElement,
  forwardRef
} from 'react'

interface TextareaProps {
  value?: string
  onChange?: ChangeEventHandler<HTMLTextAreaElement>
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>
  placeholder?: string
  disabled?: boolean
  rows?: number
  maxRows?: number
  style?: CSSProperties
  'aria-label'?: string
}

const baseStyles: CSSProperties = {
  width: '100%',
  resize: 'none',
  border: '1px solid #e0e0e0',
  borderRadius: 12,
  padding: '8px 12px',
  fontSize: 14,
  lineHeight: 1.5,
  fontFamily: 'inherit',
  outline: 'none',
  backgroundColor: '#f5f5f5',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      value,
      onChange,
      onKeyDown,
      placeholder,
      disabled = false,
      rows = 1,
      style,
      'aria-label': ariaLabel
    },
    ref
  ): ReactElement {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        aria-label={ariaLabel}
        style={{
          ...baseStyles,
          ...style,
          ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {})
        }}
      />
    )
  }
)
