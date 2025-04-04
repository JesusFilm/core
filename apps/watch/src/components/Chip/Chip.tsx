import { ReactElement } from 'react'
import clsx from 'clsx'

export interface ChipProps {
  label: string
  variant?: 'filled' | 'outlined'
  onClick?: () => void
  className?: string
}

export function Chip({
  label,
  variant = 'outlined',
  onClick,
  className
}: ChipProps): ReactElement {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
        variant === 'filled'
          ? 'bg-white/10 text-white hover:bg-white/20'
          : 'border border-white/30 text-white hover:bg-white/10',
        className
      )}
      type="button"
      role="button"
      tabIndex={0}
      aria-label={label}
    >
      {label}
    </button>
  )
}
