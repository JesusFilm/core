import Button from '@mui/material/Button'
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/router'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { GoogleIcon } from '../../../../../../libs/shared/ui/src/components/icons/GoogleIcon'

export function GoogleButton(): ReactElement {
  const { t } = useTranslation()
  const router = useRouter()
  async function handleGoogleSignIn(): Promise<void> {
    const auth = getAuth()
    await signInWithPopup(auth, new GoogleAuthProvider())
    await router.push('/')
  }

  return (
    <Button
      variant="outlined"
      size="large"
      color="secondary"
      startIcon={<GoogleIcon />}
      onClick={handleGoogleSignIn}
      fullWidth
      data-testid="GoogleButton"
    >
      {t('Sign in with Google')}
    </Button>
  )
}
