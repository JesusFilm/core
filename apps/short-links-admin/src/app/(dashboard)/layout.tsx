'use client'

import { ReactElement, ReactNode } from 'react'

import { getEnvironmentBannerHeight } from '../../libs/environment'

import { AppNavbar } from './_AppNavbar'
import { Header } from './_Header'
import { Sidebar } from './_Sidebar'

interface DashboardLayoutProps {
  children?: ReactNode
}

export default function DashboardLayout({
  children
}: DashboardLayoutProps): ReactElement {
  const environmentBannerHeight = getEnvironmentBannerHeight()

  return (
    <div
      className="bg-background flex min-h-svh"
      style={{ paddingTop: environmentBannerHeight }}
    >
      <Sidebar topOffset={environmentBannerHeight} />
      <AppNavbar topOffset={environmentBannerHeight} />
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col items-center gap-4 px-4 pt-16 pb-10 md:px-6 md:pt-0">
          <Header />
          {children}
        </div>
      </main>
    </div>
  )
}
