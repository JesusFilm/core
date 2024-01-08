import Button from '@mui/material/Button'
import { FacebookAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { FacebookIcon } from '../../../../../../libs/shared/ui/src/components/icons/FacebookIcon'
import React from 'react'

export function FacebookButton(): ReactElement {
  const { t } = useTranslation()
  const router = useRouter()
  async function handleFacebookSignIn(): Promise<void> {
    const auth = getAuth()
    await signInWithPopup(auth, new FacebookAuthProvider())
    await router.push('/')
  }

  return (
    <Button
      variant="outlined"
      size="large"
      color="secondary"
      startIcon={<FacebookIcon />}
      onClick={handleFacebookSignIn}
      fullWidth
      data-testid="FacebookButton"
    >
      {t('Sign in with Facebook')}
    </Button>
  )
}
