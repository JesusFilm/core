'use client'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { UserCredential, signInWithEmailAndPassword } from 'firebase/auth'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { ReactElement, useCallback, useState } from 'react'
import { useLoadingCallback } from 'react-loading-hook'

import minimalLogo from '../../../assets/minimal-logo.png'
import { CenterPage } from '../../../components/CenterPage'
import { getFirebaseAuth, loginWithGoogle } from '../../../libs/auth/firebase'
import {
  getSignInErrorMessage,
  signInErrorParam
} from '../../../libs/auth/signInError'
import { useRedirectAfterLogin } from '../../../libs/auth/useRedirectAfterLogin'
import { loginWithCredential } from '../../api'

import { GoogleIcon } from './_GoogleIcon/GoogleIcon'
import { PasswordForm, PasswordFormValue } from './_PasswordForm'

export default function SignIn(): ReactElement {
  const [hasLogged, setHasLogged] = useState(false)
  const redirectAfterLogin = useRedirectAfterLogin()
  const searchParams = useSearchParams()
  const redirectedErrorMessage = getSignInErrorMessage(
    searchParams?.get(signInErrorParam) ?? null
  )

  const handleLogin = useCallback(
    async function (credential: UserCredential): Promise<void> {
      await loginWithCredential(credential)
      redirectAfterLogin()
    },
    [redirectAfterLogin]
  )

  const [
    handleLoginWithEmailAndPassword,
    isEmailLoading,
    emailPasswordError,
    resetEmailPasswordError
  ] = useLoadingCallback(async ({ email, password }: PasswordFormValue) => {
    setHasLogged(false)

    const auth = getFirebaseAuth()
    await handleLogin(await signInWithEmailAndPassword(auth, email, password))

    setHasLogged(true)
  })

  const [
    handleLoginWithGoogle,
    isGoogleLoading,
    googleError,
    resetGoogleError
  ] = useLoadingCallback(async () => {
    setHasLogged(false)

    const auth = getFirebaseAuth()
    await handleLogin(await loginWithGoogle(auth))

    setHasLogged(true)
  })

  // useLoadingCallback stores the error for display and also rethrows it;
  // swallow the rethrow so a failed login isn't an unhandled rejection.
  function handleEmailAndPasswordSubmit(value: PasswordFormValue): void {
    resetGoogleError()
    handleLoginWithEmailAndPassword(value).catch(() => undefined)
  }

  function handleGoogleClick(): void {
    resetEmailPasswordError()
    handleLoginWithGoogle().catch(() => undefined)
  }

  const loginError: Error | undefined = emailPasswordError ?? googleError

  return (
    <CenterPage>
      <Image
        src={minimalLogo}
        alt="Jesus Film Project"
        width={70}
        height={70}
      />
      {hasLogged && (
        <Box
          sx={{
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {!hasLogged && loginError == null && redirectedErrorMessage != null && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {redirectedErrorMessage}
        </Alert>
      )}
      {!hasLogged && (
        <PasswordForm
          loading={isEmailLoading}
          onSubmit={handleEmailAndPasswordSubmit}
          error={loginError}
        >
          <Button
            variant="outlined"
            loading={isGoogleLoading}
            disabled={isGoogleLoading}
            onClick={handleGoogleClick}
            startIcon={<GoogleIcon />}
            fullWidth
          >
            Sign in with Google
          </Button>
        </PasswordForm>
      )}
    </CenterPage>
  )
}
