import { ReactElement, ReactNode } from 'react'

import { Dashboard } from './_Dashboard'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({
  children
}: DashboardLayoutProps): ReactElement {
  return <Dashboard>{children}</Dashboard>
}
