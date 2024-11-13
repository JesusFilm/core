'use client'

import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { UserCredential, signInWithEmailAndPassword } from 'firebase/auth'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ReactElement, useCallback, useState } from 'react'
import { useLoadingCallback } from 'react-loading-hook'

import minimalLogo from '../../../../../assets/minimal-logo.png'
import { CenterPage } from '../../../../../components/CenterPage'
import {
  getFirebaseAuth,
  loginWithGoogle
} from '../../../../../libs/auth/firebase'
import { useRedirectAfterLogin } from '../../../../../libs/auth/useRedirectAfterLogin'
import { loginWithCredential } from '../../../../api'

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
      await handleLogin(await loginWithGoogle(auth))

      setHasLogged(true)
    })

  return (
    <CenterPage>
      <Image
        src={minimalLogo}
        alt={t('Jesus Film Project')}
        width={70}
        height={70}
      />
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
          error={emailPasswordError ?? googleError}
        >
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
        </PasswordForm>
      )}
    </CenterPage>
  )
}
