import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

import { useTranslation } from '../../../libs/il8n/client'

export interface DownloadButtonProps {
  variant: 'button' | 'icon'
  onClick: () => void
  languageId: string
}

export function DownloadButton({
  variant,
  onClick,
  languageId
}: DownloadButtonProps): ReactElement {
  const { t } = useTranslation(languageId, 'apps-watch')
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
