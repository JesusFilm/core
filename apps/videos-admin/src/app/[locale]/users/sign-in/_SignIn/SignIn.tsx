'use client'

import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  UserCredential,
  getRedirectResult,
  signInWithEmailAndPassword
} from 'firebase/auth'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useLoadingCallback } from 'react-loading-hook'

import minimalLogo from '../../../../../assets/minimal-logo.png'
import { CenterPage } from '../../../../../components/CenterPage'
import { getFirebaseAuth } from '../../../../../libs/auth/firebase'
import { useRedirectAfterLogin } from '../../../../../libs/auth/useRedirectAfterLogin'
import { loginWithCredential } from '../../../../api'

import {
  getGoogleProvider,
  loginWithProvider,
  loginWithProviderUsingRedirect
} from './firebase'
import { GoogleIcon } from './GoogleIcon'
import { PasswordForm, PasswordFormValue } from './PasswordForm'

export function SignIn(): ReactElement {
  const t = useTranslations()
  const [hasLogged, setHasLogged] = useState(false)
  const redirectAfterLogin = useRedirectAfterLogin()

  const handleLogin = useCallback(
    async function (credential: UserCredential): Promise<void> {
      await loginWithCredential(credential)
      redirectAfterLogin()
    },
    [redirectAfterLogin]
  )

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

  const handleLoginWithRedirect = useCallback(
    async function (): Promise<void> {
      const auth = getFirebaseAuth()
      const credential = await getRedirectResult(auth)

      if (credential?.user != null) {
        await handleLogin(credential)

        setHasLogged(true)
      }
    },
    [handleLogin]
  )

  useEffect(() => {
    void handleLoginWithRedirect()
  }, [handleLoginWithRedirect])

  return (
    <CenterPage>
      <Stack direction="row" alignItems="center" gap={2}>
        <Image
          src={minimalLogo}
          alt={t('Jesus Film Project')}
          width={70}
          height={70}
        />
        <Typography
          component="h1"
          variant="h4"
          sx={{ fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          {t('Nexus')}
        </Typography>
      </Stack>
      {hasLogged && (
        <Box
          height={300}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress />
        </Box>
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
              startIcon={<GoogleIcon />}
              fullWidth
            >
              {t('Sign in with Google')}
            </LoadingButton>
          ) : (
            <LoadingButton
              loading={isGoogleUsingRedirectLoading}
              disabled={isGoogleUsingRedirectLoading}
              onClick={handleLoginWithGoogleUsingRedirect}
              startIcon={<GoogleIcon />}
              fullWidth
            >
              {t('Sign in with Google')}
            </LoadingButton>
          )}
        </PasswordForm>
      )}
    </CenterPage>
  )
}
