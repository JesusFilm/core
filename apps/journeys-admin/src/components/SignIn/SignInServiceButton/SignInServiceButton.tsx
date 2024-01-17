import Button from '@mui/material/Button'
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup
} from 'firebase/auth'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { FacebookIcon } from '@core/shared/ui/icons/FacebookIcon'
import { GoogleIcon } from '@core/shared/ui/icons/GoogleIcon'

interface SignInServiceButtonProps {
  variant?: 'Facebook' | 'Google'
}

export function SignInServiceButton({
  variant
}: SignInServiceButtonProps): ReactElement {
  const { t } = useTranslation()
  const router = useRouter()
  async function handleSignIn(): Promise<void> {
    const auth = getAuth()
    const authProvider =
      variant === 'Google'
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider()
    authProvider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(auth, authProvider)
    await router.push('/')
  }

  return (
    <Button
      variant="outlined"
      size="large"
      color="secondary"
      startIcon={variant === 'Facebook' ? <FacebookIcon /> : <GoogleIcon />}
      onClick={handleSignIn}
      fullWidth
    >
      {t(`Sign in with ${variant === 'Facebook' ? 'Facebook' : 'Google'}`)}
    </Button>
  )
}
