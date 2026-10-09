'use client'

import { HomeIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, ReactElement } from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

const LABELS: Record<string, string> = {
  links: 'Links',
  campaigns: 'Campaigns',
  domains: 'Domains',
  test: 'Test Redirect',
  new: 'New'
}

function labelFor(segment: string): string {
  return LABELS[segment] ?? segment[0].toUpperCase() + segment.slice(1)
}

export function Header(): ReactElement {
  const pathname = usePathname()
  const segments = pathname?.split('/').filter(Boolean) ?? []

  return (
    <div className="hidden w-full items-center justify-between pt-4 md:flex">
      <Breadcrumb data-testid="NavBarBreadcrumbs">
        <BreadcrumbList>
          {segments.length === 0 ? (
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1">
                <HomeIcon aria-hidden="true" className="size-4" />
                Dashboard
              </BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join('/')}`
              const isLast = index + 1 === segments.length
              return (
                <Fragment key={href}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{labelFor(segment)}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink render={<Link href={href} />}>
                        {labelFor(segment)}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
