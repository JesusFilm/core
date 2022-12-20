import { ReactElement } from 'react'
import Button from '@mui/material/Button'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import IconButton from '@mui/material/IconButton'

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
      onClick={openDialog}
      sx={{
        display: { xs: 'none', sm: 'flex' },
        px: 12
      }}
    >
      Share
    </Button>
  ) : (
    <IconButton onClick={openDialog}>
      <ShareOutlinedIcon color="primary" />
    </IconButton>
  )
}
