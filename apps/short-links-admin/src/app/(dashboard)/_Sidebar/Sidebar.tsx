'use client'

import Image from 'next/image'
import { ReactElement } from 'react'

import minimalLogo from '../../../assets/minimal-logo.png'
import { MenuContent } from '../../../components/MenuContent'
import { OptionsMenu } from '../../../components/OptionsMenu'
import { useAuth } from '../../../libs/auth/authContext'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SidebarProps {
  topOffset: number
}

export function Sidebar({ topOffset }: SidebarProps): ReactElement {
  const auth = useAuth()
  const initials = (auth.user?.displayName ?? '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  return (
    <aside
      className="bg-sidebar text-sidebar-foreground sticky hidden w-60 shrink-0 flex-col border-r md:flex"
      style={{ top: topOffset, height: `calc(100vh - ${topOffset}px)` }}
      data-testid="Sidebar"
    >
      <div className="flex items-center gap-2 px-3 pt-3">
        <Image
          src={minimalLogo}
          alt="Jesus Film Project"
          width={37}
          height={37}
        />
        <h1 className="text-foreground text-lg font-semibold">Short Links</h1>
      </div>
      <MenuContent />
      <div className="flex items-center gap-2 border-t p-3">
        <Avatar className="size-9">
          <AvatarImage
            src={auth.user?.photoURL ?? undefined}
            alt={auth.user?.displayName ?? ''}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-medium">
            {auth.user?.displayName}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {auth.user?.email}
          </p>
        </div>
        <OptionsMenu />
      </div>
    </aside>
  )
}
