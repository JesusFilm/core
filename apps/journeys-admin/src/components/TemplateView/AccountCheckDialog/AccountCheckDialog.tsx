import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

interface AccountCheckDialogProps {
  open: boolean
  onClose: () => void
  handleSignIn: (create: boolean) => void
}

export function AccountCheckDialog({
  open,
  onClose,
  handleSignIn
}: AccountCheckDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Dialog open={open} onClose={onClose}>
      <Stack spacing={2} p={4} sx={{ alignItems: 'center' }}>
        <Typography>
          {t('To use this template you need to have a registered account.')}
        </Typography>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ justifyContent: 'center' }}
        >
          <Button onClick={() => handleSignIn(false)}>{t('Log in')}</Button>
          <Button onClick={() => handleSignIn(true)}>
            {t('Create an account')}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  )
}
