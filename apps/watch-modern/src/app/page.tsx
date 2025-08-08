import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { VideoCollection } from '@/components/VideoCollection'
import { VideoGridSection } from '@/components/VideoGridSection'

export const generateMetadata = async () => {
  const t = await getTranslations('RootIndexPage')
  const m = await getTranslations('Metadata')
  return {
    title: m('pageTitle', { title: t('pageTitle') }),
    description: t('description')
  }
}

export default async function RootIndexPage(): Promise<ReactElement> {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Video Collection Section */}
      <VideoCollection />

      {/* Generic Video Grid Section */}
      <VideoGridSection />
    </main>
  )
}
