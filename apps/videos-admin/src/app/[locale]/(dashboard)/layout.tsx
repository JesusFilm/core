import { DashboardLayout } from '@toolpad/core/DashboardLayout'
import { ReactElement, ReactNode } from 'react'

export default async function DashboardPagesLayout({
  children
}: {
  children: ReactNode
}): Promise<ReactElement> {
  return <DashboardLayout>{children}</DashboardLayout>
}
