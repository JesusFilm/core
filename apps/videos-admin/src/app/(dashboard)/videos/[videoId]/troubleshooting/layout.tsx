'use client'

import Stack from '@mui/material/Stack'
import { ReactNode } from 'react'

import { Section } from '../../../../../components/Section'

import { AlgoliaTroubleshooting } from './_AlgoliaTroubleshooting/AlgoliaTroubleshooting'
import { AvailableLanguagesTroubleshooting } from './_AvailableLanguagesTroubleshooting/AvailableLanguagesTroubleshooting'

interface TroubleshootingLayoutProps {
  children: ReactNode
}

export default function TroubleshootingLayout({
  children
}: TroubleshootingLayoutProps) {
  return (
    <Section title="Troubleshooting">
      <Stack spacing={4}>
        <AvailableLanguagesTroubleshooting />
        <AlgoliaTroubleshooting />
        {children}
      </Stack>
    </Section>
  )
}
