import Button from '@mui/material/Button'
import { MouseEvent, ReactElement, ReactNode } from 'react'

export interface BarButtonProps {
  label: string
  icon: ReactNode
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  /** Set while the control's menu or popover is open. */
  active?: boolean
}

/** One control of the contextual bottom bar. */
export function BarButton({
  label,
  icon,
  onClick,
  disabled = false,
  active = false
}: BarButtonProps): ReactElement {
  return (
    <Button
      variant="outlined"
      color="secondary"
      startIcon={icon}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active ? true : undefined}
    >
      {label}
    </Button>
  )
}
