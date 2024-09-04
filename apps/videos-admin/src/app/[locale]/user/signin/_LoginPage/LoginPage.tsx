'use client'

import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import {
  UserCredential,
  getRedirectResult,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { useTranslations } from 'next-intl'
import { ReactElement, useEffect, useState } from 'react'
import { useLoadingCallback } from 'react-loading-hook'

import {
  getFirebaseAuth,
  getGoogleProvider,
  loginWithProvider,
  loginWithProviderUsingRedirect
} from '../../../../../libs/auth/firebase'
import { useRedirectAfterLogin } from '../../../../../libs/auth/useRedirectAfterLogin'
import { useRedirectParam } from '../../../../../libs/auth/useRedirectParam'
import { loginWithCredential } from '../../../../api'

import { PasswordForm, PasswordFormValue } from './PasswordForm'

export function LoginPage(): ReactElement {
  const t = useTranslations()
  const [hasLogged, setHasLogged] = useState(false)
  const redirect = useRedirectParam()
  const redirectAfterLogin = useRedirectAfterLogin()

  async function handleLogin(credential: UserCredential): Promise<void> {
    await loginWithCredential(credential)
    redirectAfterLogin()
  }

  const [handleLoginWithEmailAndPassword, isEmailLoading, emailPasswordError] =
    useLoadingCallback(async ({ email, password }: PasswordFormValue) => {
      setHasLogged(false)

      const auth = getFirebaseAuth()
      await handleLogin(await signInWithEmailAndPassword(auth, email, password))

      setHasLogged(true)
    })

  const [handleLoginWithGoogle, isGoogleLoading, googleError] =
    useLoadingCallback(async () => {
      setHasLogged(false)

      const auth = getFirebaseAuth()
      await handleLogin(await loginWithProvider(auth, getGoogleProvider(auth)))

      setHasLogged(true)
    })

  const [
    handleLoginWithGoogleUsingRedirect,
    isGoogleUsingRedirectLoading,
    googleUsingRedirectError
  ] = useLoadingCallback(async () => {
    setHasLogged(false)

    const auth = getFirebaseAuth()
    await loginWithProviderUsingRedirect(auth, getGoogleProvider(auth))

    setHasLogged(true)
  })

  async function handleLoginWithRedirect(): Promise<void> {
    const auth = getFirebaseAuth()
    const credential = await getRedirectResult(auth)

    if (credential?.user != null) {
      await handleLogin(credential)

      setHasLogged(true)
    }
  }

  useEffect(() => {
    void handleLoginWithRedirect()
  }, [])

  return (
    <div>
      <Typography variant="h1">{t('Login')}</Typography>
      {hasLogged && (
        <div>
          {t('Redirecting to {redirect}', { redirect: redirect ?? '/' })}
        </div>
      )}
      {!hasLogged && (
        <PasswordForm
          loading={isEmailLoading}
          onSubmit={handleLoginWithEmailAndPassword}
          error={emailPasswordError ?? googleError ?? googleUsingRedirectError}
        >
          {process.env.NEXT_PUBLIC_VERCEL_ENV == null ? (
            <LoadingButton
              variant="outlined"
              loading={isGoogleLoading}
              disabled={isGoogleLoading}
              onClick={handleLoginWithGoogle}
            >
              {t('Log in with Google')}
            </LoadingButton>
          ) : (
            <LoadingButton
              loading={isGoogleUsingRedirectLoading}
              disabled={isGoogleUsingRedirectLoading}
              onClick={handleLoginWithGoogleUsingRedirect}
            >
              {t('Log in with Google')}
            </LoadingButton>
          )}
        </PasswordForm>
      )}
    </div>
  )
}
