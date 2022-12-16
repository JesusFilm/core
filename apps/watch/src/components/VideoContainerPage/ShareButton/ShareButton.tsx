import { ReactElement } from 'react'
import Button from '@mui/material/Button'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'

export interface ShareButtonProps {
  variant: 'button' | 'icon'
  openDialog: () => void
}

export function ShareButton({
  variant,
  openDialog
}: ShareButtonProps): ReactElement {
  return variant === 'button' ? (
    <Button
      variant="outlined"
      startIcon={<ShareOutlinedIcon />}
      size="medium"
      color="secondary"
      aria-label="share-button"
      onClick={() => openDialog()}
      sx={{
        minWidth: '200px'
      }}
    >
      Share
    </Button>
  ) : (
    <Button onClick={() => openDialog()} aria-label="share-icon">
      <ShareOutlinedIcon color="primary" />
    </Button>
  )
}
