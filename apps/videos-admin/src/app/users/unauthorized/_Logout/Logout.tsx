'use client'

import Button from '@mui/material/Button'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { useLogout } from '../../../../../libs/useLogout'

export function Logout(): ReactElement {
  const t = useTranslations()
  const handleLogout = useLogout()
  return (
    <Button variant="contained" fullWidth onClick={handleLogout}>
      {t('Sign out')}
    </Button>
  )
}
