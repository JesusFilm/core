import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

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
