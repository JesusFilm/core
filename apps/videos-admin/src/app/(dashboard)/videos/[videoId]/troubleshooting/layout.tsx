'use client'

import { ReactNode } from 'react'

import { Section } from '../../../../../components/Section'

interface TroubleshootingLayoutProps {
  children: ReactNode
}

export default function TroubleshootingLayout({
  children
}: TroubleshootingLayoutProps) {
  return <Section title="Troubleshooting">{children}</Section>
}
