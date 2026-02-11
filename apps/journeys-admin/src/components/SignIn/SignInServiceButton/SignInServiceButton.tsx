import Button from '@mui/material/Button'
import { useMutation } from '@apollo/client'
import type { AuthProvider, User } from 'firebase/auth'
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  getAuth,
  linkWithPopup,
  signInWithPopup
} from 'firebase/auth'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { FacebookIcon } from '@core/shared/ui/icons/FacebookIcon'
import { GoogleIcon } from '@core/shared/ui/icons/GoogleIcon'
import { OktaIcon } from '@core/shared/ui/icons/OktaIcon'
import { UPDATE_ME } from '../RegisterPage/RegisterPage'

interface SignInServiceButtonProps {
  service: 'google.com' | 'facebook.com' | 'oidc.okta'
}

export function SignInServiceButton({
  service
}: SignInServiceButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [updateMe] = useMutation(UPDATE_ME)

  async function linkAnonymousUserWithProvider(
    currentUser: User,
    authProvider: AuthProvider
  ): Promise<void> {
    const userCredential = await linkWithPopup(currentUser, authProvider)
    const user = userCredential.user
    const displayName = user.displayName ?? ''
    const email = user.email?.trim().toLowerCase()
    if (email == null) return

    const nameParts = displayName.trim().split(/\s+/).filter(Boolean)
    const firstName = nameParts[0] ?? displayName.trim()
    const lastName =
      nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined
    await updateMe({
      variables: {
        input: {
          firstName,
          lastName,
          email
        }
      }
    })
  }

  async function handleSignIn(): Promise<void> {
    const auth = getAuth()
    const currentUser = auth.currentUser
    const authProvider =
      service === 'google.com'
        ? new GoogleAuthProvider()
        : service === 'facebook.com'
          ? new FacebookAuthProvider()
          : new OAuthProvider('oidc.okta')
    authProvider.setCustomParameters({ prompt: 'select_account' })

    try {
      if (currentUser?.isAnonymous === true) {
        await linkAnonymousUserWithProvider(currentUser, authProvider)
      } else {
        await signInWithPopup(auth, authProvider)
      }
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
