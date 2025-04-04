import Button from '@mui/material/Button'
import { ReactElement } from 'react'

interface SaveButtonProps {
  disabled?: boolean
}

export function SaveButton({
  disabled = false
}: SaveButtonProps): ReactElement {
  return (
    <Button
      variant="contained"
      size="small"
      color={disabled ? 'info' : 'secondary'}
      type="submit"
      disabled={disabled}
    >
      Save
    </Button>
  )
}
