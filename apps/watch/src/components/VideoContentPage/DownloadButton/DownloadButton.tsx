import { ReactElement } from 'react'
import Button from '@mui/material/Button'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import IconButton from '@mui/material/IconButton'

export interface DownloadButtonProps {
  variant: 'button' | 'icon'
  onClick: () => void
}

export function DownloadButton({
  variant,
  onClick
}: DownloadButtonProps): ReactElement {
  return variant === 'button' ? (
    <Button
      variant="outlined"
      startIcon={<FileDownloadOutlinedIcon />}
      size="medium"
      color="secondary"
      onClick={onClick}
      data-testid="download"
      sx={{
        minWidth: '200px'
      }}
    >
      Download
    </Button>
  ) : (
    <IconButton onClick={onClick}>
      <FileDownloadOutlinedIcon color="primary" />
    </IconButton>
  )
}
