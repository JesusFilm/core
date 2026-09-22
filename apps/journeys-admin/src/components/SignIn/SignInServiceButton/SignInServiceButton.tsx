import { useMutation } from '@apollo/client/react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { FirebaseError } from 'firebase/app'
import type { Auth, AuthProvider, OAuthCredential, User } from 'firebase/auth'
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  linkWithPopup,
  signInWithCredential,
  signInWithPopup,
  updateProfile
} from 'firebase/auth'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  async function linkAnonymousUserWithProvider(
    currentUser: User,
    authProvider: AuthProvider
  ): Promise<void> {
    const userCredential = await linkWithPopup(currentUser, authProvider)
    const user = userCredential.user
    // linkWithPopup does not promote the provider's displayName/photoURL onto
    // the top-level Firebase user, so the next ID token refresh would be
    // missing the name/picture claims. Copy them from providerData so the JWT
    // carries the profile. Best-effort: the server has a providerData fallback
    // in findOrFetchUser, so failures here shouldn't abort sign-in.
    try {
      const linkedProvider = user.providerData?.find(
        (p) => p.providerId === authProvider.providerId
      )
      const profileUpdates: { displayName?: string; photoURL?: string } = {}
      if (user.displayName == null && linkedProvider?.displayName != null) {
        profileUpdates.displayName = linkedProvider.displayName
      }
      if (user.photoURL == null && linkedProvider?.photoURL != null) {
        profileUpdates.photoURL = linkedProvider.photoURL
      }
      if (Object.keys(profileUpdates).length > 0) {
        await updateProfile(user, profileUpdates)
        await user.reload()
      }
    } catch (error) {
      console.warn('failed to promote provider profile after link', error)
    }
    // Force-refresh once so the new claims are in the token Apollo attaches to
    // journeyPublish and that /api/login exchanges for the session cookie.
    const idToken = await user.getIdToken(true)

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
      await login(idToken)
      const existingRedirect = router.query.redirect as string | undefined
      const redirectUrl =
        existingRedirect ?? `/templates/${pending.journeyId}/customize`
      window.location.href = `/users/sign-in?redirect=${encodeURIComponent(redirectUrl)}`
      return
    }

    await loginWithCredential(userCredential)
  }

  // Surfaced next to the button so a failed sign-in is visible to the user and
  // reportable to support. Without it every failure below re-renders this same
  // page with no feedback, which reads as an endless sign-in loop.
  function getErrorCode(err: unknown): string {
    const code = (err as { code?: string })?.code
    if (code != null) return code
    if (err instanceof Error) return err.message
    return 'unknown'
  }

  // Reached when the account behind the popup already exists. Signing in with
  // the credential lifted off the error completes what the link could not.
  async function signInWithRecoveredCredential(
    auth: Auth,
    oauthCredential: OAuthCredential
  ): Promise<void> {
    const userCredential = await signInWithCredential(auth, oauthCredential)
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
  }

  // Recovery is attempted here rather than in handleSignIn's catch: a throw
  // inside a catch block escapes it, so failures in the recovery path would
  // bypass the error handling entirely. Letting them propagate out of this
  // function keeps handleSignIn's catch the single sink for every failure.
  async function signInOrRecover(
    auth: Auth,
    authProvider: AuthProvider,
    currentUser: User | null
  ): Promise<void> {
    try {
      if (currentUser?.isAnonymous === true) {
        await linkAnonymousUserWithProvider(currentUser, authProvider)
        return
      }
      const credential = await signInWithPopup(auth, authProvider)
      await loginWithCredential(credential)
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string }
      if (firebaseErr.code !== 'auth/credential-already-in-use') throw err

      const oauthCredential = OAuthProvider.credentialFromError(
        err as FirebaseError
      )
      if (oauthCredential == null) throw err

      await signInWithRecoveredCredential(auth, oauthCredential)
    }
  }

  async function handleSignIn(): Promise<void> {
    if (isSubmitting) return
    setIsSubmitting(true)
    setErrorCode(null)
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
      await signInOrRecover(auth, authProvider, currentUser)
    } catch (err: unknown) {
      console.error(err)
      setErrorCode(getErrorCode(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Stack spacing={2}>
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
        disabled={isSubmitting}
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
      {errorCode != null && (
        <Alert severity="error" data-testid="SignInServiceButtonError">
          {`${t('Something went wrong, please try again!')} (${errorCode})`}
        </Alert>
      )}
    </Stack>
  )
}
