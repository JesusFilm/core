import { ReactElement, ReactNode } from 'react'

import { DashboardLayout as ClientDashboardLayout } from './_DashboardLayout'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({
  children
}: DashboardLayoutProps): ReactElement {
  return <ClientDashboardLayout>{children}</ClientDashboardLayout>
}
