'use client'

import {
  FlaskConicalIcon,
  GlobeIcon,
  LinkIcon,
  MegaphoneIcon
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactElement, ReactNode } from 'react'

import { useShortLinkAccess } from '../../libs/useShortLinkAccess'

import { cn } from '@/lib/utils'

interface Item {
  text: string
  icon: ReactNode
  href: string
}

function isItemSelected(item: Item, pathname: string | null): boolean {
  if (pathname == null) return false
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function NavList({
  items,
  pathname,
  onNavigate
}: {
  items: Item[]
  pathname: string | null
  onNavigate?: () => void
}): ReactElement {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const selected = isItemSelected(item, pathname)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={selected ? 'page' : undefined}
              className={cn(
                'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none focus-visible:ring-2',
                selected &&
                  'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              )}
            >
              <span className="[&_svg]:size-4" aria-hidden="true">
                {item.icon}
              </span>
              {item.text}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

interface MenuContentProps {
  onNavigate?: () => void
}

export function MenuContent({ onNavigate }: MenuContentProps): ReactElement {
  const pathname = usePathname()
  const { isEditor, isAdmin, isSuperAdmin, loading } = useShortLinkAccess()
  // a superAdmin without a media role only has the domains section
  const showEditorPages = isEditor || loading

  const mainListItems: Item[] = [
    ...(showEditorPages
      ? [
          { text: 'Links', icon: <LinkIcon />, href: '/links' },
          { text: 'Campaigns', icon: <MegaphoneIcon />, href: '/campaigns' }
        ]
      : []),
    ...(isAdmin || isSuperAdmin
      ? [{ text: 'Domains', icon: <GlobeIcon />, href: '/domains' }]
      : [])
  ]

  const secondaryListItems: Item[] = showEditorPages
    ? [{ text: 'Test Redirect', icon: <FlaskConicalIcon />, href: '/test' }]
    : []

  return (
    <nav aria-label="Main" className="flex flex-1 flex-col justify-between p-2">
      <NavList
        items={mainListItems}
        pathname={pathname}
        onNavigate={onNavigate}
      />
      <NavList
        items={secondaryListItems}
        pathname={pathname}
        onNavigate={onNavigate}
      />
    </nav>
  )
}
