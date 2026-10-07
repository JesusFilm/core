'use client'

import { ReactElement, ReactNode } from 'react'

import { Card, CardPanel } from '@/components/ui/card'

interface CenterPageProps {
  children: ReactNode
}

export function CenterPage({ children }: CenterPageProps): ReactElement {
  return (
    <div
      data-testid="CenterPageContainer"
      className="bg-muted/40 flex min-h-svh flex-col items-center justify-center gap-6 p-5"
    >
      <Card data-testid="CenterPageCard" className="w-full max-w-md">
        <CardPanel className="flex flex-col gap-4">{children}</CardPanel>
      </Card>
      <a
        href="https://www.cru.org/us/en/about/privacy.html"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground text-sm underline-offset-4 hover:underline"
      >
        Privacy Policy
      </a>
    </div>
  )
}
