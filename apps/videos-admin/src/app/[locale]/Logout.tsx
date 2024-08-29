'use client'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { getFirebaseAuth } from '../../libs/auth/firebase'
import { logout } from '../api'

export function Logout(): ReactElement {
  const t = useTranslations()
  const router = useRouter()
  const handleLogout = async (): Promise<void> => {
    const auth = getFirebaseAuth()
    await signOut(auth)
    await logout()

    router.refresh()
  }
  return <button onClick={handleLogout}>{t('Sign Out')}</button>
}
