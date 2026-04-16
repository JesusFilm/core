import {
  ButtonHTMLAttributes,
  CSSProperties,
  ReactElement,
  ReactNode,
  forwardRef
} from 'react'

type SimpleButtonVariant = 'primary' | 'secondary' | 'ghost'
type SimpleButtonSize = 'sm' | 'md' | 'lg'

interface SimpleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SimpleButtonVariant
  size?: SimpleButtonSize
  children: ReactNode
}

const sizeStyles: Record<SimpleButtonSize, CSSProperties> = {
  sm: { padding: '4px 8px', fontSize: 12 },
  md: { padding: '8px 16px', fontSize: 14 },
  lg: { padding: '12px 24px', fontSize: 16 }
}

const variantStyles: Record<SimpleButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: '#6D28D9',
    color: 'white',
    border: 'none'
  },
  secondary: {
    backgroundColor: 'transparent',
    color: '#6D28D9',
    border: '1px solid #6D28D9'
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#666',
    border: 'none'
  }
}

export const SimpleButton = forwardRef<HTMLButtonElement, SimpleButtonProps>(
  function SimpleButton(
    { variant = 'ghost', size = 'md', children, style, disabled, ...props },
    ref
  ): ReactElement {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          borderRadius: 8,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          fontWeight: 500,
          transition: 'opacity 0.2s',
          outline: 'none',
          ...sizeStyles[size],
          ...variantStyles[variant],
          ...(disabled ? { opacity: 0.5 } : {}),
          ...style
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)
