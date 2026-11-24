'use client'

import { LogOutIcon, MoreVerticalIcon } from 'lucide-react'
import { ReactElement } from 'react'

import { useLogout } from '../../libs/useLogout'

import { Button } from '@/components/ui/button'
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@/components/ui/menu'

export function OptionsMenu(): ReactElement {
  const handleLogout = useLogout()

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Open menu" />
        }
      >
        <MoreVerticalIcon aria-hidden="true" />
      </MenuTrigger>
      <MenuPopup align="end">
        <MenuItem onClick={handleLogout}>
          <LogOutIcon aria-hidden="true" />
          Sign Out
        </MenuItem>
      </MenuPopup>
    </Menu>
  )
}
