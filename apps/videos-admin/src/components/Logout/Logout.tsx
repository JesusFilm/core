'use client'

import Button from '@mui/material/Button'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { logout } from '../../app/api'
import { getFirebaseAuth } from '../../libs/auth/firebase'

export function Logout(): ReactElement {
  const t = useTranslations()
  const router = useRouter()
  const handleLogout = async (): Promise<void> => {
    const auth = getFirebaseAuth()
    await signOut(auth)
    await logout()

    router.push('/user/sign-in')
  }
  return (
    <Button variant="contained" fullWidth onClick={handleLogout}>
      {t('Sign out')}
    </Button>
  )
}
