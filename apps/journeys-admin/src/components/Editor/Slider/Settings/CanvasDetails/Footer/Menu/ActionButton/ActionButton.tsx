import Button, { ButtonProps } from '@mui/material/Button'
import { ReactElement } from 'react'

interface ActionButtonProps extends ButtonProps {
  label: string
  handleClick: () => void
}

export function ActionButton({
  label,
  handleClick,
  ...props
}: ActionButtonProps): ReactElement {
  return (
    <Button {...props} variant="outlined" fullWidth onClick={handleClick}>
      {label}
    </Button>
  )
}
