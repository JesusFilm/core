import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

import { useTranslation } from '../../libs/il8n/client'

export interface ShareButtonProps {
  variant: 'button' | 'icon'
  onClick: () => void
  languageId: string
}

export function ShareButton({
  variant,
  onClick,
  languageId
}: ShareButtonProps): ReactElement {
  const { t } = useTranslation(languageId, 'apps-watch')
  return variant === 'button' ? (
    <Button
      variant="outlined"
      startIcon={<ShareOutlinedIcon />}
      size="medium"
      color="secondary"
      onClick={onClick}
      sx={{
        minWidth: '200px'
      }}
      data-testid="ShareButton"
    >
      {t('Share')}
    </Button>
  ) : (
    <IconButton onClick={onClick}>
      <ShareOutlinedIcon color="primary" />
    </IconButton>
  )
}
