import { ReactElement } from 'react'
import Button from '@mui/material/Button'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import IconButton from '@mui/material/IconButton'

export interface DownloadButtonProps {
  variant: 'button' | 'icon'
  openDialog: () => void
}

export function DownloadButton({
  variant,
  openDialog
}: DownloadButtonProps): ReactElement {
  return variant === 'button' ? (
    <Button
      variant="outlined"
      startIcon={<FileDownloadOutlinedIcon />}
      size="medium"
      color="secondary"
      onClick={openDialog}
      sx={{
        display: { xs: 'none', sm: 'flex' },
        px: 12
      }}
    >
      Download
    </Button>
  ) : (
    <IconButton onClick={openDialog}>
      <FileDownloadOutlinedIcon color="primary" />
    </IconButton>
  )
}
