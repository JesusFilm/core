import Button from '@mui/material/Button'
import { ReactElement } from 'react'

interface SaveButtonProps {
  disabled?: boolean
  loading?: boolean
}

export function SaveButton({
  disabled = false,
  loading = false
}: SaveButtonProps): ReactElement {
  return (
    <Button
      variant="contained"
      size="small"
      color={disabled ? 'info' : 'secondary'}
      type="submit"
      disabled={disabled}
      loading={loading}
    >
      Save
    </Button>
  )
}
