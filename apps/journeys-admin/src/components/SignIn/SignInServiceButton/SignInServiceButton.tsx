import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import { FirebaseError } from 'firebase/app'
import type { AuthProvider, User } from 'firebase/auth'
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  linkWithPopup,
  signInWithCredential,
  signInWithPopup
} from 'firebase/auth'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { FacebookIcon } from '@core/shared/ui/icons/FacebookIcon'
import { GoogleIcon } from '@core/shared/ui/icons/GoogleIcon'
import { OktaIcon } from '@core/shared/ui/icons/OktaIcon'

import { getFirebaseAuth, login, loginWithCredential } from '../../../libs/auth'
import { getPendingGuestJourney } from '../../../libs/pendingGuestJourney'
import { JOURNEY_PUBLISH } from '../RegisterPage/RegisterPage'
import { getJourneyIdFromRedirect } from '../utils'

interface SignInServiceButtonProps {
  service: 'google.com' | 'facebook.com' | 'oidc.okta'
}

export function SignInServiceButton({
  service
}: SignInServiceButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const [journeyPublish] = useMutation(JOURNEY_PUBLISH)

  async function linkAnonymousUserWithProvider(
    currentUser: User,
    authProvider: AuthProvider
  ): Promise<void> {
    const userCredential = await linkWithPopup(currentUser, authProvider)
    const user = userCredential.user
    const email = user.email?.trim().toLowerCase()
    if (email == null) return

    const journeyId = getJourneyIdFromRedirect(
      router.query.redirect as string | undefined
    )
    if (journeyId != null) {
      await journeyPublish({ variables: { id: journeyId } })
    }

    const pending = getPendingGuestJourney()
    if (pending != null) {
      const idToken = await user.getIdToken(true)
      await login(idToken)
      const existingRedirect = router.query.redirect as string | undefined
      const redirectUrl =
        existingRedirect ?? `/templates/${pending.journeyId}/customize`
      window.location.href = `/users/sign-in?redirect=${encodeURIComponent(redirectUrl)}`
      return
    }

    await loginWithCredential(userCredential)
  }

  async function handleSignIn(): Promise<void> {
    const auth = getFirebaseAuth()
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
        const credential = await signInWithPopup(auth, authProvider)
        await loginWithCredential(credential)
      }
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string }
      if (firebaseErr.code === 'auth/credential-already-in-use') {
        const oauthCredential = OAuthProvider.credentialFromError(
          err as FirebaseError
        )
        if (oauthCredential != null) {
          const userCredential = await signInWithCredential(
            auth,
            oauthCredential
          )
          const idToken = await userCredential.user.getIdToken()
          await login(idToken)

          const pending = getPendingGuestJourney()
          if (pending != null) {
            const existingRedirect = router.query.redirect as string | undefined
            const redirectUrl =
              existingRedirect ?? `/templates/${pending.journeyId}/customize`
            window.location.href = `/users/sign-in?redirect=${encodeURIComponent(redirectUrl)}`
            return
          }

          window.location.reload()
          return
        }
      }
      console.error(err)
    }
  }

  return (
    <Button
      variant="blockOutlined"
      color="solid"
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
