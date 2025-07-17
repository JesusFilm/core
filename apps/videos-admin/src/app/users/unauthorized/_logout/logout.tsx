'use client'

import Button from '@mui/material/Button'
import { ReactElement } from 'react'

import { useLogout } from '../../../../libs/useLogout'

export function Logout(): ReactElement {
  const handleLogout = useLogout()
  return (
    <Button variant="contained" fullWidth onClick={handleLogout}>
      Sign out
    </Button>
  )
}
