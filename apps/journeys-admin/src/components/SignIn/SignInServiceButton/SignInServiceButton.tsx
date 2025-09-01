import Button from '@mui/material/Button'
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup
} from 'firebase/auth'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { GoogleIcon } from '@core/shared/ui/icons/GoogleIcon'

interface SignInServiceButtonProps {
  service: 'google.com'
}

export function SignInServiceButton({
  service
}: SignInServiceButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  async function handleSignIn(): Promise<void> {
    const auth = getAuth()
    const authProvider = new GoogleAuthProvider()
    authProvider.setCustomParameters({ prompt: 'select_account' })
    try {
      await signInWithPopup(auth, authProvider)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Button
      variant="outlined"
      size="large"
      color="secondary"
      startIcon={<GoogleIcon />}
      onClick={handleSignIn}
      fullWidth
    >
      {t('Continue with {{service}}', {
        service: t('Google')
      })}
    </Button>
  )
}
