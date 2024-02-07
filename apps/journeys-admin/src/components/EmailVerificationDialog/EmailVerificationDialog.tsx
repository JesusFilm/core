import Button from '@mui/material/Button'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetMe_me as ApiUser } from '../../../__generated__/GetMe'

interface EmailVerificationDialogProps {
  apiUser: ApiUser
}

export function EmailVerificationDialog({
  apiUser
}: EmailVerificationDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  return (
    <Dialog
      open={apiUser.emailVerified === false}
      onClose={onClose}
      dialogTitle={{
        title: t('Please verify your email'),
        closeButton: true
      }}
      fullscreen={!smUp}
      testId="EmailVerificationDialog"
    >
      <>
        <Typography>
          {t('You need to verify your email before you can continue.')}
        </Typography>
        <Button variant="contained" color="primary" onClick={onClose}>
          {t('Send verification email')}
        </Button>
      </>
    </Dialog>
  )
}
