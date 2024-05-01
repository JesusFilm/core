import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

export interface DownloadButtonProps {
  variant: 'button' | 'icon'
  onClick: () => void
}

export function DownloadButton({
  variant,
  onClick
}: DownloadButtonProps): ReactElement {
  const t = useTranslations('apps-watch')
  return variant === 'button' ? (
    <Button
      variant="outlined"
      startIcon={<FileDownloadOutlinedIcon />}
      size="medium"
      color="secondary"
      onClick={onClick}
      sx={{
        minWidth: '200px'
      }}
      data-testid="DownloadButton"
    >
      {t('Download')}
    </Button>
  ) : (
    <IconButton onClick={onClick}>
      <FileDownloadOutlinedIcon color="primary" />
    </IconButton>
  )
}
