import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

export interface ShareButtonProps {
  variant: 'button' | 'icon'
  onClick: () => void
}

export function ShareButton({
  variant,
  onClick
}: ShareButtonProps): ReactElement {
  return variant === 'button' ? (
    <Button
      variant="outlined"
      startIcon={<ShareOutlinedIcon />}
      size="medium"
      color="secondary"
      onClick={onClick}
      data-testid="share"
      sx={{
        minWidth: '200px'
      }}
    >
      Share
    </Button>
  ) : (
    <IconButton onClick={onClick}>
      <ShareOutlinedIcon color="primary" />
    </IconButton>
  )
}
