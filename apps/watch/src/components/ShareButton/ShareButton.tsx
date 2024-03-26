import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

export interface ShareButtonProps {
  variant: 'button' | 'icon'
  onClick: () => void
}

export function ShareButton({
  variant,
  onClick
}: ShareButtonProps): ReactElement {
  const { t } = useTranslation('apps-watch')
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
