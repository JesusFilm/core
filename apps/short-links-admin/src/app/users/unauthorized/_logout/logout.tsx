'use client'

import { ReactElement } from 'react'

import { useLogout } from '../../../../libs/useLogout'

import { Button } from '@/components/ui/button'

export function Logout(): ReactElement {
  const handleLogout = useLogout()
  return (
    <Button onClick={handleLogout} className="w-full">
      Sign out
    </Button>
  )
}
