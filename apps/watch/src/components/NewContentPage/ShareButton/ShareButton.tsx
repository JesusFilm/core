import LinkExternal from '@core/shared/ui/icons/LinkExternal'
import Button from '@mui/material/Button'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { ShareDialog } from '../../ShareDialog/ShareDialog'

export function ShareButton(): ReactElement {
  const [showShareDialog, setShowShareDialog] = useState(false)
  const { t } = useTranslation('apps-watch')

  return (
    <>
      <Button
        size="xsmall"
        startIcon={<LinkExternal sx={{ fontSize: 16 }} />}
        onClick={() => setShowShareDialog(true)}
        sx={{
          borderRadius: '64px',
          color: 'text.primary',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          bgcolor: 'white',
          '&:hover': {
            bgcolor: 'primary.main',
            color: 'common.white'
          },
          transition: 'colors 0.2s'
        }}
      >
        {t('Share')}
      </Button>
      <ShareDialog
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />
    </>
  )
}
