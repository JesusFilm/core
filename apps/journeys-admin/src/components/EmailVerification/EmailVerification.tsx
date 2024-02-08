import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'

import { CreateVerificationRequest } from '../../../__generated__/CreateVerificationRequest'
import { GetMe_me as ApiUser } from '../../../__generated__/GetMe'

interface EmailVerificationDialogProps {
  apiUser: ApiUser
}

export const CREATE_VERIFICATION_REQUEST = gql`
  mutation CreateVerificationRequest {
    createVerificationRequest
  }
`

export function EmailVerification({
  apiUser
}: EmailVerificationDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [createVerificationRequest, { error }] =
    useMutation<CreateVerificationRequest>(CREATE_VERIFICATION_REQUEST)
  const onSendverificationEmail = async (): Promise<void> => {
    setButtonDisabled(true)
    await createVerificationRequest()
    setTimeout(() => {
      setButtonDisabled(false)
    }, 3000)
  }
  return (
    <Dialog
      open={!apiUser.emailVerified}
      // onClose={onClose}
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
        <Typography>{error?.message}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onSendverificationEmail}
          disabled={buttonDisabled}
        >
          {t('Send verification email')}
        </Button>
      </>
    </Dialog>
  )
}
