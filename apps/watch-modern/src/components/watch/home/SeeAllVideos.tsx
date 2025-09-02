"use client"

import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

export function SeeAllVideos() {
  const t = useTranslations('RootIndexPage')

  return (
    <Container className="py-10">
      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href="#videos">{t('ctaSeeAllVideos')}</Link>
        </Button>
      </div>
    </Container>
  )
}
