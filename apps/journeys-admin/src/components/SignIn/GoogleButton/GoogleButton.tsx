import Button from '@mui/material/Button'
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import GoogleIcon from './GoogleIcon'

export function GoogleButton(): ReactElement {
  const { t } = useTranslation()
  const router = useRouter()
  async function handleGoogleSignIn(): Promise<void> {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(auth, provider)
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
    >
      {t('Sign in with Google')}
    </Button>
  )
}
