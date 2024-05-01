import Button from '@mui/material/Button'
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup
} from 'firebase/auth'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { FacebookIcon } from '@core/shared/ui/icons/FacebookIcon'
import { GoogleIcon } from '@core/shared/ui/icons/GoogleIcon'

interface SignInServiceButtonProps {
  service: 'google.com' | 'facebook.com'
}

export function SignInServiceButton({
  service
}: SignInServiceButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  async function handleSignIn(): Promise<void> {
    const auth = getAuth()
    const authProvider =
      service === 'google.com'
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider()
    authProvider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(auth, authProvider).catch(console.error)
  }

  return (
    <Button
      variant="outlined"
      size="large"
      color="secondary"
      startIcon={service === 'google.com' ? <GoogleIcon /> : <FacebookIcon />}
      onClick={handleSignIn}
      fullWidth
    >
      {t('Continue with {{service}}', {
        service: service === 'google.com' ? t('Google') : t('Facebook')
      })}
    </Button>
  )
}
