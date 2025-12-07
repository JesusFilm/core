import Button from '@mui/material/Button'
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  getAuth,
  signInWithPopup
} from 'firebase/auth'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { FacebookIcon } from '@core/shared/ui/icons/FacebookIcon'
import { GoogleIcon } from '@core/shared/ui/icons/GoogleIcon'
import { OktaIcon } from '@core/shared/ui/icons/OktaIcon'

interface SignInServiceButtonProps {
  service: 'google.com' | 'facebook.com' | 'oidc.okta'
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
        : service === 'facebook.com'
          ? new FacebookAuthProvider()
          : new OAuthProvider('oidc.okta')
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
      startIcon={
        service === 'google.com' ? (
          <GoogleIcon />
        ) : service === 'facebook.com' ? (
          <FacebookIcon />
        ) : (
          <OktaIcon />
        )
      }
      onClick={handleSignIn}
      fullWidth
    >
      {t('Continue with {{service}}', {
        service:
          service === 'google.com'
            ? t('Google')
            : service === 'facebook.com'
              ? t('Facebook')
              : t('Okta')
      })}
    </Button>
  )
}
