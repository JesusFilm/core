'use client'

import { LogOutIcon, MenuIcon } from 'lucide-react'
import Image from 'next/image'
import { ReactElement, useState } from 'react'

import minimalLogo from '../../../assets/minimal-logo.png'
import { MenuContent } from '../../../components/MenuContent'
import { useAuth } from '../../../libs/auth/authContext'
import { useLogout } from '../../../libs/useLogout'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle
} from '@/components/ui/sheet'

interface AppNavbarProps {
  topOffset: number
}

export function AppNavbar({ topOffset }: AppNavbarProps): ReactElement {
  const [open, setOpen] = useState(false)
  const auth = useAuth()
  const handleLogout = useLogout()

  function handleOpen(): void {
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(false)
  }

  return (
    <header
      data-testid="AppNavbar"
      className="bg-background fixed inset-x-0 z-40 flex h-14 items-center justify-between border-b px-3 md:hidden"
      style={{ top: topOffset }}
    >
      <div className="flex items-center gap-2">
        <Image
          src={minimalLogo}
          alt="Jesus Film Project"
          width={32}
          height={32}
        />
        <h1 className="text-lg font-semibold">Short Links</h1>
      </div>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Open navigation"
        onClick={handleOpen}
      >
        <MenuIcon aria-hidden="true" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetPopup side="right" data-testid="SideMenuMobile">
          <SheetHeader>
            <SheetTitle>{auth.user?.displayName ?? 'Menu'}</SheetTitle>
            <SheetDescription>{auth.user?.email ?? ''}</SheetDescription>
          </SheetHeader>
          <SheetPanel>
            <MenuContent onNavigate={handleClose} />
          </SheetPanel>
          <SheetFooter>
            <Button variant="outline" onClick={handleLogout}>
              <LogOutIcon aria-hidden="true" />
              Sign Out
            </Button>
          </SheetFooter>
        </SheetPopup>
      </Sheet>
    </header>
  )
}
